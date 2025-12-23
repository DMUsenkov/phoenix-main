"""Media model for Phoenix API."""

import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, GUID, TimestampMixin, UUIDMixin


class MediaType(str, enum.Enum):
    """Type of media file."""

    IMAGE = "image"
    VIDEO = "video"


class ModerationStatus(str, enum.Enum):
    """Moderation status for media."""

    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class Media(Base, UUIDMixin):
    """Media model - stores uploaded files metadata."""

    __tablename__ = "media"

    page_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("memorial_pages.id", ondelete="CASCADE"),
        nullable=False,
    )
    type: Mapped[MediaType] = mapped_column(
        Enum(MediaType, name="media_type", native_enum=False),
        nullable=False,
    )
    object_key: Mapped[str] = mapped_column(
        String(512),
        unique=True,
        nullable=False,
    )
    original_url: Mapped[str | None] = mapped_column(
        String(1024),
        nullable=True,
    )
    preview_url: Mapped[str | None] = mapped_column(
        String(1024),
        nullable=True,
    )
    mime_type: Mapped[str] = mapped_column(
        String(128),
        nullable=False,
    )
    size_bytes: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    width: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )
    height: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )
    duration_seconds: Mapped[float | None] = mapped_column(
        nullable=True,
    )
    checksum: Mapped[str | None] = mapped_column(
        String(128),
        nullable=True,
    )
    uploaded_by_user_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    moderation_status: Mapped[ModerationStatus] = mapped_column(
        Enum(ModerationStatus, name="moderation_status", native_enum=False),
        default=ModerationStatus.PENDING,
        nullable=False,
    )
    is_primary: Mapped[bool] = mapped_column(
        default=False,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(),
    )

    __table_args__ = (
        Index("ix_media_page_created", "page_id", "created_at"),
        Index("ix_media_page_type", "page_id", "type"),
    )

    def __repr__(self) -> str:
        return f"<Media(id={self.id}, page_id={self.page_id}, type={self.type})>"
