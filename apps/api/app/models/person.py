"""Person model for Phoenix API."""

import enum
import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, GUID, TimestampMixin, UUIDMixin


class Gender(str, enum.Enum):
    """Gender options for Person."""

    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    UNKNOWN = "unknown"


class LifeStatus(str, enum.Enum):
    """Life status for Person."""

    ALIVE = "alive"
    DECEASED = "deceased"
    UNKNOWN = "unknown"


class Person(Base, UUIDMixin, TimestampMixin):
    """Person model - represents a human being (alive or deceased)."""

    __tablename__ = "persons"

    full_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
    )
    gender: Mapped[Gender] = mapped_column(
        Enum(Gender, name="gender", native_enum=True, values_callable=lambda x: [e.value for e in x]),
        default=Gender.UNKNOWN,
        nullable=False,
    )
    life_status: Mapped[LifeStatus] = mapped_column(
        Enum(LifeStatus, name="life_status", native_enum=True, values_callable=lambda x: [e.value for e in x]),
        default=LifeStatus.UNKNOWN,
        nullable=False,
        index=True,
    )
    birth_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )
    death_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )


    birth_place: Mapped[str | None] = mapped_column(
        String(512),
        nullable=True,
    )
    birth_place_lat: Mapped[float | None] = mapped_column(
        nullable=True,
    )
    birth_place_lng: Mapped[float | None] = mapped_column(
        nullable=True,
    )


    death_place: Mapped[str | None] = mapped_column(
        String(512),
        nullable=True,
    )
    death_place_lat: Mapped[float | None] = mapped_column(
        nullable=True,
    )
    death_place_lng: Mapped[float | None] = mapped_column(
        nullable=True,
    )


    burial_place: Mapped[str | None] = mapped_column(
        String(512),
        nullable=True,
    )
    burial_place_lat: Mapped[float | None] = mapped_column(
        nullable=True,
    )
    burial_place_lng: Mapped[float | None] = mapped_column(
        nullable=True,
    )
    burial_photo_url: Mapped[str | None] = mapped_column(
        String(1024),
        nullable=True,
    )

    created_by_user_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    linked_user_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        unique=True,
        index=True,
    )

    memorial_page: Mapped["MemorialPage | None"] = relationship(
        "MemorialPage",
        back_populates="person",
        uselist=False,
    )


    def __repr__(self) -> str:
        return f"<Person(id={self.id}, full_name={self.full_name}, life_status={self.life_status})>"


from app.models.memorial_page import MemorialPage
