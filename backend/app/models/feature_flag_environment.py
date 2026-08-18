from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, TimestampMixin


if TYPE_CHECKING:
    from app.models.environment import Environment
    from app.models.feature_flag import FeatureFlag


class FeatureFlagEnvironment(TimestampMixin, Base):
    __tablename__ = "feature_flag_environments"

    __table_args__ = (
        UniqueConstraint(
            "feature_flag_id",
            "environment_id",
            name="uq_feature_environment",
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

    enabled: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    scheduled_start_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    scheduled_end_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    feature_flag: Mapped["FeatureFlag"] = relationship(
        back_populates="environment_configurations",
    )

    environment: Mapped["Environment"] = relationship(
        back_populates="feature_configurations",
    )