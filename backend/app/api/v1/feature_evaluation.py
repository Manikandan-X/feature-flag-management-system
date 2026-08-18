from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.permissions import get_current_user
from app.core.constants import EnvironmentName
from app.db.session import get_db
from app.models.user import User
from app.schemas.feature_evaluation import (
    FeatureEvaluationResponse,
)
from app.services.feature_evaluation_service import (
    FeatureEvaluationService,
)


router = APIRouter(
    prefix="/feature-flags",
    tags=["Feature Evaluation"],
)


@router.get(
    "/{feature_key}/evaluate",
    response_model=FeatureEvaluationResponse,
)
def evaluate_feature(
    feature_key: str,
    environment: EnvironmentName,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):

    service = FeatureEvaluationService(db)

    return service.evaluate(
        feature_key=feature_key,
        environment_name=environment.value,
        user=current_user,
    )