from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.constants import UserRole
from app.core.security import decode_token
from app.db.session import get_db
from app.exceptions.auth import (
    ForbiddenException,
    InactiveUserException,
    InvalidTokenException,
)
from app.models.user import User
from app.repositories.user_repository import UserRepository


bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        bearer_scheme
    ),
    db: Session = Depends(get_db),
) -> User:

    token = credentials.credentials

    try:
        payload = decode_token(token)
    except Exception:
        raise InvalidTokenException()

    if payload.get("type") != "access":
        raise InvalidTokenException()

    user_id = payload.get("sub")

    if not user_id:
        raise InvalidTokenException()

    user_repository = UserRepository(db)

    user = user_repository.get_by_id(
        int(user_id)
    )

    if user is None:
        raise InvalidTokenException()

    if not user.is_active:
        raise InactiveUserException()

    return user


def require_admin(
    current_user: User = Depends(get_current_user),
) -> User:

    if current_user.role.name != UserRole.ADMIN.value:
        raise ForbiddenException()

    return current_user


def require_employee(
    current_user: User = Depends(get_current_user),
) -> User:

    if current_user.role.name not in (
        UserRole.ADMIN.value,
        UserRole.EMPLOYEE.value,
    ):
        raise ForbiddenException()

    return current_user