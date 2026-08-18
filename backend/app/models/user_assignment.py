from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, TimestampMixin


if TYPE_CHECKING:
    from app.models.environment import Environment
    from app.models.feature_flag import FeatureFlag
    from app.models.user import User


class UserAssignment(TimestampMixin, Base):
    __tablename__ = "user_assignments"

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "feature_flag_id",
            "environment_id",
            name="uq_user_feature_environment",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    feature_flag_id: Mapped[int] = mapped_column(
        ForeignKey("feature_flags.id"),
        nullable=False,
    )

    environment_id: Mapped[int] = mapped_column(
        ForeignKey("environments.id"),
        nullable=False,
    )

    enabled: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
    )

    user: Mapped["User"] = relationship(
        back_populates="assignments",
    )

    feature_flag: Mapped["FeatureFlag"] = relationship(
        back_populates="user_assignments",
    )

    environment: Mapped["Environment"] = relationship()