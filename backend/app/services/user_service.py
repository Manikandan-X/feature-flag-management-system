from sqlalchemy.orm import Session

from app.exceptions.auth import UserAlreadyExistsException
from app.models.user import User
from app.repositories.role_repository import RoleRepository
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate
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