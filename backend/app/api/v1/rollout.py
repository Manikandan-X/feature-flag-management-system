from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.permissions import require_admin
from app.db.session import get_db
from app.models.user import User
from app.schemas.feature_rollout import (
    FeatureRolloutCreate,
    FeatureRolloutResponse,
)
from app.schemas.user_assignment import (
    UserAssignmentCreate,
    UserAssignmentResponse,
)
from app.services.feature_rollout_service import (
    FeatureRolloutService,
)
from app.services.user_assignment_service import (
    UserAssignmentService,
)


router = APIRouter(
    prefix="/feature-flags",
    tags=["Feature Rollouts & Targeting"],
)


# -------------------------------------------------
# Feature Rollout
# -------------------------------------------------

@router.put(
    "/{feature_flag_id}/environments/{environment_id}/rollout",
    response_model=FeatureRolloutResponse,
)
def configure_rollout(
    feature_flag_id: int,
    environment_id: int,
    data: FeatureRolloutCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    service = FeatureRolloutService(db)

    return service.create_or_update(
        feature_flag_id,
        environment_id,
        data,
        current_user.id,
    )


# -------------------------------------------------
# User Assignment
# -------------------------------------------------

@router.put(
    "/{feature_flag_id}/environments/{environment_id}/users",
    response_model=UserAssignmentResponse,
)
def configure_user_assignment(
    feature_flag_id: int,
    environment_id: int,
    data: UserAssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    service = UserAssignmentService(db)

    return service.create_or_update(
        feature_flag_id,
        environment_id,
        data,
        current_user.id,
    )


# -------------------------------------------------
# Delete User Assignment
# -------------------------------------------------

@router.delete(
    "/user-assignments/{assignment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_user_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    service = UserAssignmentService(db)

    service.delete(
        assignment_id,
        current_user.id,
    )

    return None