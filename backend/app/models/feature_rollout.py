from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, TimestampMixin


if TYPE_CHECKING:
    from app.models.environment import Environment
    from app.models.feature_flag import FeatureFlag


class FeatureRollout(TimestampMixin, Base):
    __tablename__ = "feature_rollouts"

    __table_args__ = (
        CheckConstraint(
            "percentage >= 0 AND percentage <= 100",
            name="ck_rollout_percentage",
        ),
        UniqueConstraint(
            "feature_flag_id",
            "environment_id",
            name="uq_feature_environment_rollout",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    feature_flag_id: Mapped[int] = mapped_column(
        ForeignKey("feature_flags.id"),
        nullable=False,
    )

    environment_id: Mapped[int] = mapped_column(
        ForeignKey("environments.id"),
        nullable=False,
    )

    percentage: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    feature_flag: Mapped["FeatureFlag"] = relationship(
        back_populates="rollouts",
    )

    environment: Mapped["Environment"] = relationship()