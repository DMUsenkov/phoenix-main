"""Organization RBAC helpers for Phoenix API.

Role hierarchy:
- System roles (UserRole): user, org_user, org_admin, admin
  - admin: Full platform access
  - org_admin: Can create orgs, manage org users, moderate org content
  - org_user: Can create pages within their org
  - user: Regular B2C user

- Organization roles (OrgRole): org_admin, org_editor, org_moderator, org_viewer
  - org_admin: Full org access + member management
  - org_editor: CRUD pages/objects
  - org_moderator: Moderate content
  - org_viewer: Read-only access
"""

import uuid
from typing import Annotated

from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import ActiveUser
from app.db.session import get_db
from app.models import (
    Organization,
    OrganizationMember,
    OrgRole,
    MemberStatus,
    MemorialPage,
    MemoryObject,
    UserRole,
)


async def get_org_membership(
    db: AsyncSession,
    org_id: uuid.UUID,
    user_id: uuid.UUID,
) -> OrganizationMember | None:
    """Get active membership for user in organization."""
    result = await db.execute(
        select(OrganizationMember).where(
            OrganizationMember.org_id == org_id,
            OrganizationMember.user_id == user_id,
            OrganizationMember.status == MemberStatus.ACTIVE,
        )
    )
    return result.scalar_one_or_none()


async def get_user_org_role(
    db: AsyncSession,
    org_id: uuid.UUID,
    user_id: uuid.UUID,
) -> OrgRole | None:
    """Get user's role in organization, or None if not a member."""
    member = await get_org_membership(db, org_id, user_id)
    return member.role if member else None


async def require_org_role(
    db: AsyncSession,
    org_id: uuid.UUID,
    user: ActiveUser,
    allowed_roles: list[OrgRole],
) -> OrganizationMember:
    """Require user to have one of the allowed roles in organization.

    System admin always passes.
    Raises 403 if user doesn't have required role.
    """
    if user.role == UserRole.ADMIN:
        member = await get_org_membership(db, org_id, user.id)
        if member:
            return member
        fake_member = OrganizationMember(
            org_id=org_id,
            user_id=user.id,
            role=OrgRole.ORG_ADMIN,
            status=MemberStatus.ACTIVE,
        )
        return fake_member

    member = await get_org_membership(db, org_id, user.id)
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a member of this organization",
        )

    if member.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions in organization",
        )

    return member


async def require_org_admin(
    db: AsyncSession,
    org_id: uuid.UUID,
    user: ActiveUser,
) -> OrganizationMember:
    """Require org_admin role."""
    return await require_org_role(db, org_id, user, [OrgRole.ORG_ADMIN])


async def require_org_editor(
    db: AsyncSession,
    org_id: uuid.UUID,
    user: ActiveUser,
) -> OrganizationMember:
    """Require org_admin or org_editor role."""
    return await require_org_role(
        db, org_id, user, [OrgRole.ORG_ADMIN, OrgRole.ORG_EDITOR]
    )


async def require_org_member(
    db: AsyncSession,
    org_id: uuid.UUID,
    user: ActiveUser,
) -> OrganizationMember:
    """Require any active membership in organization."""
    return await require_org_role(
        db,
        org_id,
        user,
        [OrgRole.ORG_ADMIN, OrgRole.ORG_EDITOR, OrgRole.ORG_MODERATOR, OrgRole.ORG_VIEWER],
    )


async def can_access_page(
    db: AsyncSession,
    page: MemorialPage,
    user: ActiveUser,
    require_write: bool = False,
) -> bool:
    """Check if user can access a page (read or write).

    Returns True if:
    - User is system admin
    - User owns the page (owner_user_id)
    - Page is org-owned and user has appropriate org role
    """
    if user.role == UserRole.ADMIN:
        return True

    if page.owner_user_id == user.id:
        return True

    if page.owner_org_id:
        member = await get_org_membership(db, page.owner_org_id, user.id)
        if not member:
            return False

        if require_write:
            return member.role in [OrgRole.ORG_ADMIN, OrgRole.ORG_EDITOR]
        return True

    return False


