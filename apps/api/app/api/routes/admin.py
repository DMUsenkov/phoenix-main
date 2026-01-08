"""Admin routes for Phoenix API (RBAC demonstration)."""

import uuid
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import require_role
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.organization import Organization, OrgType, OrganizationMember, OrgRole, MemberStatus
from app.models.memorial_page import MemorialPage, PageStatus

router = APIRouter(prefix="/admin", tags=["Admin"])


class UserResponse(BaseModel):
    """User response for admin."""
    model_config = {"from_attributes": True}

    id: uuid.UUID
    email: str
    display_name: str | None
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime


class UsersListResponse(BaseModel):
    """Paginated users list."""
    items: list[UserResponse]
    total: int
    limit: int
    offset: int


class AdminStatsResponse(BaseModel):
    """Admin dashboard statistics."""
    users_count: int
    orgs_count: int
    pages_count: int
    pages_on_moderation: int


@router.get(
    "/stats",
    response_model=AdminStatsResponse,
    summary="Get admin dashboard statistics",
)
async def get_admin_stats(
    _: Annotated[User, Depends(require_role([UserRole.ADMIN]))],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AdminStatsResponse:
    """Get statistics for admin dashboard."""

    users_result = await db.execute(select(func.count(User.id)))
    users_count = users_result.scalar() or 0


    orgs_result = await db.execute(select(func.count(Organization.id)))
    orgs_count = orgs_result.scalar() or 0


    pages_result = await db.execute(select(func.count(MemorialPage.id)))
    pages_count = pages_result.scalar() or 0


    moderation_result = await db.execute(
        select(func.count(MemorialPage.id)).where(
            MemorialPage.status == PageStatus.ON_MODERATION
        )
    )
    pages_on_moderation = moderation_result.scalar() or 0

    return AdminStatsResponse(
        users_count=users_count,
        orgs_count=orgs_count,
        pages_count=pages_count,
        pages_on_moderation=pages_on_moderation,
    )


@router.get(
    "/ping",
    summary="Admin ping (admin only)",
    responses={
        403: {"description": "Insufficient permissions"},
        401: {"description": "Not authenticated"},
    },
)
async def admin_ping(
    current_user: Annotated[User, Depends(require_role([UserRole.ADMIN]))],
) -> dict[str, str]:
    """Admin-only endpoint for testing RBAC."""
    return {
        "message": "pong",
        "admin_email": current_user.email,
    }


@router.get(
    "/users",
    response_model=UsersListResponse,
    summary="List all users (admin only)",
)
async def list_users(
    _: Annotated[User, Depends(require_role([UserRole.ADMIN]))],
    db: Annotated[AsyncSession, Depends(get_db)],
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
    role: UserRole | None = None,
) -> UsersListResponse:
    """List all users with pagination."""
    query = select(User)
    count_query = select(func.count(User.id))

    if role:
        query = query.where(User.role == role)
        count_query = count_query.where(User.role == role)

    query = query.order_by(User.created_at.desc()).offset(offset).limit(limit)

    result = await db.execute(query)
    users = result.scalars().all()

    count_result = await db.execute(count_query)
    total = count_result.scalar() or 0

    return UsersListResponse(
        items=[UserResponse.model_validate(u) for u in users],
        total=total,
        limit=limit,
        offset=offset,
    )


class CreateUserRequest(BaseModel):
    """Request to create a new user."""
    email: str
    password: str
    display_name: str | None = None
    role: UserRole = UserRole.USER


class UpdateUserRequest(BaseModel):
    """Request to update a user."""
    display_name: str | None = None
    role: UserRole | None = None
    is_active: bool | None = None


@router.post(
    "/users",
    response_model=UserResponse,
    status_code=201,
    summary="Create a new user (admin only)",
)
async def create_user(
    data: CreateUserRequest,
    _: Annotated[User, Depends(require_role([UserRole.ADMIN]))],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> UserResponse:
    """Create a new user with specified role."""
    from app.auth.security import hash_password

    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="User with this email already exists")

    user = User(
        id=uuid.uuid4(),
        email=data.email,
        password_hash=hash_password(data.password),
        display_name=data.display_name,
        role=data.role,
        is_active=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    return UserResponse.model_validate(user)


@router.patch(
    "/users/{user_id}",
    response_model=UserResponse,
    summary="Update a user (admin only)",
)
async def update_user(
    user_id: uuid.UUID,
    data: UpdateUserRequest,
    _: Annotated[User, Depends(require_role([UserRole.ADMIN]))],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> UserResponse:
    """Update user details."""
    from fastapi import HTTPException

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if data.display_name is not None:
        user.display_name = data.display_name
    if data.role is not None:
        user.role = data.role
    if data.is_active is not None:
        user.is_active = data.is_active

    await db.commit()
    await db.refresh(user)

    return UserResponse.model_validate(user)


class OrgResponse(BaseModel):
    """Organization response for admin."""
    model_config = {"from_attributes": True}

    id: uuid.UUID
    name: str
    slug: str
    type: OrgType
    description: str | None
    is_active: bool
    created_by_user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class OrgsListResponse(BaseModel):
    """Paginated orgs list."""
    items: list[OrgResponse]
    total: int
    limit: int
    offset: int


class CreateOrgRequest(BaseModel):
    """Request to create organization."""
    name: str
    type: OrgType = OrgType.OTHER
    description: str | None = None
    admin_user_id: uuid.UUID | None = None


class AddOrgMemberRequest(BaseModel):
    """Request to add member to organization."""
    user_id: uuid.UUID
    role: OrgRole = OrgRole.ORG_VIEWER


@router.get(
    "/orgs/{org_id}",
    response_model=OrgResponse,
    summary="Get organization details (admin or org_admin)",
)
async def get_org_detail(
    org_id: uuid.UUID,
    current_user: Annotated[User, Depends(require_role([UserRole.ADMIN, UserRole.ORG_ADMIN]))],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> OrgResponse:
    """Get organization details by ID."""
    result = await db.execute(select(Organization).where(Organization.id == org_id))
    org = result.scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")


    if current_user.role == UserRole.ORG_ADMIN:
        member_result = await db.execute(
            select(OrganizationMember)
            .where(OrganizationMember.org_id == org_id)
            .where(OrganizationMember.user_id == current_user.id)
            .where(OrganizationMember.status == MemberStatus.ACTIVE)
        )
        member = member_result.scalar_one_or_none()
        if not member:
            raise HTTPException(status_code=403, detail="Access denied to this organization")

    return OrgResponse.model_validate(org)


class OrgMemberResponse(BaseModel):
    """Organization member response."""
    model_config = {"from_attributes": True}

    id: uuid.UUID
    user_id: uuid.UUID
    user_email: str
    user_name: str | None
    role: OrgRole
    status: MemberStatus
    created_at: datetime


@router.get(
    "/orgs/{org_id}/members",
    response_model=dict,
    summary="Get organization members (admin or org_admin)",
)
async def get_org_members(
    org_id: uuid.UUID,
    current_user: Annotated[User, Depends(require_role([UserRole.ADMIN, UserRole.ORG_ADMIN]))],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Get list of organization members."""
    from sqlalchemy.orm import selectinload

    result = await db.execute(
        select(OrganizationMember)
        .where(OrganizationMember.org_id == org_id)
        .options(selectinload(OrganizationMember.user))
    )
    members = result.scalars().all()

    items = []
    for m in members:
        items.append({
            "id": str(m.id),
            "user_id": str(m.user_id),
            "role": m.role.value,
            "status": m.status.value,
            "created_at": m.created_at.isoformat() if m.created_at else None,
            "user": {
                "id": str(m.user.id) if m.user else "",
                "email": m.user.email if m.user else "",
                "display_name": m.user.display_name if m.user else None,
            } if m.user else None,
        })

    return {"items": items}


@router.get(
    "/orgs",
    response_model=OrgsListResponse,
    summary="List organizations (admin sees all, org_admin sees only their orgs)",
)
async def list_all_orgs(
    current_user: Annotated[User, Depends(require_role([UserRole.ADMIN, UserRole.ORG_ADMIN]))],
    db: Annotated[AsyncSession, Depends(get_db)],
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> OrgsListResponse:
    """List organizations. Admin sees all, org_admin sees only organizations they belong to."""
    if current_user.role == UserRole.ORG_ADMIN:

        query = (
            select(Organization)
            .join(OrganizationMember, Organization.id == OrganizationMember.org_id)
            .where(OrganizationMember.user_id == current_user.id)
            .where(OrganizationMember.status == MemberStatus.ACTIVE)
            .order_by(Organization.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        count_query = (
            select(func.count(Organization.id))
            .join(OrganizationMember, Organization.id == OrganizationMember.org_id)
            .where(OrganizationMember.user_id == current_user.id)
            .where(OrganizationMember.status == MemberStatus.ACTIVE)
        )
    else:

        query = select(Organization).order_by(Organization.created_at.desc()).offset(offset).limit(limit)
        count_query = select(func.count(Organization.id))

    result = await db.execute(query)
    orgs = result.scalars().all()

    count_result = await db.execute(count_query)
    total = count_result.scalar() or 0

    return OrgsListResponse(
        items=[OrgResponse.model_validate(o) for o in orgs],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.post(
    "/orgs",
    response_model=OrgResponse,
    status_code=201,
    summary="Create organization (admin only)",
)
async def create_org_admin(
    data: CreateOrgRequest,
    current_user: Annotated[User, Depends(require_role([UserRole.ADMIN]))],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> OrgResponse:
    """Create a new organization and optionally assign an admin."""
    import re

    slug = re.sub(r'[^a-z0-9]+', '-', data.name.lower()).strip('-')

    existing = await db.execute(select(Organization).where(Organization.slug == slug))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Organization with this name already exists")

    org = Organization(
        id=uuid.uuid4(),
        name=data.name,
        slug=slug,
        type=data.type,
        description=data.description,
        is_active=True,
        created_by_user_id=current_user.id,
    )
    db.add(org)

    admin_user_id = data.admin_user_id or current_user.id
    member = OrganizationMember(
        id=uuid.uuid4(),
        org_id=org.id,
        user_id=admin_user_id,
        role=OrgRole.ORG_ADMIN,
        status=MemberStatus.ACTIVE,
    )
    db.add(member)

    await db.commit()
    await db.refresh(org)

    return OrgResponse.model_validate(org)


@router.post(
    "/orgs/{org_id}/members",
    response_model=dict,
    status_code=201,
    summary="Add member to organization (admin only)",
)
async def add_org_member_admin(
    org_id: uuid.UUID,
    data: AddOrgMemberRequest,
    _: Annotated[User, Depends(require_role([UserRole.ADMIN]))],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Add a user to an organization with specified role."""
    org_result = await db.execute(select(Organization).where(Organization.id == org_id))
    org = org_result.scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    user_result = await db.execute(select(User).where(User.id == data.user_id))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    existing = await db.execute(
        select(OrganizationMember).where(
            OrganizationMember.org_id == org_id,
            OrganizationMember.user_id == data.user_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="User is already a member")

    member = OrganizationMember(
        id=uuid.uuid4(),
        org_id=org_id,
        user_id=data.user_id,
        role=data.role,
        status=MemberStatus.ACTIVE,
    )
    db.add(member)
    await db.commit()

    return {"message": "Member added successfully", "member_id": str(member.id)}
