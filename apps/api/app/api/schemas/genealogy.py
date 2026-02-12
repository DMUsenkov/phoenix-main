"""Pydantic schemas for Genealogy API."""

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field, EmailStr

from app.models import RelationType, RelationshipStatus, ClaimInviteStatus


class PersonSearchResult(BaseModel):
    """Person search result."""

    id: uuid.UUID
    full_name: str
    birth_date: str | None = None
    death_date: str | None = None
    life_status: str
    page_slug: str | None = None
    avatar_url: str | None = None

    model_config = {"from_attributes": True}


class PersonSearchResponse(BaseModel):
    """Response for person search."""

    items: list[PersonSearchResult]
    total: int


class CreateRelationshipRequest(BaseModel):
    """Request to create a family relationship."""

    target_person_id: uuid.UUID
    relation_type: RelationType
    note: str | None = None


class RelationshipResponse(BaseModel):
    """Response for a family relationship."""

    id: uuid.UUID
    from_person_id: uuid.UUID
    to_person_id: uuid.UUID
    to_person_name: str | None = None
    relation_type: RelationType
    status: RelationshipStatus
    requested_by_user_id: uuid.UUID | None = None
    requested_to_user_id: uuid.UUID | None = None
    decided_by_user_id: uuid.UUID | None = None
    reason: str | None = None
    inverse_relationship_id: uuid.UUID | None = None
    created_at: datetime
    decided_at: datetime | None = None

    model_config = {"from_attributes": True}


class RelationshipListResponse(BaseModel):
    """Response for list of relationships."""

    items: list[RelationshipResponse]


class RejectRelationshipRequest(BaseModel):
    """Request to reject a relationship."""

    reason: str = Field(..., min_length=1, max_length=500)


class CreateClaimInviteRequest(BaseModel):
    """Request to create a claim invite."""

    email: EmailStr


class ClaimInviteResponse(BaseModel):
    """Response for a claim invite."""

    id: uuid.UUID
    person_id: uuid.UUID
    email: str
    token: str
    status: ClaimInviteStatus
    expires_at: datetime
    created_by_user_id: uuid.UUID | None = None
    accepted_by_user_id: uuid.UUID | None = None
    created_at: datetime
    accepted_at: datetime | None = None

    model_config = {"from_attributes": True}


class ClaimInviteListResponse(BaseModel):
    """Response for list of claim invites."""

    items: list[ClaimInviteResponse]


class AcceptClaimRequest(BaseModel):
    """Request to accept a claim invite."""

    transfer_ownership: bool = True


class GraphNodeResponse(BaseModel):
    """Node in family graph."""

    id: str
    full_name: str
    life_status: str
    gender: str
    page_slug: str | None = None
    linked_user_id: str | None = None


class GraphEdgeResponse(BaseModel):
    """Edge in family graph."""

    id: str
    from_person_id: str = Field(alias="from")
    to_person_id: str = Field(alias="to")
    relation_type: str

    model_config = {"populate_by_name": True}


class FamilyGraphResponse(BaseModel):
    """Response for family graph."""

    root_person_id: str
    nodes: list[GraphNodeResponse]
    edges: list[GraphEdgeResponse]
    depth: int


class MessageResponse(BaseModel):
    """Simple message response."""

    message: str
