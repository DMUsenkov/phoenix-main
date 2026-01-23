"""QRCode and QRCodeScanEvent models for Phoenix API."""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, GUID, TimestampMixin, UUIDMixin


class QRCode(Base, UUIDMixin, TimestampMixin):
    """QRCode model - short code linking to a memorial page."""

    __tablename__ = "qr_codes"

    page_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("memorial_pages.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    code: Mapped[str] = mapped_column(
        String(16),
        unique=True,
        nullable=False,
        index=True,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    created_by_user_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    page: Mapped["MemorialPage"] = relationship(
        "MemorialPage",
        back_populates="qr_code",
    )
    scan_events: Mapped[list["QRCodeScanEvent"]] = relationship(
        "QRCodeScanEvent",
        back_populates="qr_code",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        Index("ix_qr_codes_page_id", "page_id"),
    )

    def __repr__(self) -> str:
        return f"<QRCode(id={self.id}, code={self.code}, is_active={self.is_active})>"


class QRCodeScanEvent(Base, UUIDMixin):
    """QRCodeScanEvent model - tracks QR code scans for analytics."""

    __tablename__ = "qr_code_scan_events"

    qr_code_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("qr_codes.id", ondelete="CASCADE"),
        nullable=False,
    )
    scanned_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
    )
    ip: Mapped[str | None] = mapped_column(
        String(45),
        nullable=True,
    )
    user_agent: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    referer: Mapped[str | None] = mapped_column(
        String(2048),
        nullable=True,
    )

    qr_code: Mapped["QRCode"] = relationship(
        "QRCode",
        back_populates="scan_events",
    )

    __table_args__ = (
        Index("ix_qr_code_scan_events_qr_code_id_scanned_at", "qr_code_id", "scanned_at"),
    )

    def __repr__(self) -> str:
        return f"<QRCodeScanEvent(id={self.id}, qr_code_id={self.qr_code_id}, scanned_at={self.scanned_at})>"


from app.models.memorial_page import MemorialPage
