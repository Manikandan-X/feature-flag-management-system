from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.permissions import require_admin
from app.db.session import get_db
from app.models.user import User
from app.repositories.role_repository import RoleRepository
from app.schemas.auth import UserResponse
from app.schemas.user import (
    UserCreate,
    UserCreateRequest,
    UserRoleUpdate,
)
from app.services.user_service import UserService


router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


def _to_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        is_active=user.is_active,
        role=user.role.name,
    )


# -------------------------------------------------
# List All Users
# -------------------------------------------------

@router.get(
    "",
    response_model=list[UserResponse],
)
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    service = UserService(db)

    return [
        _to_response(user)
        for user in service.get_all()
    ]


# -------------------------------------------------
# Get Single User
# -------------------------------------------------

@router.get(
    "/{user_id}",
    response_model=UserResponse,
)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    service = UserService(db)

    return _to_response(service.get(user_id))


# -------------------------------------------------
# Create User
# -------------------------------------------------

@router.post(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_user(
    data: UserCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    role_repository = RoleRepository(db)

    role = role_repository.get_by_name(data.role.value)

    if role is None:
        raise ValueError("Invalid role")

    service = UserService(db)

    user = service.create_user(
        UserCreate(
            username=data.username,
            email=data.email,
            password=data.password,
            role_id=role.id,
        )
    )

    return _to_response(user)


# -------------------------------------------------
# Update User (activate/deactivate, change role, email)
# -------------------------------------------------

@router.patch(
    "/{user_id}",
    response_model=UserResponse,
)
def update_user(
    user_id: int,
    data: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    service = UserService(db)

    user = service.update_user(
        user_id,
        data,
        current_user.id,
    )

    return _to_response(user)
