from datetime import datetime
from typing import Any

from sqlalchemy.orm import Session

from app.core.constants import (
    AuditAction,
    AuditEntityType,
)
from app.exceptions.rollback import (
    AuditLogNotFoundException,
    RollbackDataUnavailableException,
    RollbackEntityNotFoundException,
    RollbackNotSupportedException,
)
from app.models.audit_log import AuditLog
from app.models.feature_flag import FeatureFlag
from app.models.feature_flag_environment import (
    FeatureFlagEnvironment,
)
from app.models.feature_rollout import FeatureRollout
from app.models.user_assignment import UserAssignment
from app.repositories.audit_log_repository import (
    AuditLogRepository,
)
from app.repositories.feature_flag_repository import (
    FeatureFlagRepository,
)
from app.repositories.feature_rollout_repository import (
    FeatureRolloutRepository,
)
from app.repositories.feature_schedule_repository import (
    FeatureScheduleRepository,
)
from app.repositories.user_assignment_repository import (
    UserAssignmentRepository,
)
from app.services.audit_log_service import (
    AuditLogService,
)


class RollbackService:

    def __init__(self, db: Session):

        self.db = db

        self.audit_repository = (
            AuditLogRepository(db)
        )

        self.audit_service = (
            AuditLogService(db)
        )

        self.feature_flag_repository = (
            FeatureFlagRepository(db)
        )

        self.feature_rollout_repository = (
            FeatureRolloutRepository(db)
        )

        self.feature_schedule_repository = (
            FeatureScheduleRepository(db)
        )

        self.user_assignment_repository = (
            UserAssignmentRepository(db)
        )

    # =================================================
    # Main Rollback
    # =================================================

    def rollback(
        self,
        audit_log_id: int,
        user_id: int,
    ) -> AuditLog:

        audit_log = (
            self.audit_repository.get_by_id(
                audit_log_id
            )
        )

        if not audit_log:
            raise AuditLogNotFoundException()

        # -------------------------------------------------
        # Rollback only state-changing actions
        # -------------------------------------------------

        supported_actions = (
            AuditAction.UPDATE,
            AuditAction.ENABLE,
            AuditAction.DISABLE,
            AuditAction.SCHEDULE,
            AuditAction.ROLLOUT_UPDATE,
            AuditAction.USER_ASSIGNMENT,
        )

        if audit_log.action not in supported_actions:
            raise RollbackNotSupportedException()

        if audit_log.old_value is None:
            raise RollbackDataUnavailableException()

        # -------------------------------------------------
        # Get current state before rollback
        # -------------------------------------------------

        current_value = self._get_current_value(
            audit_log
        )

        # -------------------------------------------------
        # Restore old state
        # -------------------------------------------------

        restored_value = self._restore_old_value(
            audit_log
        )

        # -------------------------------------------------
        # Create rollback audit
        # -------------------------------------------------

        rollback_log = self.audit_service.log(
            user_id=user_id,
            action=AuditAction.ROLLBACK,
            entity_type=audit_log.entity_type,
            entity_id=audit_log.entity_id,
            old_value=current_value,
            new_value=restored_value,
        )

        self.db.commit()

        self.db.refresh(rollback_log)

        return rollback_log

    # =================================================
    # Get Current State
    # =================================================

    def _get_current_value(
        self,
        audit_log: AuditLog,
    ) -> dict[str, Any]:

        old_value = audit_log.old_value

        # -------------------------------------------------
        # Make sure old_value exists
        # -------------------------------------------------

        if old_value is None:
            raise RollbackDataUnavailableException()

        # -------------------------------------------------
        # Feature Flag UPDATE
        # -------------------------------------------------

        if (
            audit_log.entity_type
            == AuditEntityType.FEATURE_FLAG
            and audit_log.action
            == AuditAction.UPDATE
        ):

            feature_flag = (
                self.feature_flag_repository.get_by_id(
                    audit_log.entity_id
                )
            )

            if not feature_flag:
                raise RollbackEntityNotFoundException()

            return {
                "name": feature_flag.name,
                "description": feature_flag.description,
            }

        # -------------------------------------------------
        # Feature Flag ENABLE / DISABLE
        # -------------------------------------------------

        if (
            audit_log.entity_type
            == AuditEntityType.FEATURE_FLAG
            and audit_log.action
            in (
                AuditAction.ENABLE,
                AuditAction.DISABLE,
            )
        ):

            environment_id = old_value.get(
                "environment_id"
            )

            if not isinstance(environment_id, int):
                raise RollbackDataUnavailableException()

            configuration = (
                self.feature_flag_repository
                .get_environment_configuration(
                    audit_log.entity_id,
                    environment_id,
                )
            )

            if not configuration:
                raise RollbackEntityNotFoundException()

            return {
                "environment_id": configuration.environment_id,
                "enabled": configuration.enabled,
            }

        # -------------------------------------------------
        # Feature Schedule
        # -------------------------------------------------

        if (
            audit_log.entity_type
            == AuditEntityType.FEATURE_FLAG
            and audit_log.action
            == AuditAction.SCHEDULE
        ):

            environment_id = old_value.get(
                "environment_id"
            )

            if not isinstance(environment_id, int):
                raise RollbackDataUnavailableException()

            configuration = (
                self.feature_schedule_repository
                .get_by_feature_and_environment(
                    audit_log.entity_id,
                    environment_id,
                )
            )

            if not configuration:
                raise RollbackEntityNotFoundException()

            return self._schedule_value(
                configuration
            )

        # -------------------------------------------------
        # Feature Rollout
        # -------------------------------------------------

        if (
            audit_log.entity_type
            == AuditEntityType.FEATURE_ROLLOUT
        ):

            # entity_id is the FeatureRollout ID.
            # We already store it in audit_log.entity_id,
            # so there is no need to read feature_flag_id
            # from old_value.

            rollout = self.db.get(
                FeatureRollout,
                audit_log.entity_id,
            )

            if not rollout:
                raise RollbackEntityNotFoundException()

            return {
                "environment_id": rollout.environment_id,
                "percentage": rollout.percentage,
            }

        # -------------------------------------------------
        # User Assignment
        # -------------------------------------------------

        if (
            audit_log.entity_type
            == AuditEntityType.USER_ASSIGNMENT
        ):

            assignment = (
                self.user_assignment_repository
                .get_by_id(
                    audit_log.entity_id
                )
            )

            if not assignment:
                raise RollbackEntityNotFoundException()

            return {
                "user_id": assignment.user_id,
                "feature_flag_id": assignment.feature_flag_id,
                "environment_id": assignment.environment_id,
                "enabled": assignment.enabled,
            }

        # -------------------------------------------------
        # Unsupported
        # -------------------------------------------------

        raise RollbackNotSupportedException()
    # =================================================
    # Restore Old State
    # =================================================

    def _restore_old_value(
        self,
        audit_log: AuditLog,
    ) -> dict[str, Any]:

        old_value = audit_log.old_value

        if old_value is None:
            raise RollbackDataUnavailableException()

        # -------------------------------------------------
        # Feature Flag UPDATE
        # -------------------------------------------------

        if (
            audit_log.entity_type
            == AuditEntityType.FEATURE_FLAG
            and audit_log.action
            == AuditAction.UPDATE
        ):

            feature_flag = (
                self.feature_flag_repository.get_by_id(
                    audit_log.entity_id
                )
            )

            if not feature_flag:
                raise RollbackEntityNotFoundException()

            if "name" in old_value:
                feature_flag.name = old_value["name"]

            if "description" in old_value:
                feature_flag.description = (
                    old_value["description"]
                )

            self.db.flush()

            return {
                "name": feature_flag.name,
                "description": feature_flag.description,
            }

        # -------------------------------------------------
        # Feature Flag ENABLE / DISABLE
        # -------------------------------------------------

        if (
            audit_log.entity_type
            == AuditEntityType.FEATURE_FLAG
            and audit_log.action
            in (
                AuditAction.ENABLE,
                AuditAction.DISABLE,
            )
        ):

            environment_id = (
                old_value.get(
                    "environment_id"
                )
            )

            if environment_id is None:
                raise RollbackDataUnavailableException()

            configuration = (
                self.feature_flag_repository
                .get_environment_configuration(
                    audit_log.entity_id,
                    environment_id,
                )
            )

            if not configuration:
                raise RollbackEntityNotFoundException()

            if "enabled" not in old_value:
                raise RollbackDataUnavailableException()

            configuration.enabled = (
                old_value["enabled"]
            )

            self.db.flush()

            return {
                "environment_id": (
                    configuration.environment_id
                ),
                "enabled": configuration.enabled,
            }

        # -------------------------------------------------
        # Feature Schedule
        # -------------------------------------------------

        if (
            audit_log.entity_type
            == AuditEntityType.FEATURE_FLAG
            and audit_log.action
            == AuditAction.SCHEDULE
        ):

            environment_id = (
                old_value.get(
                    "environment_id"
                )
            )

            if environment_id is None:
                raise RollbackDataUnavailableException()

            configuration = (
                self.feature_schedule_repository
                .get_by_feature_and_environment(
                    audit_log.entity_id,
                    environment_id,
                )
            )

            if not configuration:
                raise RollbackEntityNotFoundException()

            configuration.scheduled_start_at = (
                self._parse_datetime(
                    old_value.get(
                        "scheduled_start_at"
                    )
                )
            )

            configuration.scheduled_end_at = (
                self._parse_datetime(
                    old_value.get(
                        "scheduled_end_at"
                    )
                )
            )

            self.db.flush()

            return self._schedule_value(
                configuration
            )

        # -------------------------------------------------
        # Feature Rollout
        # -------------------------------------------------

        if (
            audit_log.entity_type
            == AuditEntityType.FEATURE_ROLLOUT
            and audit_log.action
            == AuditAction.ROLLOUT_UPDATE
        ):

            rollout = self.db.get(
                FeatureRollout,
                audit_log.entity_id,
            )

            if not rollout:
                raise RollbackEntityNotFoundException()

            if "percentage" not in old_value:
                raise RollbackDataUnavailableException()

            rollout.percentage = old_value[
                "percentage"
            ]

            self.db.flush()

            return {
                "environment_id": rollout.environment_id,
                "percentage": rollout.percentage,
            }

        # -------------------------------------------------
        # User Assignment
        # -------------------------------------------------

        if (
            audit_log.entity_type
            == AuditEntityType.USER_ASSIGNMENT
            and audit_log.action
            == AuditAction.USER_ASSIGNMENT
        ):

            assignment = (
                self.user_assignment_repository
                .get_by_id(
                    audit_log.entity_id
                )
            )

            if not assignment:
                raise RollbackEntityNotFoundException()

            if "enabled" not in old_value:
                raise RollbackDataUnavailableException()

            assignment.enabled = old_value[
                "enabled"
            ]

            self.db.flush()

            return {
                "user_id": assignment.user_id,
                "feature_flag_id": (
                    assignment.feature_flag_id
                ),
                "environment_id": (
                    assignment.environment_id
                ),
                "enabled": assignment.enabled,
            }

        raise RollbackNotSupportedException()

    # =================================================
    # Schedule Serialization
    # =================================================

    @staticmethod
    def _schedule_value(
        configuration: FeatureFlagEnvironment,
    ) -> dict[str, Any]:

        return {
            "environment_id": (
                configuration.environment_id
            ),
            "scheduled_start_at": (
                configuration.scheduled_start_at.isoformat()
                if configuration.scheduled_start_at
                else None
            ),
            "scheduled_end_at": (
                configuration.scheduled_end_at.isoformat()
                if configuration.scheduled_end_at
                else None
            ),
        }

    # =================================================
    # Datetime Parser
    # =================================================

    @staticmethod
    def _parse_datetime(
        value: str | None,
    ) -> datetime | None:

        if value is None:
            return None

        return datetime.fromisoformat(value)