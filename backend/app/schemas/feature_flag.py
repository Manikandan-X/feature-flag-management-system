from pydantic import BaseModel, ConfigDict, Field


class FeatureFlagCreate(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=150,
    )

    key: str = Field(
        min_length=2,
        max_length=100,
    )

    description: str | None = Field(
        default=None,
        max_length=1000,
    )


class FeatureFlagUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=150,
    )

    description: str | None = Field(
        default=None,
        max_length=1000,
    )


class FeatureFlagResponse(BaseModel):
    id: int
    name: str
    key: str
    description: str | None
    created_by: int

    model_config = ConfigDict(
        from_attributes=True,
    )