from sqlalchemy.orm import Session

from app.core.constants import (
    AuditAction,
    AuditEntityType,
)
from app.exceptions.environment import (
    EnvironmentNotFoundException,
)
from app.exceptions.feature_flag import (
    FeatureFlagAlreadyExistsException,
    FeatureFlagNotFoundException,
)
from app.models.feature_flag import FeatureFlag
from app.models.feature_flag_environment import (
    FeatureFlagEnvironment,
)
from app.repositories.audit_log_repository import (
    AuditLogRepository,
)
from app.repositories.environment_repository import (
    EnvironmentRepository,
)
from app.repositories.feature_flag_repository import (
    FeatureFlagRepository,
)
from app.schemas.feature_flag import (
    FeatureFlagCreate,
    FeatureFlagUpdate,
)
from app.schemas.feature_flag_environment import (
    FeatureFlagEnvironmentUpdate,
)
from app.services.audit_log_service import (
    AuditLogService,
)


class FeatureFlagService:

    def __init__(self, db: Session):

        self.db = db

        self.repository = FeatureFlagRepository(
            db
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

    # -------------------------------------------------
    # Create Feature Flag
    # -------------------------------------------------

    def create(
        self,
        data: FeatureFlagCreate,
        user_id: int,
    ) -> FeatureFlag:

        existing = self.repository.get_by_key(
            data.key
        )

        if existing:
            raise FeatureFlagAlreadyExistsException()

        feature_flag = FeatureFlag(
            name=data.name,
            key=data.key,
            description=data.description,
            created_by=user_id,
        )

        feature_flag = self.repository.create(
            feature_flag
        )

        self.db.flush()

        # Create audit log
        self.audit_service.log(
            user_id=user_id,
            action=AuditAction.CREATE,
            entity_type=AuditEntityType.FEATURE_FLAG,
            entity_id=feature_flag.id,
            old_value=None,
            new_value={
                "name": feature_flag.name,
                "key": feature_flag.key,
                "description": feature_flag.description,
                "created_by": feature_flag.created_by,
            },
        )

        self.db.commit()

        self.db.refresh(feature_flag)

        return feature_flag

    # -------------------------------------------------
    # Get Feature Flag
    # -------------------------------------------------

    def get(
        self,
        feature_flag_id: int,
    ) -> FeatureFlag:

        feature_flag = self.repository.get_by_id(
            feature_flag_id
        )

        if not feature_flag:
            raise FeatureFlagNotFoundException()

        return feature_flag

    # -------------------------------------------------
    # Get All Feature Flags
    # -------------------------------------------------

    def get_all(self) -> list[FeatureFlag]:

        return self.repository.get_all()

    # -------------------------------------------------
    # Update Feature Flag
    # -------------------------------------------------

    def update(
        self,
        feature_flag_id: int,
        data: FeatureFlagUpdate,
        user_id: int,
    ) -> FeatureFlag:

        feature_flag = self.repository.get_by_id(
            feature_flag_id
        )

        if not feature_flag:
            raise FeatureFlagNotFoundException()

        # Capture old values BEFORE changing them
        old_value = {
            "name": feature_flag.name,
            "description": feature_flag.description,
        }

        if data.name is not None:
            feature_flag.name = data.name

        if data.description is not None:
            feature_flag.description = (
                data.description
            )

        feature_flag = self.repository.save(
            feature_flag
        )

        self.db.flush()

        # Capture new values AFTER changing them
        new_value = {
            "name": feature_flag.name,
            "description": feature_flag.description,
        }

        self.audit_service.log(
            user_id=user_id,
            action=AuditAction.UPDATE,
            entity_type=AuditEntityType.FEATURE_FLAG,
            entity_id=feature_flag.id,
            old_value=old_value,
            new_value=new_value,
        )

        self.db.commit()

        self.db.refresh(feature_flag)

        return feature_flag

    # -------------------------------------------------
    # Configure Feature Flag Environment
    # -------------------------------------------------

    def configure_environment(
        self,
        feature_flag_id: int,
        environment_id: int,
        data: FeatureFlagEnvironmentUpdate,
        user_id: int,
    ) -> FeatureFlagEnvironment:

        feature_flag = self.repository.get_by_id(
            feature_flag_id
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

        existing = (
            self.repository.get_environment_configuration(
                feature_flag_id,
                environment_id,
            )
        )

        # -------------------------------------------------
        # Existing configuration
        # -------------------------------------------------

        if existing:

            old_enabled = existing.enabled

            existing.enabled = data.enabled

            self.db.flush()

            # Only create an audit record if the state
            # actually changed.
            if old_enabled != existing.enabled:

                action = (
                    AuditAction.ENABLE
                    if existing.enabled
                    else AuditAction.DISABLE
                )

                self.audit_service.log(
                    user_id=user_id,
                    action=action,
                    entity_type=(
                        AuditEntityType.FEATURE_FLAG
                    ),
                    entity_id=feature_flag_id,
                    old_value={
                        "environment_id": environment_id,
                        "enabled": old_enabled,
                    },
                    new_value={
                        "environment_id": environment_id,
                        "enabled": existing.enabled,
                    },
                )

            self.db.commit()

            self.db.refresh(existing)

            return existing

        # -------------------------------------------------
        # New environment configuration
        # -------------------------------------------------

        configuration = FeatureFlagEnvironment(
            feature_flag_id=feature_flag_id,
            environment_id=environment_id,
            enabled=data.enabled,
        )

        configuration = (
            self.repository.create_environment_configuration(
                configuration
            )
        )

        self.db.flush()

        # New configuration is effectively an
        # ENABLE or DISABLE action.
        action = (
            AuditAction.ENABLE
            if configuration.enabled
            else AuditAction.DISABLE
        )

        self.audit_service.log(
            user_id=user_id,
            action=action,
            entity_type=AuditEntityType.FEATURE_FLAG,
            entity_id=feature_flag_id,
            old_value=None,
            new_value={
                "environment_id": environment_id,
                "enabled": configuration.enabled,
            },
        )

        self.db.commit()

        self.db.refresh(configuration)

        return configuration