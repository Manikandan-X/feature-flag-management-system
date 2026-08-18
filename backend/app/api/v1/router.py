from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.environment import router as environment_router
from app.api.v1.feature_flag import router as feature_flag_router
from app.api.v1.rollout import router as rollout_router
from app.api.v1.feature_evaluation import router as feature_evaluation_router
from app.api.v1.feature_schedule import router as feature_schedule_router
from app.api.v1.audit_log import router as audit_log_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.dashboard import router as dashboard_router








api_router = APIRouter()

api_router.include_router(
    auth_router,
)
api_router.include_router(
    environment_router,
)
api_router.include_router(
    feature_flag_router,
)
api_router.include_router(
    rollout_router,
)
api_router.include_router(
    feature_evaluation_router,
)
api_router.include_router(
    feature_schedule_router,
)
api_router.include_router(
    audit_log_router,
)
api_router.include_router(
    analytics_router,
)
api_router.include_router(
    dashboard_router,
)