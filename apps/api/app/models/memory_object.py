"""MemoryObject model for Phoenix API."""

import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, GUID, TimestampMixin, UUIDMixin


class ObjectType(str, enum.Enum):
    """Type of memory object."""

    TREE = "tree"
    PLAQUE = "plaque"
    PLACE = "place"


class ObjectStatus(str, enum.Enum):
    """Status of memory object."""

    DRAFT = "draft"
    ON_MODERATION = "on_moderation"
    PUBLISHED = "published"
    REJECTED = "rejected"
    ARCHIVED = "archived"


class ObjectVisibility(str, enum.Enum):
    """Visibility of memory object."""

    PUBLIC = "public"
    UNLISTED = "unlisted"
    PRIVATE = "private"


class MemoryObject(Base, UUIDMixin, TimestampMixin):
    """MemoryObject model - geo-located memorial objects."""

    __tablename__ = "memory_objects"

    page_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("memorial_pages.id", ondelete="CASCADE"),
        nullable=False,
    )
    type: Mapped[ObjectType] = mapped_column(
        Enum(ObjectType, name="object_type", native_enum=False),
        nullable=False,
    )
    title: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    lat: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )
    lng: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )
    address: Mapped[str | None] = mapped_column(
        String(512),
        nullable=True,
    )
    status: Mapped[ObjectStatus] = mapped_column(
        Enum(ObjectStatus, name="object_status", native_enum=False),
        default=ObjectStatus.DRAFT,
        nullable=False,
    )
    visibility: Mapped[ObjectVisibility] = mapped_column(
        Enum(ObjectVisibility, name="object_visibility", native_enum=False),
        default=ObjectVisibility.PUBLIC,
        nullable=False,
    )
    owner_user_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    owner_org_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("organizations.id", ondelete="SET NULL"),
        nullable=True,
    )
    org_project_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("org_projects.id", ondelete="SET NULL"),
        nullable=True,
    )
    created_by_user_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    __table_args__ = (
        Index("ix_memory_objects_page_created", "page_id", "created_at"),
        Index("ix_memory_objects_status", "status"),
        Index("ix_memory_objects_lat_lng", "lat", "lng"),
        Index("ix_memory_objects_owner", "owner_user_id"),
        Index("ix_memory_objects_owner_org", "owner_org_id"),
        Index("ix_memory_objects_project", "org_project_id"),
    )

    def __repr__(self) -> str:
        return f"<MemoryObject(id={self.id}, type={self.type}, lat={self.lat}, lng={self.lng})>"
