from sqlalchemy.orm import Session

from app.core.constants import (
    AuditAction,
    AuditEntityType,
)
from app.exceptions.environment import (
    EnvironmentNotFoundException,
)
from app.exceptions.feature_flag import (
    FeatureFlagNotFoundException,
)
from app.models.feature_rollout import FeatureRollout
from app.repositories.audit_log_repository import (
    AuditLogRepository,
)
from app.repositories.environment_repository import (
    EnvironmentRepository,
)
from app.repositories.feature_flag_repository import (
    FeatureFlagRepository,
)
from app.repositories.feature_rollout_repository import (
    FeatureRolloutRepository,
)
from app.schemas.feature_rollout import (
    FeatureRolloutCreate,
)
from app.services.audit_log_service import (
    AuditLogService,
)


class FeatureRolloutService:

    def __init__(self, db: Session):

        self.db = db

        self.repository = FeatureRolloutRepository(
            db
        )

        self.feature_flag_repository = (
            FeatureFlagRepository(db)
        )

        self.environment_repository = (
            EnvironmentRepository(db)
        )

        self.audit_repository = (
            AuditLogRepository(db)
        )

        self.audit_service = (
            AuditLogService(db)
        )

    def create_or_update(
        self,
        feature_flag_id: int,
        environment_id: int,
        data: FeatureRolloutCreate,
        user_id: int,
    ) -> FeatureRollout:

        feature_flag = (
            self.feature_flag_repository.get_by_id(
                feature_flag_id
            )
        )

        if not feature_flag:
            raise FeatureFlagNotFoundException()

        environment = (
            self.environment_repository.get_by_id(
                environment_id
            )
        )

        if not environment:
            raise EnvironmentNotFoundException()

        rollout = (
            self.repository.get_by_feature_and_environment(
                feature_flag_id,
                environment_id,
            )
        )

        # -------------------------------------------------
        # Existing rollout
        # -------------------------------------------------

        if rollout:

            old_value = {
                "environment_id": environment_id,
                "percentage": rollout.percentage,
            }

            rollout.percentage = data.percentage

            rollout = self.repository.save(
                rollout
            )

            self.db.flush()

            new_value = {
                "environment_id": environment_id,
                "percentage": rollout.percentage,
            }

        # -------------------------------------------------
        # New rollout
        # -------------------------------------------------

        else:

            rollout = FeatureRollout(
                feature_flag_id=feature_flag_id,
                environment_id=environment_id,
                percentage=data.percentage,
            )

            rollout = self.repository.create(
                rollout
            )

            self.db.flush()

            old_value = None

            new_value = {
                "environment_id": environment_id,
                "percentage": rollout.percentage,
            }

        # -------------------------------------------------
        # Audit
        # -------------------------------------------------

        self.audit_service.log(
            user_id=user_id,
            action=AuditAction.ROLLOUT_UPDATE,
            entity_type=AuditEntityType.FEATURE_ROLLOUT,
            entity_id=rollout.id,
            old_value=old_value,
            new_value=new_value,
        )

        self.db.commit()

        self.db.refresh(rollout)

        return rollout