from pydantic import BaseModel


class DashboardSummaryResponse(BaseModel):
    total_features: int
    active_features: int
    disabled_features: int
    total_environments: int
    active_environments: int
    total_rollouts: int


class DashboardFeatureResponse(BaseModel):
    feature_flag_id: int
    feature_key: str
    feature_name: str
    environment_id: int
    environment: str
    enabled: bool


class DashboardRolloutResponse(BaseModel):
    feature_flag_id: int
    feature_key: str
    environment_id: int
    environment: str
    percentage: int


class DashboardEnvironmentResponse(BaseModel):
    environment_id: int
    environment: str
    is_active: bool
    total_features: int
    active_features: int
    disabled_features: int
    total_rollouts: int