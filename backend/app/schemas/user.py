from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    username: str = Field(
        min_length=3,
        max_length=100,
    )

    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=72,
    )

    role_id: int


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    is_active: bool | None = None
    role_id: int | None = None


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    is_active: bool
    role_id: int

    model_config = {
        "from_attributes": True,
    }