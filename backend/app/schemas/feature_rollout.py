from pydantic import BaseModel, Field


class FeatureRolloutCreate(BaseModel):
    percentage: int = Field(
        ge=0,
        le=100,
    )


class FeatureRolloutResponse(BaseModel):
    id: int
    feature_flag_id: int
    environment_id: int
    percentage: int

    model_config = {
        "from_attributes": True,
    }