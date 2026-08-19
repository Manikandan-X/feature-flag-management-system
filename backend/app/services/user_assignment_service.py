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
from app.exceptions.user_assignment import (
    UserAssignmentNotFoundException,
    UserNotFoundForAssignmentException,
)
from app.models.user_assignment import UserAssignment
from app.repositories.audit_log_repository import (
    AuditLogRepository,
)
from app.repositories.environment_repository import (
    EnvironmentRepository,
)
from app.repositories.feature_flag_repository import (
    FeatureFlagRepository,
)
from app.repositories.user_assignment_repository import (
    UserAssignmentRepository,
)
from app.repositories.user_repository import (
    UserRepository,
)
from app.schemas.user_assignment import (
    UserAssignmentCreate,
)
from app.services.audit_log_service import (
    AuditLogService,
)


class UserAssignmentService:

    def __init__(self, db: Session):

        self.db = db

        self.repository = UserAssignmentRepository(
            db
        )

        self.feature_flag_repository = (
            FeatureFlagRepository(db)
        )

        self.environment_repository = (
            EnvironmentRepository(db)
        )

        self.user_repository = UserRepository(db)

        self.audit_repository = (
            AuditLogRepository(db)
        )

        self.audit_service = (
            AuditLogService(db)
        )

    # -------------------------------------------------
    # Create / Update User Assignment
    # -------------------------------------------------

    def create_or_update(
        self,
        feature_flag_id: int,
        environment_id: int,
        data: UserAssignmentCreate,
        user_id: int,
    ) -> UserAssignment:

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

        user = self.user_repository.get_by_id(
            data.user_id
        )

        if not user:
            raise UserNotFoundForAssignmentException()

        assignment = (
            self.repository.get_by_user_feature_environment(
                data.user_id,
                feature_flag_id,
                environment_id,
            )
        )

        # -------------------------------------------------
        # Existing assignment
        # -------------------------------------------------

        if assignment:

            old_value = {
                "user_id": assignment.user_id,
                "feature_flag_id": assignment.feature_flag_id,
                "environment_id": assignment.environment_id,
                "enabled": assignment.enabled,
            }

            assignment.enabled = data.enabled

            assignment = self.repository.save(
                assignment
            )

            self.db.flush()

            new_value = {
                "user_id": assignment.user_id,
                "feature_flag_id": assignment.feature_flag_id,
                "environment_id": assignment.environment_id,
                "enabled": assignment.enabled,
            }

        # -------------------------------------------------
        # New assignment
        # -------------------------------------------------

        else:

            assignment = UserAssignment(
                user_id=data.user_id,
                feature_flag_id=feature_flag_id,
                environment_id=environment_id,
                enabled=data.enabled,
            )

            assignment = self.repository.create(
                assignment
            )

            self.db.flush()

            old_value = None

            new_value = {
                "user_id": assignment.user_id,
                "feature_flag_id": assignment.feature_flag_id,
                "environment_id": assignment.environment_id,
                "enabled": assignment.enabled,
            }

        # -------------------------------------------------
        # Audit
        # -------------------------------------------------

        self.audit_service.log(
            user_id=user_id,
            action=AuditAction.USER_ASSIGNMENT,
            entity_type=AuditEntityType.USER_ASSIGNMENT,
            entity_id=assignment.id,
            old_value=old_value,
            new_value=new_value,
        )

        self.db.commit()

        self.db.refresh(assignment)

        return assignment

    # -------------------------------------------------
    # List User Assignments for a Feature Flag + Environment (added)
    # -------------------------------------------------

    def get_by_feature_environment(
        self,
        feature_flag_id: int,
        environment_id: int,
    ) -> list[UserAssignment]:

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

        return self.repository.get_by_feature_environment(
            feature_flag_id,
            environment_id,
        )

    # -------------------------------------------------
    # Delete User Assignment
    # -------------------------------------------------

    def delete(
        self,
        assignment_id: int,
        user_id: int,
    ) -> None:

        assignment = self.repository.get_by_id(
            assignment_id
        )

        if not assignment:
            raise UserAssignmentNotFoundException()

        # Capture assignment before deleting
        old_value = {
            "user_id": assignment.user_id,
            "feature_flag_id": assignment.feature_flag_id,
            "environment_id": assignment.environment_id,
            "enabled": assignment.enabled,
        }

        self.repository.delete(assignment)

        self.db.flush()

        self.audit_service.log(
            user_id=user_id,
            action=AuditAction.USER_ASSIGNMENT_DELETE,
            entity_type=AuditEntityType.USER_ASSIGNMENT,
            entity_id=assignment_id,
            old_value=old_value,
            new_value=None,
        )

        self.db.commit()