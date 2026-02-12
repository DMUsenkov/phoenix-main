"""Genealogy routes for Phoenix API - Family relationships and claims."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.db.session import get_db
from app.models import User, RelationshipStatus, Person, MemorialPage
from app.services import relationship_service, claim_service, graph_service
from app.api.schemas.genealogy import (
    CreateRelationshipRequest,
    RelationshipResponse,
    RelationshipListResponse,
    RejectRelationshipRequest,
    CreateClaimInviteRequest,
    ClaimInviteResponse,
    ClaimInviteListResponse,
    AcceptClaimRequest,
    FamilyGraphResponse,
    GraphNodeResponse,
    GraphEdgeResponse,
    MessageResponse,
    PersonSearchResult,
    PersonSearchResponse,
)
from sqlalchemy import select

router = APIRouter(tags=["Genealogy"])


async def can_edit_person(
    db: AsyncSession,
    person_id: uuid.UUID,
    user: User,
) -> bool:
    """Check if user can edit a person (owner of page or admin)."""
    from app.models import UserRole

    if user.role == UserRole.ADMIN:
        return True

    result = await db.execute(
        select(MemorialPage).where(
            MemorialPage.person_id == person_id,
            MemorialPage.owner_user_id == user.id,
        )
    )
    page = result.scalar_one_or_none()
    if page:
        return True

    result = await db.execute(
        select(Person).where(
            Person.id == person_id,
            Person.linked_user_id == user.id,
        )
    )
    person = result.scalar_one_or_none()
    return person is not None


@router.post(
    "/persons/{person_id}/relationships",
    response_model=RelationshipResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create family relationship",
)
async def create_relationship(
    person_id: uuid.UUID,
    data: CreateRelationshipRequest,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> RelationshipResponse:
    """Create a family relationship from person to target."""
    if not await can_edit_person(db, person_id, user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to edit this person",
        )

    if person_id == data.target_person_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot create self-relationship",
        )

    target = await relationship_service.get_person_by_id(db, data.target_person_id)
    if not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target person not found",
        )

    exists = await relationship_service.check_relationship_exists(
        db, person_id, data.target_person_id, data.relation_type
    )
    if exists:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Relationship already exists",
        )

    parent_constraint_violated = await relationship_service.check_unique_parent_constraint(
        db, person_id, data.relation_type
    )
    if parent_constraint_violated:
        parent_type = "мать" if data.relation_type.value == "mother" else "отец"
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"У человека уже есть {parent_type}. Можно указать только одну мать и одного отца.",
        )

    relationship = await relationship_service.create_relationship(
        db=db,
        from_person_id=person_id,
        to_person_id=data.target_person_id,
        relation_type=data.relation_type,
        requested_by_user_id=user.id,
    )

    return RelationshipResponse.model_validate(relationship)


@router.get(
    "/persons/{person_id}/relationships",
    response_model=RelationshipListResponse,
    summary="List person relationships",
)
async def list_person_relationships(
    person_id: uuid.UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    include_pending: bool = Query(False, description="Include pending relationships"),
) -> RelationshipListResponse:
    """List relationships for a person."""
    can_see_pending = await can_edit_person(db, person_id, user)

    relationships = await relationship_service.list_person_relationships(
        db=db,
        person_id=person_id,
        include_pending=include_pending and can_see_pending,
    )

    items = []
    for r in relationships:
        rel_dict = {
            "id": r.id,
            "from_person_id": r.from_person_id,
            "to_person_id": r.to_person_id,
            "to_person_name": r.to_person.full_name if r.to_person else None,
            "relation_type": r.relation_type,
            "status": r.status,
            "requested_by_user_id": r.requested_by_user_id,
            "requested_to_user_id": r.requested_to_user_id,
            "decided_by_user_id": r.decided_by_user_id,
            "reason": r.reason,
            "inverse_relationship_id": r.inverse_relationship_id,
            "created_at": r.created_at,
            "decided_at": r.decided_at,
        }
        items.append(RelationshipResponse(**rel_dict))

    return RelationshipListResponse(items=items)


@router.get(
    "/relationships/requests",
    response_model=RelationshipListResponse,
    summary="List pending relationship requests",
)
async def list_pending_requests(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> RelationshipListResponse:
    """List pending relationship requests for current user."""
    relationships = await relationship_service.list_pending_requests(db, user.id)

    return RelationshipListResponse(
        items=[RelationshipResponse.model_validate(r) for r in relationships]
    )


@router.post(
    "/relationships/{relationship_id}/approve",
    response_model=RelationshipResponse,
    summary="Approve relationship request",
)
async def approve_relationship(
    relationship_id: uuid.UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> RelationshipResponse:
    """Approve a pending relationship request."""
    relationship = await relationship_service.get_relationship_by_id(db, relationship_id)

    if not relationship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Relationship not found",
        )

    if relationship.requested_to_user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to approve this relationship",
        )

    if relationship.status != RelationshipStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Relationship already {relationship.status.value}",
        )

    updated = await relationship_service.approve_relationship(
        db=db,
        relationship=relationship,
        decided_by_user_id=user.id,
    )

    return RelationshipResponse.model_validate(updated)


@router.post(
    "/relationships/{relationship_id}/reject",
    response_model=RelationshipResponse,
    summary="Reject relationship request",
)
async def reject_relationship(
    relationship_id: uuid.UUID,
    data: RejectRelationshipRequest,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> RelationshipResponse:
    """Reject a pending relationship request."""
    relationship = await relationship_service.get_relationship_by_id(db, relationship_id)

    if not relationship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Relationship not found",
        )

    if relationship.requested_to_user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to reject this relationship",
        )

    if relationship.status != RelationshipStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Relationship already {relationship.status.value}",
        )

    updated = await relationship_service.reject_relationship(
        db=db,
        relationship=relationship,
        decided_by_user_id=user.id,
        reason=data.reason,
    )

    return RelationshipResponse.model_validate(updated)


@router.post(
    "/persons/{person_id}/claim-invites",
    response_model=ClaimInviteResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create claim invite",
)
async def create_claim_invite(
    person_id: uuid.UUID,
    data: CreateClaimInviteRequest,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ClaimInviteResponse:
    """Create a claim invite for a person."""
    if not await can_edit_person(db, person_id, user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to create invites for this person",
        )

    person = await relationship_service.get_person_by_id(db, person_id)
    if not person:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Person not found",
        )

    if person.linked_user_id is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Person is already linked to a user",
        )

    existing = await claim_service.get_pending_invite_for_email(db, person_id, data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Pending invite already exists for this email",
        )

    invite = await claim_service.create_claim_invite(
        db=db,
        person_id=person_id,
        email=data.email,
        created_by_user_id=user.id,
    )

    return ClaimInviteResponse.model_validate(invite)


@router.get(
    "/persons/{person_id}/claim-invites",
    response_model=ClaimInviteListResponse,
    summary="List claim invites for person",
)
async def list_claim_invites(
    person_id: uuid.UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ClaimInviteListResponse:
    """List claim invites for a person."""
    if not await can_edit_person(db, person_id, user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view invites for this person",
        )

    invites = await claim_service.list_person_invites(db, person_id)

    return ClaimInviteListResponse(
        items=[ClaimInviteResponse.model_validate(i) for i in invites]
    )


@router.post(
    "/persons/claim/{token}/accept",
    response_model=MessageResponse,
    summary="Accept claim invite",
)
async def accept_claim_invite(
    token: str,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    data: AcceptClaimRequest | None = None,
) -> MessageResponse:
    """Accept a claim invite and link person to current user."""
    invite = await claim_service.get_invite_by_token(db, token)

    if not invite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invite not found or expired",
        )

    transfer = data.transfer_ownership if data else True

    try:
        await claim_service.accept_claim_invite(
            db=db,
            invite=invite,
            user_id=user.id,
            transfer_page_ownership=transfer,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    return MessageResponse(message="Person successfully linked to your account")


@router.get(
    "/persons/{person_id}/family-graph",
    response_model=FamilyGraphResponse,
    summary="Get family graph",
)
async def get_family_graph(
    person_id: uuid.UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    depth: int = Query(3, ge=1, le=5, description="Graph depth"),
    include_pending: bool = Query(False, description="Include pending relationships"),
) -> FamilyGraphResponse:
    """Get family graph for a person using BFS traversal."""
    person = await relationship_service.get_person_by_id(db, person_id)
    if not person:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Person not found",
        )

    can_see_pending = await can_edit_person(db, person_id, user)

    graph = await graph_service.get_family_graph(
        db=db,
        root_person_id=person_id,
        depth=depth,
        include_pending=include_pending and can_see_pending,
    )

    return FamilyGraphResponse(
        root_person_id=graph.root_person_id,
        nodes=[
            GraphNodeResponse(
                id=n.id,
                full_name=n.full_name,
                life_status=n.life_status,
                gender=n.gender,
                page_slug=n.page_slug,
                linked_user_id=n.linked_user_id,
            )
            for n in graph.nodes
        ],
        edges=[
            GraphEdgeResponse(
                id=e.id,
                from_person_id=e.from_person_id,
                to_person_id=e.to_person_id,
                relation_type=e.relation_type,
            )
            for e in graph.edges
        ],
        depth=graph.depth,
    )


@router.get("/persons/search", response_model=PersonSearchResponse)
async def search_persons(
    q: str = Query(..., min_length=2, description="Search query (name)"),
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Search for persons by name."""
    from sqlalchemy import or_, func
    from app.models import Media

    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")


    search_term = f"%{q}%"

    query = (
        select(Person, MemorialPage.slug.label("page_slug"))
        .outerjoin(MemorialPage, MemorialPage.person_id == Person.id)
        .where(
            Person.full_name.ilike(search_term)
        )
        .limit(limit)
    )

    result = await db.execute(query)
    rows = result.all()

    items = []
    for row in rows:
        person = row[0]
        page_slug = row[1]


        avatar_url = None
        if page_slug:
            media_result = await db.execute(
                select(Media.original_url).join(MemorialPage).where(
                    MemorialPage.person_id == person.id,
                    Media.is_primary == True,
                )
            )
            avatar_url = media_result.scalar_one_or_none()

        items.append(PersonSearchResult(
            id=person.id,
            full_name=person.full_name,
            birth_date=person.birth_date.isoformat() if person.birth_date else None,
            death_date=person.death_date.isoformat() if person.death_date else None,
            life_status=person.life_status.value if person.life_status else "unknown",
            page_slug=page_slug,
            avatar_url=avatar_url,
        ))

    return PersonSearchResponse(items=items, total=len(items))
