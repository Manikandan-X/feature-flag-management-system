from fastapi import APIRouter, Depends

from app.core.permissions import require_admin
from app.models.user import User
from app.schemas.analytics import (
    FeatureUsageAnalyticsResponse,
)
from app.services.analytics_service import (
    AnalyticsService,
)


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


@router.get(
    "/feature-usage",
    response_model=FeatureUsageAnalyticsResponse,
)
def get_feature_usage(
    feature_key: str,
    environment: str,
    current_user: User = Depends(
        require_admin
    ),
):

    return AnalyticsService.get_feature_usage(
        feature_key=feature_key,
        environment=environment,
    )