"""Pydantic schemas for organizations."""

import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


OrgTypeEnum = Literal["government", "ngo", "commercial", "other"]
OrgRoleEnum = Literal["org_admin", "org_editor", "org_moderator", "org_viewer"]
MemberStatusEnum = Literal["invited", "active", "revoked"]
InviteStatusEnum = Literal["pending", "accepted", "expired", "revoked"]
ProjectStatusEnum = Literal["active", "archived"]


class OrganizationCreate(BaseModel):
    """Schema for creating organization."""

    name: str = Field(..., min_length=2, max_length=255)
    type: OrgTypeEnum = "other"
    description: str | None = None


class OrganizationUpdate(BaseModel):
    """Schema for updating organization."""

    name: str | None = Field(None, min_length=2, max_length=255)
    type: OrgTypeEnum | None = None
    description: str | None = None


class OrganizationResponse(BaseModel):
    """Response schema for organization."""

    id: uuid.UUID
    name: str
    slug: str
    type: OrgTypeEnum
    description: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class OrganizationWithRoleResponse(BaseModel):
    """Response schema for organization with user's role."""

    id: uuid.UUID
    name: str
    slug: str
    type: OrgTypeEnum
    description: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    my_role: OrgRoleEnum

    model_config = {"from_attributes": True}


class OrganizationListResponse(BaseModel):
    """Response schema for organization list."""

    items: list[OrganizationWithRoleResponse]
    total: int


class MemberUserResponse(BaseModel):
    """Nested user info in member response."""

    id: uuid.UUID
    email: str
    display_name: str | None

    model_config = {"from_attributes": True}


class OrganizationMemberResponse(BaseModel):
    """Response schema for organization member."""

    id: uuid.UUID
    org_id: uuid.UUID
    user_id: uuid.UUID
    role: OrgRoleEnum
    status: MemberStatusEnum
    created_at: datetime
    user: MemberUserResponse | None = None

    model_config = {"from_attributes": True}


class MemberUpdateRequest(BaseModel):
    """Request to update member role or status."""

    role: OrgRoleEnum | None = None
    revoke: bool = False


class InviteCreateRequest(BaseModel):
    """Request to create invite."""

    email: EmailStr
    role: OrgRoleEnum = "org_viewer"


class InviteResponse(BaseModel):
    """Response schema for invite."""

    id: uuid.UUID
    org_id: uuid.UUID
    email: str
    role: OrgRoleEnum
    token: str
    status: InviteStatusEnum
    expires_at: datetime
    created_at: datetime

    model_config = {"from_attributes": True}


class InviteAcceptResponse(BaseModel):
    """Response after accepting invite."""

    message: str
    org_id: uuid.UUID
    org_name: str
    role: OrgRoleEnum


class ProjectCreate(BaseModel):
    """Schema for creating project."""

    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    lat: float | None = Field(None, ge=-90, le=90, description="Latitude")
    lng: float | None = Field(None, ge=-180, le=180, description="Longitude")
    address: str | None = Field(None, max_length=512)


class ProjectUpdate(BaseModel):
    """Schema for updating project."""

    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    lat: float | None = Field(None, ge=-90, le=90)
    lng: float | None = Field(None, ge=-180, le=180)
    address: str | None = Field(None, max_length=512)


class ProjectResponse(BaseModel):
    """Response schema for project."""

    id: uuid.UUID
    org_id: uuid.UUID
    name: str
    description: str | None
    lat: float | None
    lng: float | None
    address: str | None
    status: ProjectStatusEnum
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProjectListResponse(BaseModel):
    """Response schema for project list."""

    items: list[ProjectResponse]
    total: int
