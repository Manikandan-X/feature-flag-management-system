from typing import TYPE_CHECKING

from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, TimestampMixin


if TYPE_CHECKING:
    from app.models.feature_flag_environment import FeatureFlagEnvironment


class Environment(TimestampMixin, Base):
    __tablename__ = "environments"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    name: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    feature_configurations: Mapped[
        list["FeatureFlagEnvironment"]
    ] = relationship(
        back_populates="environment",
        cascade="all, delete-orphan",
    )