async def can_access_object(
    db: AsyncSession,
    obj: MemoryObject,
    user: ActiveUser,
    require_write: bool = False,
) -> bool:
    """Check if user can access a memory object (read or write).

    Returns True if:
    - User is system admin
    - User owns the object (owner_user_id)
    - Object is org-owned and user has appropriate org role
    """
    if user.role == UserRole.ADMIN:
        return True

    if obj.owner_user_id == user.id:
        return True

    if obj.owner_org_id:
        member = await get_org_membership(db, obj.owner_org_id, user.id)
        if not member:
            return False

        if require_write:
            return member.role in [OrgRole.ORG_ADMIN, OrgRole.ORG_EDITOR]
        return True

    return False


def check_page_access(
    page: MemorialPage,
    user: ActiveUser,
) -> None:
    """Synchronous check for page access (user-owned only).

    For org-owned pages, use can_access_page async version.
    Raises 403 if access denied.
    """
    if user.role == UserRole.ADMIN:
        return

    if page.owner_user_id == user.id:
        return

    if page.owner_org_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied - org ownership requires async check",
        )

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Access denied",
    )


def is_system_org_role(user: ActiveUser) -> bool:
    """Check if user has org_admin or org_user system role."""
    return user.role in [UserRole.ORG_ADMIN, UserRole.ORG_USER]


def can_create_organization(user: ActiveUser) -> bool:
    """Check if user can create organizations.

    Only admin and org_admin system roles can create organizations.
    """
    return user.role in [UserRole.ADMIN, UserRole.ORG_ADMIN]


def can_manage_org_users(user: ActiveUser, org_role: OrgRole | None) -> bool:
    """Check if user can manage users within an organization.

    Requires:
    - System admin, OR
    - org_admin system role + org_admin org role
    """
    if user.role == UserRole.ADMIN:
        return True
    if user.role == UserRole.ORG_ADMIN and org_role == OrgRole.ORG_ADMIN:
        return True
    return False


async def require_org_content_creator(
    db: AsyncSession,
    org_id: uuid.UUID,
    user: ActiveUser,
) -> OrganizationMember:
    """Require ability to create content in organization.

    Allowed for:
    - System admin
    - org_admin system role with org_admin/org_editor org role
    - org_user system role with org_admin/org_editor org role
    """
    if user.role == UserRole.ADMIN:
        member = await get_org_membership(db, org_id, user.id)
        if member:
            return member
        fake_member = OrganizationMember(
            org_id=org_id,
            user_id=user.id,
            role=OrgRole.ORG_ADMIN,
            status=MemberStatus.ACTIVE,
        )
        return fake_member

    if user.role not in [UserRole.ORG_ADMIN, UserRole.ORG_USER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only organization users can create content in organizations",
        )

    member = await get_org_membership(db, org_id, user.id)
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a member of this organization",
        )

    if member.role not in [OrgRole.ORG_ADMIN, OrgRole.ORG_EDITOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to create content",
        )

    return member


async def require_org_moderator(
    db: AsyncSession,
    org_id: uuid.UUID,
    user: ActiveUser,
) -> OrganizationMember:
    """Require ability to moderate content in organization.

    Allowed for:
    - System admin
    - org_admin system role with org_admin/org_moderator org role
    """
    if user.role == UserRole.ADMIN:
        member = await get_org_membership(db, org_id, user.id)
        if member:
            return member
        fake_member = OrganizationMember(
            org_id=org_id,
            user_id=user.id,
            role=OrgRole.ORG_ADMIN,
            status=MemberStatus.ACTIVE,
        )
        return fake_member

    if user.role != UserRole.ORG_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only organization admins can moderate content",
        )

    member = await get_org_membership(db, org_id, user.id)
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a member of this organization",
        )

    if member.role not in [OrgRole.ORG_ADMIN, OrgRole.ORG_MODERATOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to moderate content",
        )

    return member
