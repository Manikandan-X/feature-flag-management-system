from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, TimestampMixin


if TYPE_CHECKING:
    from app.models.feature_flag_environment import FeatureFlagEnvironment
    from app.models.feature_rollout import FeatureRollout
    from app.models.user import User
    from app.models.user_assignment import UserAssignment


class FeatureFlag(TimestampMixin, Base):
    __tablename__ = "feature_flags"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    key: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_by: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    creator: Mapped["User"] = relationship(
        foreign_keys=[created_by],
    )

    environment_configurations: Mapped[
        list["FeatureFlagEnvironment"]
    ] = relationship(
        back_populates="feature_flag",
        cascade="all, delete-orphan",
    )

    rollouts: Mapped[list["FeatureRollout"]] = relationship(
        back_populates="feature_flag",
        cascade="all, delete-orphan",
    )

    user_assignments: Mapped[list["UserAssignment"]] = relationship(
        back_populates="feature_flag",
        cascade="all, delete-orphan",
    )