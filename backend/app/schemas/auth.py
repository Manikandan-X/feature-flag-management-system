from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    username: str = Field(
        min_length=3,
        max_length=100,
    )

    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=72,
    )


class LoginRequest(BaseModel):
    username: str

    password: str = Field(
        min_length=8,
        max_length=72,
    )


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    is_active: bool
    role: str

    model_config = {
        "from_attributes": True,
    }


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(
        min_length=8,
        max_length=72,
    )

    new_password: str = Field(
        min_length=8,
        max_length=72,
    )