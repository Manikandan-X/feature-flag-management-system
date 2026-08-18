from pydantic import BaseModel


class FeatureEvaluationResponse(BaseModel):
    feature_key: str
    environment: str
    user_id: int
    enabled: bool