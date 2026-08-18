from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.constants import AuditEntityType
from app.core.permissions import require_admin
from app.db.session import get_db
from app.models.user import User
from app.repositories.audit_log_repository import (
    AuditLogRepository,
)
from app.schemas.audit_log import AuditLogResponse
from app.services.rollback_service import (
    RollbackService,
)


router = APIRouter(
    prefix="/audit-logs",
    tags=["Audit Logs"],
)


# -------------------------------------------------
# Get all audit logs
# -------------------------------------------------

@router.get(
    "",
    response_model=list[AuditLogResponse],
)
def get_audit_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_admin
    ),
):

    repository = AuditLogRepository(db)

    return repository.get_all()


# -------------------------------------------------
# Get entity change history
# -------------------------------------------------

@router.get(
    "/entity/{entity_type}/{entity_id}",
    response_model=list[AuditLogResponse],
)
def get_entity_history(
    entity_type: AuditEntityType,
    entity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_admin
    ),
):

    repository = AuditLogRepository(db)

    return repository.get_by_entity(
        entity_type=entity_type,
        entity_id=entity_id,
    )


# -------------------------------------------------
# Get user's audit history
# -------------------------------------------------

@router.get(
    "/user/{user_id}",
    response_model=list[AuditLogResponse],
)
def get_user_history(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_admin
    ),
):

    repository = AuditLogRepository(db)

    return repository.get_by_user(
        user_id=user_id
    )


# -------------------------------------------------
# Rollback an audit change
# -------------------------------------------------

@router.post(
    "/{audit_log_id}/rollback",
    response_model=AuditLogResponse,
)
def rollback_audit_log(
    audit_log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_admin
    ),
):

    service = RollbackService(db)

    return service.rollback(
        audit_log_id=audit_log_id,
        user_id=current_user.id,
    )