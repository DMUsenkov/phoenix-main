"""Service for organization operations."""

import re
import secrets
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import (
    Organization,
    OrganizationMember,
    OrganizationInvite,
    OrgProject,
    OrgRole,
    MemberStatus,
    InviteStatus,
    ProjectStatus,
    MemorialPage,
    MemoryObject,
    Person,
    PageStatus,
    PageVisibility,
    ObjectStatus,
    ObjectVisibility,
)


def generate_slug(name: str) -> str:
    """Generate a URL-friendly slug from organization name."""
    slug = name.lower().strip()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[-\s]+", "-", slug)
    slug = slug.strip("-")
    suffix = secrets.token_hex(4)
    return f"{slug}-{suffix}"


async def ensure_unique_slug(db: AsyncSession, base_slug: str) -> str:
    """Ensure slug is unique, adding suffix if needed."""
    slug = base_slug
    counter = 0

    while True:
        result = await db.execute(
            select(Organization.id).where(Organization.slug == slug)
        )
        if result.scalar_one_or_none() is None:
            return slug
        counter += 1
        slug = f"{base_slug}-{counter}"


async def create_organization(
    db: AsyncSession,
    name: str,
    user_id: uuid.UUID,
    org_type: str = "other",
    description: str | None = None,
) -> Organization:
    """Create organization and add creator as org_admin."""
    base_slug = generate_slug(name)
    slug = await ensure_unique_slug(db, base_slug)

    org = Organization(
        id=uuid.uuid4(),
        name=name,
        slug=slug,
        type=org_type,
        description=description,
        is_active=True,
        created_by_user_id=user_id,
    )
    db.add(org)
    await db.flush()

    member = OrganizationMember(
        id=uuid.uuid4(),
        org_id=org.id,
        user_id=user_id,
        role=OrgRole.ORG_ADMIN,
        status=MemberStatus.ACTIVE,
    )
    db.add(member)
    await db.flush()

    return org


async def get_organization_by_id(
    db: AsyncSession,
    org_id: uuid.UUID,
) -> Organization | None:
    """Get organization by ID."""
    result = await db.execute(
        select(Organization).where(Organization.id == org_id)
    )
    return result.scalar_one_or_none()


async def get_user_organizations(
    db: AsyncSession,
    user_id: uuid.UUID,
) -> list[Organization]:
    """Get all organizations where user is an active member."""
    result = await db.execute(
        select(Organization)
        .join(OrganizationMember)
        .where(
            OrganizationMember.user_id == user_id,
            OrganizationMember.status == MemberStatus.ACTIVE,
            Organization.is_active == True,
        )
    )
    return list(result.scalars().all())


async def update_organization(
    db: AsyncSession,
    org: Organization,
    name: str | None = None,
    description: str | None = None,
    org_type: str | None = None,
) -> Organization:
    """Update organization details."""
    if name is not None:
        org.name = name
    if description is not None:
        org.description = description
    if org_type is not None:
        org.type = org_type

    await db.flush()
    return org


async def deactivate_organization(
    db: AsyncSession,
    org: Organization,
) -> Organization:
    """Soft delete organization."""
    org.is_active = False
    await db.flush()
    return org


async def get_member_by_user_id(
    db: AsyncSession,
    org_id: uuid.UUID,
    user_id: uuid.UUID,
) -> OrganizationMember | None:
    """Get organization member by user ID."""
    result = await db.execute(
        select(OrganizationMember).where(
            OrganizationMember.org_id == org_id,
            OrganizationMember.user_id == user_id,
            OrganizationMember.status == MemberStatus.ACTIVE,
        )
    )
    return result.scalar_one_or_none()


async def get_org_members(
    db: AsyncSession,
    org_id: uuid.UUID,
) -> list[OrganizationMember]:
    """Get all members of organization."""
    result = await db.execute(
        select(OrganizationMember)
        .options(selectinload(OrganizationMember.user))
        .where(OrganizationMember.org_id == org_id)
        .order_by(OrganizationMember.created_at)
    )
    return list(result.scalars().all())


async def update_member_role(
    db: AsyncSession,
    member: OrganizationMember,
    role: OrgRole,
) -> OrganizationMember:
    """Update member's role."""
    member.role = role
    await db.flush()
    return member


async def revoke_member(
    db: AsyncSession,
    member: OrganizationMember,
) -> OrganizationMember:
    """Revoke member's access."""
    member.status = MemberStatus.REVOKED
    await db.flush()
    return member


async def create_member(
    db: AsyncSession,
    org_id: uuid.UUID,
    user_id: uuid.UUID,
    role: OrgRole,
) -> OrganizationMember:
    """Create organization member directly."""
    member = OrganizationMember(
        id=uuid.uuid4(),
        org_id=org_id,
        user_id=user_id,
        role=role,
        status=MemberStatus.ACTIVE,
    )
    db.add(member)
    await db.flush()
    return member


async def create_invite(
    db: AsyncSession,
    org_id: uuid.UUID,
    email: str,
    role: OrgRole,
    created_by_user_id: uuid.UUID,
    expires_days: int = 7,
) -> OrganizationInvite:
    """Create organization invite."""
    invite = OrganizationInvite(
        id=uuid.uuid4(),
        org_id=org_id,
        email=email.lower().strip(),
        role=role,
        status=InviteStatus.PENDING,
        expires_at=datetime.now(timezone.utc) + timedelta(days=expires_days),
        created_by_user_id=created_by_user_id,
    )
    db.add(invite)
    await db.flush()
    return invite


