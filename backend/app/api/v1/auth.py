from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.permissions import get_current_user
from app.core.security import (
    create_access_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.db.session import get_db
from app.exceptions.auth import InvalidTokenException
from app.models.user import User
from app.schemas.auth import (
    ChangePasswordRequest,
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from app.schemas.user import UserCreate
from app.services.auth_service import AuthService
from app.services.user_service import UserService


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=UserResponse,
)
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db),
):
    # Registration will use the Employee role by default.
    from app.repositories.role_repository import RoleRepository

    role_repository = RoleRepository(db)

    role = role_repository.get_by_name("EMPLOYEE")

    if role is None:
        raise ValueError("Employee role not found")

    user_service = UserService(db)

    user = user_service.create_user(
        UserCreate(
            username=data.username,
            email=data.email,
            password=data.password,
            role_id=role.id,
        )
    )

    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        is_active=user.is_active,
        role=role.name,
    )


@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    data: LoginRequest,
    db: Session = Depends(get_db),
):
    service = AuthService(db)

    return service.login(
        username=data.username,
        password=data.password,
    )


@router.post("/refresh")
def refresh(
    data: RefreshTokenRequest,
    db: Session = Depends(get_db),
):
    service = AuthService(db)

    return service.refresh_access_token(
        data.refresh_token
    )


@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        is_active=current_user.is_active,
        role=current_user.role.name,
    )


@router.post("/change-password")
def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(
        data.current_password,
        current_user.password_hash,
    ):
        from app.exceptions.auth import InvalidCredentialsException

        raise InvalidCredentialsException()

    current_user.password_hash = hash_password(
        data.new_password
    )

    db.commit()

    return {
        "success": True,
        "message": "Password changed successfully",
    }