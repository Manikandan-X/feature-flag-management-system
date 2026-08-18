from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.permissions import (
    require_admin,
    require_employee,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.feature_flag import (
    FeatureFlagCreate,
    FeatureFlagResponse,
    FeatureFlagUpdate,
)
from app.schemas.feature_flag_environment import (
    FeatureFlagEnvironmentResponse,
    FeatureFlagEnvironmentUpdate,
)
from app.services.feature_flag_service import (
    FeatureFlagService,
)


router = APIRouter(
    prefix="/feature-flags",
    tags=["Feature Flags"],
)


# -------------------------------------------------
# Create Feature Flag
# -------------------------------------------------

@router.post(
    "",
    response_model=FeatureFlagResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_feature_flag(
    data: FeatureFlagCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    service = FeatureFlagService(db)

    return service.create(
        data,
        current_user.id,
    )


# -------------------------------------------------
# Get All Feature Flags
# -------------------------------------------------

@router.get(
    "",
    response_model=list[FeatureFlagResponse],
)
def get_feature_flags(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee),
):
    service = FeatureFlagService(db)

    return service.get_all()


# -------------------------------------------------
# Get Feature Flag
# -------------------------------------------------

@router.get(
    "/{feature_flag_id}",
    response_model=FeatureFlagResponse,
)
def get_feature_flag(
    feature_flag_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee),
):
    service = FeatureFlagService(db)

    return service.get(feature_flag_id)


# -------------------------------------------------
# Update Feature Flag
# -------------------------------------------------

@router.put(
    "/{feature_flag_id}",
    response_model=FeatureFlagResponse,
)
def update_feature_flag(
    feature_flag_id: int,
    data: FeatureFlagUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    service = FeatureFlagService(db)

    return service.update(
        feature_flag_id,
        data,
        current_user.id,
    )


# -------------------------------------------------
# Configure Feature Flag Environment
# -------------------------------------------------

@router.put(
    "/{feature_flag_id}/environments/{environment_id}",
    response_model=FeatureFlagEnvironmentResponse,
)
def configure_feature_flag_environment(
    feature_flag_id: int,
    environment_id: int,
    data: FeatureFlagEnvironmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    service = FeatureFlagService(db)

    return service.configure_environment(
        feature_flag_id,
        environment_id,
        data,
        current_user.id,
    )