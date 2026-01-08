"""Moderation models for Phoenix API."""

import enum
import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, Enum, ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, GUID, UUIDMixin, utc_now


class EntityType(str, enum.Enum):
    """Type of entity being moderated."""

    PAGE = "page"
    MEDIA = "media"
    OBJECT = "object"


class TaskStatus(str, enum.Enum):
    """Status of moderation task."""

    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class ModerationTask(Base, UUIDMixin):
    """Moderation task for content review."""

    __tablename__ = "moderation_tasks"

    entity_type: Mapped[EntityType] = mapped_column(
        Enum(EntityType, name="entity_type", native_enum=False),
        nullable=False,
    )
    entity_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        nullable=False,
    )
    org_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("organizations.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    status: Mapped[TaskStatus] = mapped_column(
        Enum(TaskStatus, name="task_status", native_enum=False),
        default=TaskStatus.PENDING,
        nullable=False,
    )
    priority: Mapped[int] = mapped_column(
        default=0,
        nullable=False,
    )
    reason: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    created_by_user_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    moderator_user_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=utc_now,
    )
    decided_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    __table_args__ = (
        Index("ix_moderation_tasks_status_created", "status", "created_at"),
        Index("ix_moderation_tasks_type_status_created", "entity_type", "status", "created_at"),
        Index("ix_moderation_tasks_org_status_created", "org_id", "status", "created_at"),
        Index("ix_moderation_tasks_entity_id", "entity_id"),
    )

    def __repr__(self) -> str:
        return f"<ModerationTask(id={self.id}, entity_type={self.entity_type}, status={self.status})>"


class AuditEvent(Base, UUIDMixin):
    """Audit event for tracking system actions."""

    __tablename__ = "audit_events"

    event_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )
    actor_user_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    entity_type: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )
    entity_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        nullable=True,
    )
    org_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("organizations.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    payload: Mapped[dict[str, Any] | None] = mapped_column(
        JSONB,
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=utc_now,
        index=True,
    )

    __table_args__ = (
        Index("ix_audit_events_entity", "entity_type", "entity_id"),
        Index("ix_audit_events_type_created", "event_type", "created_at"),
    )

    def __repr__(self) -> str:
        return f"<AuditEvent(id={self.id}, event_type={self.event_type})>"