async def get_invite_by_token(
    db: AsyncSession,
    token: str,
) -> OrganizationInvite | None:
    """Get invite by token."""
    result = await db.execute(
        select(OrganizationInvite)
        .options(selectinload(OrganizationInvite.organization))
        .where(OrganizationInvite.token == token)
    )
    return result.scalar_one_or_none()


async def accept_invite(
    db: AsyncSession,
    invite: OrganizationInvite,
    user_id: uuid.UUID,
) -> OrganizationMember:
    """Accept invite and create membership."""
    if invite.status != InviteStatus.PENDING:
        raise ValueError("Invite is not pending")

    expires_at = invite.expires_at.replace(tzinfo=timezone.utc) if invite.expires_at.tzinfo is None else invite.expires_at
    if expires_at < datetime.now(timezone.utc):
        invite.status = InviteStatus.EXPIRED
        await db.flush()
        raise ValueError("Invite has expired")

    existing = await db.execute(
        select(OrganizationMember).where(
            OrganizationMember.org_id == invite.org_id,
            OrganizationMember.user_id == user_id,
        )
    )
    existing_member = existing.scalar_one_or_none()

    if existing_member:
        if existing_member.status == MemberStatus.ACTIVE:
            raise ValueError("Already a member of this organization")
        existing_member.status = MemberStatus.ACTIVE
        existing_member.role = invite.role
        member = existing_member
    else:
        member = OrganizationMember(
            id=uuid.uuid4(),
            org_id=invite.org_id,
            user_id=user_id,
            role=invite.role,
            status=MemberStatus.ACTIVE,
        )
        db.add(member)

    invite.status = InviteStatus.ACCEPTED
    await db.flush()

    return member


async def create_org_project(
    db: AsyncSession,
    org_id: uuid.UUID,
    name: str,
    description: str | None = None,
    lat: float | None = None,
    lng: float | None = None,
    address: str | None = None,
) -> OrgProject:
    """Create organization project."""
    project = OrgProject(
        id=uuid.uuid4(),
        org_id=org_id,
        name=name,
        description=description,
        lat=lat,
        lng=lng,
        address=address,
        status=ProjectStatus.ACTIVE,
    )
    db.add(project)
    await db.flush()
    return project


async def get_org_projects(
    db: AsyncSession,
    org_id: uuid.UUID,
    include_archived: bool = False,
) -> list[OrgProject]:
    """Get organization projects."""
    query = select(OrgProject).where(OrgProject.org_id == org_id)
    if not include_archived:
        query = query.where(OrgProject.status == ProjectStatus.ACTIVE)
    query = query.order_by(OrgProject.created_at.desc())

    result = await db.execute(query)
    return list(result.scalars().all())


async def get_project_by_id(
    db: AsyncSession,
    project_id: uuid.UUID,
) -> OrgProject | None:
    """Get project by ID."""
    result = await db.execute(
        select(OrgProject).where(OrgProject.id == project_id)
    )
    return result.scalar_one_or_none()


async def update_project(
    db: AsyncSession,
    project: OrgProject,
    name: str | None = None,
    description: str | None = None,
    lat: float | None = None,
    lng: float | None = None,
    address: str | None = None,
) -> OrgProject:
    """Update project details."""
    if name is not None:
        project.name = name
    if description is not None:
        project.description = description
    if lat is not None:
        project.lat = lat
    if lng is not None:
        project.lng = lng
    if address is not None:
        project.address = address
    await db.flush()
    return project


async def archive_project(
    db: AsyncSession,
    project: OrgProject,
) -> OrgProject:
    """Archive project."""
    project.status = ProjectStatus.ARCHIVED
    await db.flush()
    return project


async def get_org_pages(
    db: AsyncSession,
    org_id: uuid.UUID,
    status_filter: PageStatus | None = None,
    project_id: uuid.UUID | None = None,
) -> list[MemorialPage]:
    """Get pages owned by organization (created via /org/pages/new)."""
    query = (
        select(MemorialPage)
        .options(selectinload(MemorialPage.person))
        .where(MemorialPage.owner_org_id == org_id)
    )
    if status_filter:
        query = query.where(MemorialPage.status == status_filter)
    if project_id:
        query = query.where(MemorialPage.org_project_id == project_id)
    query = query.order_by(MemorialPage.created_at.desc())

    result = await db.execute(query)
    return list(result.scalars().all())


async def get_org_objects(
    db: AsyncSession,
    org_id: uuid.UUID,
    project_id: uuid.UUID | None = None,
    status_filter: ObjectStatus | None = None,
) -> list[MemoryObject]:
    """Get org-owned objects."""
    query = select(MemoryObject).where(MemoryObject.owner_org_id == org_id)

    if project_id:
        query = query.where(MemoryObject.org_project_id == project_id)
    if status_filter:
        query = query.where(MemoryObject.status == status_filter)

    query = query.order_by(MemoryObject.created_at.desc())

    result = await db.execute(query)
    return list(result.scalars().all())
