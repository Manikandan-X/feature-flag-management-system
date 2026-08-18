from sqlalchemy import select

from app.core.config import settings
from app.core.constants import EnvironmentName, UserRole
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.environment import Environment
from app.models.role import Role
from app.models.user import User


def seed_roles(db):
    roles = [
        UserRole.ADMIN.value,
        UserRole.EMPLOYEE.value,
    ]

    for role_name in roles:
        existing = db.scalar(
            select(Role).where(Role.name == role_name)
        )

        if not existing:
            db.add(Role(name=role_name))


def seed_environments(db):
    environments = [
        (
            EnvironmentName.DEVELOPMENT.value,
            "Development environment",
        ),
        (
            EnvironmentName.TESTING.value,
            "Testing environment",
        ),
        (
            EnvironmentName.PRODUCTION.value,
            "Production environment",
        ),
    ]

    for name, description in environments:
        existing = db.scalar(
            select(Environment).where(
                Environment.name == name
            )
        )

        if not existing:
            db.add(
                Environment(
                    name=name,
                    description=description,
                    is_active=True,
                )
            )


def seed_admin(db):
    admin_role = db.scalar(
        select(Role).where(
            Role.name == UserRole.ADMIN.value
        )
    )

    if admin_role is None:
        raise RuntimeError(
            "ADMIN role was not found."
        )

    existing_admin = db.scalar(
        select(User).where(
            User.username == settings.admin_username
        )
    )

    if existing_admin:
        return

    admin = User(
        username=settings.admin_username,
        email=settings.admin_email,
        password_hash=hash_password(
            settings.admin_password
        ),
        role_id=admin_role.id,
        is_active=True,
    )

    db.add(admin)


def seed():
    db = SessionLocal()

    try:
        seed_roles(db)
        seed_environments(db)

        db.flush()

        seed_admin(db)

        db.commit()

        print("Seed completed successfully.")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed()