from sqlalchemy.orm import Session

from app.core.constants import (
    AuditAction,
    AuditEntityType,
)
from app.exceptions.environment import (
    EnvironmentAlreadyExistsException,
    EnvironmentNotFoundException,
)
from app.models.environment import Environment
from app.repositories.audit_log_repository import (
    AuditLogRepository,
)
from app.repositories.environment_repository import (
    EnvironmentRepository,
)
from app.schemas.environment import (
    EnvironmentCreate,
    EnvironmentUpdate,
)
from app.services.audit_log_service import (
    AuditLogService,
)


class EnvironmentService:

    def __init__(self, db: Session):

        self.db = db

        self.repository = EnvironmentRepository(db)

        self.audit_repository = (
            AuditLogRepository(db)
        )

        self.audit_service = (
            AuditLogService(db)
        )

    # -------------------------------------------------
    # Create Environment
    # -------------------------------------------------

    def create(
        self,
        data: EnvironmentCreate,
        user_id: int,
    ) -> Environment:

        existing = self.repository.get_by_name(
            data.name
        )

        if existing:
            raise EnvironmentAlreadyExistsException()

        environment = Environment(
            name=data.name,
            description=data.description,
            is_active=True,
        )

        environment = self.repository.create(
            environment
        )

        self.db.flush()

        # -------------------------------------------------
        # Audit CREATE
        # -------------------------------------------------

        self.audit_service.log(
            user_id=user_id,
            action=AuditAction.CREATE,
            entity_type=AuditEntityType.ENVIRONMENT,
            entity_id=environment.id,
            old_value=None,
            new_value={
                "name": environment.name,
                "description": environment.description,
                "is_active": environment.is_active,
            },
        )

        self.db.commit()

        self.db.refresh(environment)

        return environment

    # -------------------------------------------------
    # Get Environment
    # -------------------------------------------------

    def get(
        self,
        environment_id: int,
    ) -> Environment:

        environment = self.repository.get_by_id(
            environment_id
        )

        if not environment:
            raise EnvironmentNotFoundException()

        return environment

    # -------------------------------------------------
    # Get All Environments
    # -------------------------------------------------

    def get_all(self) -> list[Environment]:

        return self.repository.get_all()

    # -------------------------------------------------
    # Get Active Environments
    # -------------------------------------------------

    def get_active(self) -> list[Environment]:

        return self.repository.get_active()

    # -------------------------------------------------
    # Update Environment
    # -------------------------------------------------

    def update(
        self,
        environment_id: int,
        data: EnvironmentUpdate,
        user_id: int,
    ) -> Environment:

        environment = self.repository.get_by_id(
            environment_id
        )

        if not environment:
            raise EnvironmentNotFoundException()

        # -------------------------------------------------
        # Capture old values BEFORE modification
        # -------------------------------------------------

        old_value = {
            "name": environment.name,
            "description": environment.description,
            "is_active": environment.is_active,
        }

        if data.name is not None:

            existing = self.repository.get_by_name(
                data.name
            )

            if (
                existing
                and existing.id != environment.id
            ):
                raise EnvironmentAlreadyExistsException()

            environment.name = data.name

        if data.description is not None:
            environment.description = data.description

        if data.is_active is not None:
            environment.is_active = data.is_active

        environment = self.repository.save(
            environment
        )

        self.db.flush()

        # -------------------------------------------------
        # Capture new values AFTER modification
        # -------------------------------------------------

        new_value = {
            "name": environment.name,
            "description": environment.description,
            "is_active": environment.is_active,
        }

        # -------------------------------------------------
        # Audit UPDATE
        # -------------------------------------------------

        self.audit_service.log(
            user_id=user_id,
            action=AuditAction.UPDATE,
            entity_type=AuditEntityType.ENVIRONMENT,
            entity_id=environment.id,
            old_value=old_value,
            new_value=new_value,
        )

        self.db.commit()

        self.db.refresh(environment)

        return environment