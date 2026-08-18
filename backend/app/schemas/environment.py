from pydantic import BaseModel, ConfigDict, Field


class EnvironmentCreate(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=50,
    )

    description: str | None = Field(
        default=None,
        max_length=255,
    )


class EnvironmentUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=50,
    )

    description: str | None = Field(
        default=None,
        max_length=255,
    )

    is_active: bool | None = None


class EnvironmentResponse(BaseModel):
    id: int
    name: str
    description: str | None
    is_active: bool

    model_config = ConfigDict(
        from_attributes=True,
    )