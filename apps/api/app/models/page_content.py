"""Extended content models for MemorialPage - life events, achievements, education, etc."""

import enum
import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Enum, ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, GUID, UUIDMixin, TimestampMixin, utc_now


class AchievementCategory(str, enum.Enum):
    """Category of achievement."""

    MILITARY = "military"
    SCIENTIFIC = "scientific"
    SPORTS = "sports"
    CULTURAL = "cultural"
    PROFESSIONAL = "professional"
    PERSONAL = "personal"
    SOCIAL = "social"
    OTHER = "other"


class ValueType(str, enum.Enum):
    """Type of person value (value, belief, principle)."""

    VALUE = "value"
    BELIEF = "belief"
    PRINCIPLE = "principle"


class LifeEvent(Base, UUIDMixin, TimestampMixin):
    """Life event for a memorial page."""

    __tablename__ = "life_events"

    page_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("memorial_pages.id", ondelete="CASCADE"),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    description: Mapped[dict | None] = mapped_column(
        JSONB,
        nullable=True,
    )
    start_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )
    end_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )
    location: Mapped[str | None] = mapped_column(
        String(512),
        nullable=True,
    )
    sort_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    __table_args__ = (
        Index("ix_life_events_page_id", "page_id", "sort_order"),
    )

    def __repr__(self) -> str:
        return f"<LifeEvent(id={self.id}, title={self.title})>"


class Achievement(Base, UUIDMixin, TimestampMixin):
    """Achievement for a memorial page."""

    __tablename__ = "achievements"

    page_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("memorial_pages.id", ondelete="CASCADE"),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    description: Mapped[dict | None] = mapped_column(
        JSONB,
        nullable=True,
    )
    date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )
    category: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )
    custom_category: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )
    sort_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    __table_args__ = (
        Index("ix_achievements_page_id", "page_id", "sort_order"),
    )

    def __repr__(self) -> str:
        return f"<Achievement(id={self.id}, title={self.title})>"


class Education(Base, UUIDMixin, TimestampMixin):
    """Education record for a memorial page."""

    __tablename__ = "education"

    page_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("memorial_pages.id", ondelete="CASCADE"),
        nullable=False,
    )
    institution: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    degree: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    field_of_study: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    start_year: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )
    end_year: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )
    description: Mapped[dict | None] = mapped_column(
        JSONB,
        nullable=True,
    )
    sort_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    __table_args__ = (
        Index("ix_education_page_id", "page_id", "sort_order"),
    )

    def __repr__(self) -> str:
        return f"<Education(id={self.id}, institution={self.institution})>"


class Career(Base, UUIDMixin, TimestampMixin):
    """Career/service record for a memorial page."""

    __tablename__ = "career"

    page_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("memorial_pages.id", ondelete="CASCADE"),
        nullable=False,
    )
    organization: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    role: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    start_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )
    end_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )
    description: Mapped[dict | None] = mapped_column(
        JSONB,
        nullable=True,
    )
    sort_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    __table_args__ = (
        Index("ix_career_page_id", "page_id", "sort_order"),
    )

    def __repr__(self) -> str:
        return f"<Career(id={self.id}, organization={self.organization}, role={self.role})>"


class PersonValue(Base, UUIDMixin):
    """Values, beliefs, and principles for a memorial page."""

    __tablename__ = "person_values"

    page_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("memorial_pages.id", ondelete="CASCADE"),
        nullable=False,
    )
    type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    text: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )
    sort_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=utc_now,
    )

    __table_args__ = (
        Index("ix_person_values_page_id", "page_id", "type", "sort_order"),
    )

    def __repr__(self) -> str:
        return f"<PersonValue(id={self.id}, type={self.type}, text={self.text[:30]}...)>"


class Quote(Base, UUIDMixin):
    """Quote from or about a person."""

    __tablename__ = "quotes"

    page_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("memorial_pages.id", ondelete="CASCADE"),
        nullable=False,
    )
    text: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    source: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    sort_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=utc_now,
    )

    __table_args__ = (
        Index("ix_quotes_page_id", "page_id", "sort_order"),
    )

    def __repr__(self) -> str:
        return f"<Quote(id={self.id}, text={self.text[:30]}...)>"


class MemorialMessage(Base, UUIDMixin):
    """Guestbook message for a memorial page."""

    __tablename__ = "memorial_messages"

    page_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("memorial_pages.id", ondelete="CASCADE"),
        nullable=False,
    )
    author_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    author_user_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    text: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
    )
    is_approved: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )
    approved_by_user_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    approved_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=utc_now,
    )

    __table_args__ = (
        Index("ix_memorial_messages_page_id", "page_id", "is_approved", "created_at"),
    )

    def __repr__(self) -> str:
        return f"<MemorialMessage(id={self.id}, author={self.author_name})>"
