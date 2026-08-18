from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.permissions import require_employee
from app.db.session import get_db
from app.models.user import User
from app.schemas.dashboard import (
    DashboardEnvironmentResponse,
    DashboardFeatureResponse,
    DashboardRolloutResponse,
    DashboardSummaryResponse,
)
from app.services.dashboard_service import (
    DashboardService,
)


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


# -------------------------------------------------
# Dashboard Summary
# -------------------------------------------------

@router.get(
    "/summary",
    response_model=DashboardSummaryResponse,
)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_employee
    ),
):

    service = DashboardService(db)

    return service.get_summary()


# -------------------------------------------------
# Feature Status
# -------------------------------------------------

@router.get(
    "/features",
    response_model=list[DashboardFeatureResponse],
)
def get_dashboard_features(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_employee
    ),
):

    service = DashboardService(db)

    return service.get_features()


# -------------------------------------------------
# Rollout Statistics
# -------------------------------------------------

@router.get(
    "/rollouts",
    response_model=list[DashboardRolloutResponse],
)
def get_dashboard_rollouts(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_employee
    ),
):

    service = DashboardService(db)

    return service.get_rollouts()


# -------------------------------------------------
# Environment Summary
# -------------------------------------------------

@router.get(
    "/environments",
    response_model=list[
        DashboardEnvironmentResponse
    ],
)
def get_dashboard_environments(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_employee
    ),
):

    service = DashboardService(db)

    return service.get_environments()