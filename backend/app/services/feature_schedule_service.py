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
from app.exceptions.feature_schedule import (
    FeatureScheduleNotFoundException,
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
from app.repositories.feature_schedule_repository import (
    FeatureScheduleRepository,
)
from app.schemas.feature_schedule import (
    FeatureScheduleRequest,
)
from app.services.audit_log_service import (
    AuditLogService,
)


class FeatureScheduleService:

    def __init__(self, db: Session):

        self.db = db

        self.repository = FeatureScheduleRepository(
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

    def update_schedule(
        self,
        feature_flag_id: int,
        environment_id: int,
        data: FeatureScheduleRequest,
        user_id: int,
    ):

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

        configuration = (
            self.repository.get_by_feature_and_environment(
                feature_flag_id,
                environment_id,
            )
        )

        if not configuration:
            raise FeatureScheduleNotFoundException()

        # Capture old schedule
        old_value = {
            "environment_id": environment_id,
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

        configuration.scheduled_start_at = (
            data.scheduled_start_at
        )

        configuration.scheduled_end_at = (
            data.scheduled_end_at
        )

        configuration = self.repository.save(
            configuration
        )

        self.db.flush()

        # Capture new schedule
        new_value = {
            "environment_id": environment_id,
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

        self.audit_service.log(
            user_id=user_id,
            action=AuditAction.SCHEDULE,
            entity_type=AuditEntityType.FEATURE_FLAG,
            entity_id=feature_flag_id,
            old_value=old_value,
            new_value=new_value,
        )

        self.db.commit()

        self.db.refresh(configuration)

        return configuration