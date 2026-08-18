from pydantic import BaseModel


class FeatureUsageAnalyticsResponse(BaseModel):

    feature_key: str
    environment: str

    total_evaluations: int
    enabled_count: int
    disabled_count: int