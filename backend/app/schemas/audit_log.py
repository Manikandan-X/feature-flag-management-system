from datetime import datetime
from typing import Any

from pydantic import BaseModel

from app.core.constants import (
    AuditAction,
    AuditEntityType,
)


class AuditLogResponse(BaseModel):

    id: int
    user_id: int | None

    action: AuditAction
    entity_type: AuditEntityType
    entity_id: int

    old_value: dict[str, Any] | None
    new_value: dict[str, Any] | None

    created_at: datetime

    model_config = {
        "from_attributes": True,
    }