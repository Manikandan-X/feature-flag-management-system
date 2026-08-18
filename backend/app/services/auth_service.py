from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_password,
)
from app.exceptions.auth import (
    InactiveUserException,
    InvalidCredentialsException,
    InvalidTokenException,
)
from app.repositories.user_repository import UserRepository


class AuthService:

    def __init__(self, db: Session):
        self.db = db
        self.user_repository = UserRepository(db)

    def login(
        self,
        username: str,
        password: str,
    ):
        user = self.user_repository.get_by_username(
            username
        )

        if user is None:
            raise InvalidCredentialsException()

        if not verify_password(
            password,
            user.password_hash,
        ):
            raise InvalidCredentialsException()

        if not user.is_active:
            raise InactiveUserException()

        access_token = create_access_token(
            str(user.id)
        )

        refresh_token = create_refresh_token(
            str(user.id)
        )

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
        }

    def refresh_access_token(
        self,
        refresh_token: str,
    ):
        try:
            payload = decode_token(refresh_token)
        except Exception:
            raise InvalidTokenException()

        if payload.get("type") != "refresh":
            raise InvalidTokenException()

        user_id = payload.get("sub")

        if not user_id:
            raise InvalidTokenException()

        user = self.user_repository.get_by_id(
            int(user_id)
        )

        if user is None or not user.is_active:
            raise InvalidTokenException()

        access_token = create_access_token(
            str(user.id)
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
        }