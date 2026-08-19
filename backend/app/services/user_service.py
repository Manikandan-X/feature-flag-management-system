from sqlalchemy.orm import Session

from app.exceptions.auth import UserAlreadyExistsException
from app.exceptions.user import (
    CannotModifyOwnAccountException,
    UserNotFoundException,
)
from app.models.user import User
from app.repositories.role_repository import RoleRepository
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserRoleUpdate
from app.core.security import hash_password


class UserService:

    def __init__(self, db: Session):
        self.db = db
        self.user_repository = UserRepository(db)
        self.role_repository = RoleRepository(db)

    def create_user(
        self,
        data: UserCreate,
    ) -> User:

        existing_username = (
            self.user_repository.get_by_username(
                data.username
            )
        )

        existing_email = (
            self.user_repository.get_by_email(
                data.email
            )
        )

        if existing_username or existing_email:
            raise UserAlreadyExistsException()

        role = self.role_repository.get_by_id(
            data.role_id
        )

        if role is None:
            raise ValueError("Invalid role")

        user = User(
            username=data.username,
            email=data.email,
            password_hash=hash_password(data.password),
            role_id=data.role_id,
            is_active=True,
        )

        user = self.user_repository.create(user)

        self.db.commit()

        return user

    # -------------------------------------------------
    # Admin user management (added)
    # -------------------------------------------------

    def get_all(self) -> list[User]:
        return self.user_repository.get_all()

    def get(self, user_id: int) -> User:
        user = self.user_repository.get_by_id(user_id)

        if not user:
            raise UserNotFoundException()

        return user

    def update_user(
        self,
        user_id: int,
        data: UserRoleUpdate,
        current_admin_id: int,
    ) -> User:

        user = self.get(user_id)

        is_self = user.id == current_admin_id

        role_is_changing = (
            data.role is not None
            and data.role.value != user.role.name
        )

        if is_self and (data.is_active is False or role_is_changing):
            raise CannotModifyOwnAccountException()

        if data.email is not None and data.email != user.email:
            existing_email = (
                self.user_repository.get_by_email(
                    data.email
                )
            )

            if existing_email and existing_email.id != user.id:
                raise UserAlreadyExistsException()

            user.email = data.email

        if data.is_active is not None:
            user.is_active = data.is_active

        if data.role is not None:
            role = self.role_repository.get_by_name(
                data.role.value
            )

            if role is None:
                raise ValueError("Invalid role")

            user.role_id = role.id

        user = self.user_repository.update(user)

        self.db.commit()

        self.db.refresh(user)

        return user