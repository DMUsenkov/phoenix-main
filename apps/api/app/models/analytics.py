"""Analytics models for Phoenix - events and daily aggregates."""

import uuid
from datetime import datetime, date
from enum import Enum

from sqlalchemy import (
    DateTime,
    Date,
    String,
    Text,
    Integer,
    ForeignKey,
    Index,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, UUIDMixin, GUID, utc_now


class EventType(str, Enum):
    """Types of analytics events."""
    PAGE_VIEW = "page.view"
    QR_SCAN = "qr.scan"
    MAP_OPEN = "map.open"
    MAP_OBJECT_OPEN = "map.object_open"
    SHARE_CLICK = "share.click"
    LINK_COPY = "link.copy"


class MetricType(str, Enum):
    """Types of daily metrics."""
    VIEWS = "views"
    UNIQUE_VISITORS = "unique_visitors"
    QR_SCANS = "qr_scans"
    MAP_OPENS = "map_opens"
    MAP_OBJECT_OPENS = "map_object_opens"
    SHARE_CLICKS = "share_clicks"
    LINK_COPIES = "link_copies"


class AnalyticsEvent(Base, UUIDMixin):
    """Raw analytics events table."""

    __tablename__ = "analytics_events"

    event_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
    )
    occurred_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utc_now,
        index=True,
    )
    org_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("organizations.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    page_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("memorial_pages.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    object_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("memory_objects.id", ondelete="SET NULL"),
        nullable=True,
    )
    qr_code_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("qr_codes.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    actor_user_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    anon_id: Mapped[str | None] = mapped_column(
        String(64),
        nullable=True,
        index=True,
    )
    session_id: Mapped[str | None] = mapped_column(
        String(64),
        nullable=True,
    )
    ip_hash: Mapped[str | None] = mapped_column(
        String(64),
        nullable=True,
    )
    user_agent: Mapped[str | None] = mapped_column(
        String(512),
        nullable=True,
    )
    referer: Mapped[str | None] = mapped_column(
        String(1024),
        nullable=True,
    )
    properties: Mapped[dict | None] = mapped_column(
        JSONB,
        nullable=True,
    )

    __table_args__ = (
        Index("ix_analytics_events_event_type_occurred_at", "event_type", "occurred_at"),
        Index("ix_analytics_events_org_id_occurred_at", "org_id", "occurred_at"),
        Index("ix_analytics_events_page_id_occurred_at", "page_id", "occurred_at"),
        Index("ix_analytics_events_qr_code_id_occurred_at", "qr_code_id", "occurred_at"),
    )


class AnalyticsDaily(Base, UUIDMixin):
    """Daily aggregated analytics metrics."""

    __tablename__ = "analytics_daily"

    date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        index=True,
    )
    org_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    page_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("memorial_pages.id", ondelete="CASCADE"),
        nullable=True,
    )
    object_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("memory_objects.id", ondelete="CASCADE"),
        nullable=True,
    )
    metric: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    value: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    __table_args__ = (
        UniqueConstraint(
            "date", "org_id", "page_id", "object_id", "metric",
            name="uq_analytics_daily_composite"
        ),
        Index("ix_analytics_daily_date_org_id", "date", "org_id"),
        Index("ix_analytics_daily_date_page_id", "date", "page_id"),
    )
