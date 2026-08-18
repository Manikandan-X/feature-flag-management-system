from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.environment import Environment


class EnvironmentRepository:

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(
        self,
        environment_id: int,
    ) -> Environment | None:
        return self.db.scalar(
            select(Environment).where(
                Environment.id == environment_id
            )
        )

    def get_by_name(
        self,
        name: str,
    ) -> Environment | None:
        return self.db.scalar(
            select(Environment).where(
                Environment.name == name
            )
        )

    def get_all(self) -> list[Environment]:
        return list(
            self.db.scalars(
                select(Environment).order_by(
                    Environment.id
                )
            ).all()
        )

    def get_active(self) -> list[Environment]:
        return list(
            self.db.scalars(
                select(Environment)
                .where(
                    Environment.is_active.is_(True)
                )
                .order_by(Environment.id)
            ).all()
        )

    def create(
        self,
        environment: Environment,
    ) -> Environment:
        self.db.add(environment)
        self.db.flush()
        self.db.refresh(environment)

        return environment

    def save(
        self,
        environment: Environment,
    ) -> Environment:
        self.db.flush()
        self.db.refresh(environment)

        return environment