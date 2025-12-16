"""MemorialPage model for Phoenix API."""

import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Index, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, GUID, TimestampMixin, UUIDMixin


class PageVisibility(str, enum.Enum):
    """Visibility options for MemorialPage."""

    PUBLIC = "public"
    UNLISTED = "unlisted"
    PRIVATE = "private"


class PageStatus(str, enum.Enum):
    """Status options for MemorialPage."""

    DRAFT = "draft"
    ON_MODERATION = "on_moderation"
    PUBLISHED = "published"
    REJECTED = "rejected"
    ARCHIVED = "archived"


class MemorialPage(Base, UUIDMixin, TimestampMixin):
    """MemorialPage model - public representation of a Person."""

    __tablename__ = "memorial_pages"

    person_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("persons.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    slug: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )
    title: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    biography: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    short_description: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    biography_json: Mapped[dict | None] = mapped_column(
        JSONB,
        nullable=True,
    )
    visibility: Mapped[PageVisibility] = mapped_column(
        Enum(PageVisibility, name="page_visibility", native_enum=True, values_callable=lambda x: [e.value for e in x]),
        default=PageVisibility.PUBLIC,
        nullable=False,
    )
    status: Mapped[PageStatus] = mapped_column(
        Enum(PageStatus, name="page_status", native_enum=True, values_callable=lambda x: [e.value for e in x]),
        default=PageStatus.DRAFT,
        nullable=False,
        index=True,
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
    published_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    person: Mapped["Person"] = relationship(
        "Person",
        back_populates="memorial_page",
    )
    qr_code: Mapped["QRCode | None"] = relationship(
        "QRCode",
        back_populates="page",
        uselist=False,
    )

    __table_args__ = (
        Index("ix_memorial_pages_owner_status", "owner_user_id", "status"),
    )

    def __repr__(self) -> str:
        return f"<MemorialPage(id={self.id}, slug={self.slug}, status={self.status})>"


from app.models.person import Person
from app.models.qr_code import QRCode
