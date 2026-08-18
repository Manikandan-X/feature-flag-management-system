from typing import Any

from sqlalchemy.orm import Session

from app.core.constants import (
    AuditAction,
    AuditEntityType,
)
from app.models.audit_log import AuditLog
from app.repositories.audit_log_repository import (
    AuditLogRepository,
)


class AuditLogService:

    def __init__(self, db: Session):

        self.repository = AuditLogRepository(db)

    def log(
        self,
        user_id: int | None,
        action: AuditAction,
        entity_type: AuditEntityType,
        entity_id: int,
        old_value: dict[str, Any] | None = None,
        new_value: dict[str, Any] | None = None,
    ) -> AuditLog:

        audit_log = AuditLog(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            old_value=old_value,
            new_value=new_value,
        )

        return self.repository.create(
            audit_log
        )