from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.permissions import require_admin
from app.db.session import get_db
from app.models.user import User
from app.schemas.feature_schedule import (
    FeatureScheduleRequest,
    FeatureScheduleResponse,
)
from app.services.feature_schedule_service import (
    FeatureScheduleService,
)


router = APIRouter(
    prefix="/feature-flags",
    tags=["Feature Scheduling"],
)


@router.put(
    "/{feature_flag_id}/environments/{environment_id}/schedule",
    response_model=FeatureScheduleResponse,
)
def update_feature_schedule(
    feature_flag_id: int,
    environment_id: int,
    data: FeatureScheduleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):

    service = FeatureScheduleService(db)

    return service.update_schedule(
        feature_flag_id=feature_flag_id,
        environment_id=environment_id,
        data=data,
        user_id=current_user.id,
    )