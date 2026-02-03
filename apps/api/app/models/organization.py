"""Organization models for Phoenix API."""

import enum
import secrets
import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Index, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, GUID, TimestampMixin, UUIDMixin


class OrgType(str, enum.Enum):
    """Type of organization."""

    GOVERNMENT = "government"
    NGO = "ngo"
    COMMERCIAL = "commercial"
    OTHER = "other"


class OrgRole(str, enum.Enum):
    """Role within organization."""

    ORG_ADMIN = "org_admin"
    ORG_EDITOR = "org_editor"
    ORG_MODERATOR = "org_moderator"
    ORG_VIEWER = "org_viewer"


class MemberStatus(str, enum.Enum):
    """Status of organization membership."""

    INVITED = "invited"
    ACTIVE = "active"
    REVOKED = "revoked"


class InviteStatus(str, enum.Enum):
    """Status of organization invite."""

    PENDING = "pending"
    ACCEPTED = "accepted"
    EXPIRED = "expired"
    REVOKED = "revoked"


class ProjectStatus(str, enum.Enum):
    """Status of organization project."""

    ACTIVE = "active"
    ARCHIVED = "archived"


class Organization(Base, UUIDMixin, TimestampMixin):
    """Organization model for B2G functionality."""

    __tablename__ = "organizations"

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    slug: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )
    type: Mapped[OrgType] = mapped_column(
        Enum(OrgType, name="org_type", native_enum=False),
        default=OrgType.OTHER,
        nullable=False,
    )
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
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

    members: Mapped[list["OrganizationMember"]] = relationship(
        "OrganizationMember",
        back_populates="organization",
        cascade="all, delete-orphan",
    )
    invites: Mapped[list["OrganizationInvite"]] = relationship(
        "OrganizationInvite",
        back_populates="organization",
        cascade="all, delete-orphan",
    )
    projects: Mapped[list["OrgProject"]] = relationship(
        "OrgProject",
        back_populates="organization",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        Index("ix_organizations_created_by", "created_by_user_id"),
    )

    def __repr__(self) -> str:
        return f"<Organization(id={self.id}, name={self.name}, slug={self.slug})>"


class OrganizationMember(Base, UUIDMixin, TimestampMixin):
    """Organization membership model."""

    __tablename__ = "organization_members"

    org_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    role: Mapped[OrgRole] = mapped_column(
        Enum(OrgRole, name="org_role", native_enum=False, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
    )
    status: Mapped[MemberStatus] = mapped_column(
        Enum(MemberStatus, name="member_status", native_enum=False, values_callable=lambda x: [e.value for e in x]),
        default=MemberStatus.ACTIVE,
        nullable=False,
    )

    organization: Mapped["Organization"] = relationship(
        "Organization",
        back_populates="members",
    )
    user: Mapped["User"] = relationship(
        "User",
        foreign_keys=[user_id],
    )

    __table_args__ = (
        UniqueConstraint("org_id", "user_id", name="uq_org_member"),
        Index("ix_org_members_org_role", "org_id", "role"),
        Index("ix_org_members_user", "user_id"),
    )

    def __repr__(self) -> str:
        return f"<OrganizationMember(org_id={self.org_id}, user_id={self.user_id}, role={self.role})>"


def generate_invite_token() -> str:
    """Generate a secure invite token."""
    return secrets.token_urlsafe(32)


class OrganizationInvite(Base, UUIDMixin):
    """Organization invite model."""

    __tablename__ = "organization_invites"

    org_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
    )
    email: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    role: Mapped[OrgRole] = mapped_column(
        Enum(OrgRole, name="org_role", native_enum=False, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
    )
    token: Mapped[str] = mapped_column(
        String(64),
        unique=True,
        nullable=False,
        default=generate_invite_token,
        index=True,
    )
    status: Mapped[InviteStatus] = mapped_column(
        Enum(InviteStatus, name="invite_status", native_enum=False, values_callable=lambda x: [e.value for e in x]),
        default=InviteStatus.PENDING,
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
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    organization: Mapped["Organization"] = relationship(
        "Organization",
        back_populates="invites",
    )

    __table_args__ = (
        Index("ix_org_invites_org_email", "org_id", "email"),
        Index("ix_org_invites_status", "status"),
    )

    def __repr__(self) -> str:
        return f"<OrganizationInvite(org_id={self.org_id}, email={self.email}, status={self.status})>"


class OrgProject(Base, UUIDMixin, TimestampMixin):
    """Organization project (park) model.

    Projects can be tied to a location on the map (lat/lng).
    Pages created within an organization can be linked to a project.
    """

    __tablename__ = "org_projects"

    org_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    lat: Mapped[float | None] = mapped_column(
        nullable=True,
    )
    lng: Mapped[float | None] = mapped_column(
        nullable=True,
    )
    address: Mapped[str | None] = mapped_column(
        String(512),
        nullable=True,
    )
    status: Mapped[ProjectStatus] = mapped_column(
        Enum(ProjectStatus, name="project_status", native_enum=False, values_callable=lambda x: [e.value for e in x]),
        default=ProjectStatus.ACTIVE,
        nullable=False,
    )

    organization: Mapped["Organization"] = relationship(
        "Organization",
        back_populates="projects",
    )

    __table_args__ = (
        Index("ix_org_projects_org_status", "org_id", "status"),
        Index("ix_org_projects_location", "lat", "lng"),
    )

    def __repr__(self) -> str:
        return f"<OrgProject(id={self.id}, name={self.name}, org_id={self.org_id})>"


from app.models.user import User
