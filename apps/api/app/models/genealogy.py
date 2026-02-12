"""Genealogy models for Phoenix API - Family relationships and claims."""

import enum
import secrets
import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, Enum, ForeignKey, Index, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, GUID, UUIDMixin, utc_now


class RelationType(str, enum.Enum):
    """Type of family relationship."""

    MOTHER = "mother"
    FATHER = "father"
    BROTHER = "brother"
    SISTER = "sister"
    SPOUSE = "spouse"
    SON = "son"
    DAUGHTER = "daughter"
    CHILD = "child"
    PARENT = "parent"
    SIBLING = "sibling"


class RelationshipStatus(str, enum.Enum):
    """Status of family relationship."""

    PENDING = "pending"
    ACTIVE = "active"
    REJECTED = "rejected"


class ClaimInviteStatus(str, enum.Enum):
    """Status of person claim invite."""

    PENDING = "pending"
    ACCEPTED = "accepted"
    REVOKED = "revoked"
    EXPIRED = "expired"


INVERSE_RELATIONS: dict[RelationType, RelationType] = {
    RelationType.MOTHER: RelationType.CHILD,
    RelationType.FATHER: RelationType.CHILD,
    RelationType.SON: RelationType.PARENT,
    RelationType.DAUGHTER: RelationType.PARENT,
    RelationType.CHILD: RelationType.PARENT,
    RelationType.PARENT: RelationType.CHILD,
    RelationType.BROTHER: RelationType.SIBLING,
    RelationType.SISTER: RelationType.SIBLING,
    RelationType.SIBLING: RelationType.SIBLING,
    RelationType.SPOUSE: RelationType.SPOUSE,
}


def get_inverse_relation(relation_type: RelationType) -> RelationType:
    """Get inverse relation type."""
    return INVERSE_RELATIONS.get(relation_type, RelationType.SIBLING)


class FamilyRelationship(Base, UUIDMixin):
    """Family relationship edge between two persons."""

    __tablename__ = "family_relationships"

    from_person_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("persons.id", ondelete="CASCADE"),
        nullable=False,
    )
    to_person_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("persons.id", ondelete="CASCADE"),
        nullable=False,
    )
    relation_type: Mapped[RelationType] = mapped_column(
        Enum(RelationType, name="relation_type", native_enum=False, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
    )
    status: Mapped[RelationshipStatus] = mapped_column(
        Enum(RelationshipStatus, name="relationship_status", native_enum=False, values_callable=lambda x: [e.value for e in x]),
        default=RelationshipStatus.ACTIVE,
        nullable=False,
    )
    requested_by_user_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    requested_to_user_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    decided_by_user_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    reason: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    inverse_relationship_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("family_relationships.id", ondelete="SET NULL"),
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


    to_person: Mapped["Person"] = relationship(
        "Person",
        foreign_keys=[to_person_id],
    )

    __table_args__ = (
        UniqueConstraint("from_person_id", "to_person_id", "relation_type", name="uq_family_relationship"),
        CheckConstraint("from_person_id != to_person_id", name="ck_no_self_edge"),
        Index("ix_family_relationships_from", "from_person_id"),
        Index("ix_family_relationships_to", "to_person_id"),
        Index("ix_family_relationships_status", "status"),
        Index("ix_family_relationships_requested_to", "requested_to_user_id", "status"),
    )

    def __repr__(self) -> str:
        return f"<FamilyRelationship(id={self.id}, {self.from_person_id} -> {self.to_person_id}, type={self.relation_type})>"


class PersonClaimInvite(Base, UUIDMixin):
    """Invite for claiming ownership of a person/page."""

    __tablename__ = "person_claim_invites"

    person_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("persons.id", ondelete="CASCADE"),
        nullable=False,
    )
    email: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    token: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        unique=True,
        index=True,
        default=lambda: secrets.token_urlsafe(32),
    )
    status: Mapped[ClaimInviteStatus] = mapped_column(
        Enum(ClaimInviteStatus, name="claim_invite_status", native_enum=False, values_callable=lambda x: [e.value for e in x]),
        default=ClaimInviteStatus.PENDING,
        nullable=False,
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
    )
    created_by_user_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    accepted_by_user_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=utc_now,
    )
    accepted_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    __table_args__ = (
        Index("ix_person_claim_invites_person", "person_id"),
        Index("ix_person_claim_invites_email", "email"),
        Index("ix_person_claim_invites_status", "status"),
    )

    def __repr__(self) -> str:
        return f"<PersonClaimInvite(id={self.id}, person_id={self.person_id}, email={self.email})>"
