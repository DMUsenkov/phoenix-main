"""Organization routes for Phoenix API."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.auth.dependencies import ActiveUser
from app.auth.org_rbac import require_org_admin, require_org_member
from app.db.session import get_db
from app.models import Organization, OrganizationMember, OrgRole
from app.services import org_service
from app.api.schemas.org import (
    OrganizationCreate,
    OrganizationUpdate,
    OrganizationResponse,
    OrganizationWithRoleResponse,
    OrganizationListResponse,
    OrganizationMemberResponse,
    MemberUpdateRequest,
    InviteCreateRequest,
    InviteResponse,
    InviteAcceptResponse,
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ProjectListResponse,
)


router = APIRouter(prefix="/orgs", tags=["Organizations"])


@router.post("", response_model=OrganizationResponse)
async def create_organization(
    data: OrganizationCreate,
    user: ActiveUser,
    db: AsyncSession = Depends(get_db),
) -> OrganizationResponse:
    """Create a new organization. Creator becomes org_admin."""
    org = await org_service.create_organization(
        db,
        name=data.name,
        user_id=user.id,
        org_type=data.type,
        description=data.description,
    )
    await db.commit()
    await db.refresh(org)

    return OrganizationResponse.model_validate(org)


@router.get("", response_model=OrganizationListResponse)
async def list_my_organizations(
    user: ActiveUser,
    db: AsyncSession = Depends(get_db),
) -> OrganizationListResponse:
    """List organizations where current user is a member."""
    from app.auth.org_rbac import get_user_org_role

    orgs = await org_service.get_user_organizations(db, user.id)


    items = []
    for org in orgs:
        org_role = await get_user_org_role(db, org.id, user.id)
        org_dict = {
            "id": org.id,
            "name": org.name,
            "slug": org.slug,
            "type": org.type,
            "description": org.description,
            "is_active": org.is_active,
            "created_at": org.created_at,
            "updated_at": org.updated_at,
            "my_role": org_role.value if org_role else "org_viewer",
        }
        items.append(OrganizationWithRoleResponse(**org_dict))

    return OrganizationListResponse(
        items=items,
        total=len(orgs),
    )


@router.get("/{org_id}", response_model=OrganizationResponse)
async def get_organization(
    org_id: uuid.UUID,
    user: ActiveUser,
    db: AsyncSession = Depends(get_db),
) -> OrganizationResponse:
    """Get organization details. Requires membership."""
    await require_org_member(db, org_id, user)

    org = await org_service.get_organization_by_id(db, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    return OrganizationResponse.model_validate(org)


@router.patch("/{org_id}", response_model=OrganizationResponse)
async def update_organization(
    org_id: uuid.UUID,
    data: OrganizationUpdate,
    user: ActiveUser,
    db: AsyncSession = Depends(get_db),
) -> OrganizationResponse:
    """Update organization. Requires org_admin."""
    await require_org_admin(db, org_id, user)

    org = await org_service.get_organization_by_id(db, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    org = await org_service.update_organization(
        db,
        org,
        name=data.name,
        description=data.description,
        org_type=data.type,
    )
    await db.commit()
    await db.refresh(org)

    return OrganizationResponse.model_validate(org)


@router.delete("/{org_id}")
async def delete_organization(
    org_id: uuid.UUID,
    user: ActiveUser,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Soft delete organization. Requires org_admin."""
    await require_org_admin(db, org_id, user)

    org = await org_service.get_organization_by_id(db, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    await org_service.deactivate_organization(db, org)
    await db.commit()

    return {"message": "Organization deactivated"}


@router.get("/{org_id}/members", response_model=list[OrganizationMemberResponse])
async def list_members(
    org_id: uuid.UUID,
    user: ActiveUser,
    db: AsyncSession = Depends(get_db),
) -> list[OrganizationMemberResponse]:
    """List organization members. Requires membership."""
    await require_org_member(db, org_id, user)

    members = await org_service.get_org_members(db, org_id)

    return [OrganizationMemberResponse.model_validate(m) for m in members]


@router.patch("/{org_id}/members/{member_id}", response_model=OrganizationMemberResponse)
async def update_member(
    org_id: uuid.UUID,
    member_id: uuid.UUID,
    data: MemberUpdateRequest,
    user: ActiveUser,
    db: AsyncSession = Depends(get_db),
) -> OrganizationMemberResponse:
    """Update member role or revoke. Requires org_admin."""
    await require_org_admin(db, org_id, user)

    result = await db.execute(
        select(OrganizationMember).where(
            OrganizationMember.id == member_id,
            OrganizationMember.org_id == org_id,
        )
    )
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    if data.revoke:
        member = await org_service.revoke_member(db, member)
    elif data.role:
        member = await org_service.update_member_role(db, member, OrgRole(data.role))

    await db.commit()
    await db.refresh(member)

    return OrganizationMemberResponse.model_validate(member)


@router.post("/{org_id}/users", response_model=OrganizationMemberResponse)
async def create_org_user(
    org_id: uuid.UUID,
    data: dict,
    user: ActiveUser,
    db: AsyncSession = Depends(get_db),
) -> OrganizationMemberResponse:
    """Create user directly in organization. Requires admin or org_admin with org_admin role."""
    from app.auth.org_rbac import can_manage_org_users, get_user_org_role
    from app.models import User, UserRole as SystemUserRole
    from app.auth.security import hash_password
    from sqlalchemy import select


    org_role = await get_user_org_role(db, org_id, user.id)
    if not can_manage_org_users(user, org_role):
        raise HTTPException(
            status_code=403,
            detail="Only admin or org_admin with org_admin role can create users"
        )

    org = await org_service.get_organization_by_id(db, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")


    email = data.get("email")
    password = data.get("password")
    display_name = data.get("display_name")
    system_role = data.get("system_role", "org_user")
    org_role_str = data.get("org_role", "org_viewer")

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required")

    if system_role not in ["org_user", "org_admin"]:
        raise HTTPException(status_code=400, detail="Invalid system role")


    result = await db.execute(select(User).where(User.email == email.lower()))
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="Email already registered"
        )


    new_user = User(
        email=email.lower(),
        password_hash=hash_password(password),
        display_name=display_name,
        role=SystemUserRole(system_role),
    )
    db.add(new_user)
    await db.flush()
    await db.refresh(new_user)


    member = await org_service.create_member(
        db,
        org_id=org_id,
        user_id=new_user.id,
        role=OrgRole(org_role_str),
    )

    await db.commit()
    await db.refresh(member)

    return OrganizationMemberResponse.model_validate(member)


@router.post("/{org_id}/invites", response_model=InviteResponse)
async def create_invite(
    org_id: uuid.UUID,
    data: InviteCreateRequest,
    user: ActiveUser,
    db: AsyncSession = Depends(get_db),
) -> InviteResponse:
    """Create invite to organization. Requires org_admin."""
    await require_org_admin(db, org_id, user)

    org = await org_service.get_organization_by_id(db, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    invite = await org_service.create_invite(
        db,
        org_id=org_id,
        email=data.email,
        role=OrgRole(data.role),
        created_by_user_id=user.id,
    )
    await db.commit()
    await db.refresh(invite)

    return InviteResponse.model_validate(invite)


@router.post("/invites/{token}/accept", response_model=InviteAcceptResponse)
async def accept_invite(
    token: str,
    user: ActiveUser,
    db: AsyncSession = Depends(get_db),
) -> InviteAcceptResponse:
    """Accept organization invite."""
    invite = await org_service.get_invite_by_token(db, token)
    if not invite:
        raise HTTPException(status_code=404, detail="Invite not found")

    try:
        member = await org_service.accept_invite(db, invite, user.id)
        await db.commit()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return InviteAcceptResponse(
        message="Successfully joined organization",
        org_id=invite.org_id,
        org_name=invite.organization.name,
        role=member.role.value,
    )


@router.post("/{org_id}/projects", response_model=ProjectResponse)
async def create_project(
    org_id: uuid.UUID,
    data: ProjectCreate,
    user: ActiveUser,
    db: AsyncSession = Depends(get_db),
) -> ProjectResponse:
    """Create organization project. Requires org_admin or org_editor."""
    from app.auth.org_rbac import require_org_editor
    await require_org_editor(db, org_id, user)

    project = await org_service.create_org_project(
        db,
        org_id=org_id,
        name=data.name,
        description=data.description,
        lat=data.lat,
        lng=data.lng,
        address=data.address,
    )
    await db.commit()
    await db.refresh(project)

    return ProjectResponse.model_validate(project)


@router.get("/{org_id}/projects", response_model=ProjectListResponse)
async def list_projects(
    org_id: uuid.UUID,
    user: ActiveUser,
    include_archived: bool = Query(False),
    db: AsyncSession = Depends(get_db),
) -> ProjectListResponse:
    """List organization projects. Requires membership."""
    await require_org_member(db, org_id, user)

    projects = await org_service.get_org_projects(db, org_id, include_archived)

    return ProjectListResponse(
        items=[ProjectResponse.model_validate(p) for p in projects],
        total=len(projects),
    )


@router.patch("/{org_id}/projects/{project_id}", response_model=ProjectResponse)
async def update_project(
    org_id: uuid.UUID,
    project_id: uuid.UUID,
    data: ProjectUpdate,
    user: ActiveUser,
    db: AsyncSession = Depends(get_db),
) -> ProjectResponse:
    """Update project. Requires org_admin or org_editor."""
    from app.auth.org_rbac import require_org_editor
    await require_org_editor(db, org_id, user)

    project = await org_service.get_project_by_id(db, project_id)
    if not project or project.org_id != org_id:
        raise HTTPException(status_code=404, detail="Project not found")

    project = await org_service.update_project(
        db,
        project,
        name=data.name,
        description=data.description,
        lat=data.lat,
        lng=data.lng,
        address=data.address,
    )
    await db.commit()
    await db.refresh(project)

    return ProjectResponse.model_validate(project)


@router.delete("/{org_id}/projects/{project_id}")
async def archive_project(
    org_id: uuid.UUID,
    project_id: uuid.UUID,
    user: ActiveUser,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Archive project. Requires org_admin or org_editor."""
    from app.auth.org_rbac import require_org_editor
    await require_org_editor(db, org_id, user)

    project = await org_service.get_project_by_id(db, project_id)
    if not project or project.org_id != org_id:
        raise HTTPException(status_code=404, detail="Project not found")

    await org_service.archive_project(db, project)
    await db.commit()

    return {"message": "Project archived"}
