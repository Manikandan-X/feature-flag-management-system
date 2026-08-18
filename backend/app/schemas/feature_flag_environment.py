from pydantic import BaseModel, ConfigDict


class FeatureFlagEnvironmentUpdate(BaseModel):
    enabled: bool


class FeatureFlagEnvironmentResponse(BaseModel):
    id: int
    feature_flag_id: int
    environment_id: int
    enabled: bool

    model_config = ConfigDict(
        from_attributes=True,
    )