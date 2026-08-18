from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user_assignment import UserAssignment


class UserAssignmentRepository:

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(
        self,
        assignment_id: int,
    ) -> UserAssignment | None:

        return self.db.scalar(
            select(UserAssignment).where(
                UserAssignment.id == assignment_id
            )
        )

    def get_by_user_feature_environment(
        self,
        user_id: int,
        feature_flag_id: int,
        environment_id: int,
    ) -> UserAssignment | None:

        return self.db.scalar(
            select(UserAssignment).where(
                UserAssignment.user_id == user_id,
                UserAssignment.feature_flag_id
                == feature_flag_id,
                UserAssignment.environment_id
                == environment_id,
            )
        )

    def get_by_feature_environment(
        self,
        feature_flag_id: int,
        environment_id: int,
    ) -> list[UserAssignment]:

        return list(
            self.db.scalars(
                select(UserAssignment)
                .where(
                    UserAssignment.feature_flag_id
                    == feature_flag_id,
                    UserAssignment.environment_id
                    == environment_id,
                )
                .order_by(UserAssignment.id)
            ).all()
        )

    def create(
        self,
        assignment: UserAssignment,
    ) -> UserAssignment:

        self.db.add(assignment)
        self.db.flush()
        self.db.refresh(assignment)

        return assignment

    def save(
        self,
        assignment: UserAssignment,
    ) -> UserAssignment:

        self.db.flush()
        self.db.refresh(assignment)

        return assignment

    def delete(
        self,
        assignment: UserAssignment,
    ) -> None:

        self.db.delete(assignment)
        self.db.flush()