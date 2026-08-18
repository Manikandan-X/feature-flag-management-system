from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import AuditAction, AuditEntityType
from app.db.base_class import Base


if TYPE_CHECKING:
    from app.models.user import User


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
    )

    action: Mapped[AuditAction] = mapped_column(
        Enum(AuditAction),
        nullable=False,
    )

    entity_type: Mapped[AuditEntityType] = mapped_column(
        Enum(AuditEntityType),
        nullable=False,
    )

    entity_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    old_value: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
    )

    new_value: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user: Mapped["User | None"] = relationship(
        back_populates="audit_logs",
    )