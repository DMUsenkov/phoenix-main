"""Service for Family Relationship operations."""

import uuid
from datetime import datetime

from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import (
    FamilyRelationship,
    RelationType,
    RelationshipStatus,
    Person,
    get_inverse_relation,
)


async def get_person_by_id(
    db: AsyncSession,
    person_id: uuid.UUID,
) -> Person | None:
    """Get person by ID."""
    result = await db.execute(select(Person).where(Person.id == person_id))
    return result.scalar_one_or_none()


async def create_relationship(
    db: AsyncSession,
    from_person_id: uuid.UUID,
    to_person_id: uuid.UUID,
    relation_type: RelationType,
    requested_by_user_id: uuid.UUID,
) -> FamilyRelationship:
    """Create a family relationship. May be pending if target has linked user."""
    target_person = await get_person_by_id(db, to_person_id)

    needs_confirmation = (
        target_person is not None
        and target_person.linked_user_id is not None
        and target_person.linked_user_id != requested_by_user_id
    )

    status = RelationshipStatus.PENDING if needs_confirmation else RelationshipStatus.ACTIVE
    requested_to_user_id = target_person.linked_user_id if needs_confirmation else None

    relationship = FamilyRelationship(
        id=uuid.uuid4(),
        from_person_id=from_person_id,
        to_person_id=to_person_id,
        relation_type=relation_type,
        status=status,
        requested_by_user_id=requested_by_user_id,
        requested_to_user_id=requested_to_user_id,
        created_at=datetime.utcnow(),
    )
    db.add(relationship)
    await db.flush()

    if status == RelationshipStatus.ACTIVE:
        inverse = await create_inverse_relationship(db, relationship)
        relationship.inverse_relationship_id = inverse.id
        await db.flush()

    await db.refresh(relationship)
    return relationship


async def create_inverse_relationship(
    db: AsyncSession,
    original: FamilyRelationship,
) -> FamilyRelationship:
    """Create inverse relationship edge."""
    inverse_type = get_inverse_relation(original.relation_type)

    inverse = FamilyRelationship(
        id=uuid.uuid4(),
        from_person_id=original.to_person_id,
        to_person_id=original.from_person_id,
        relation_type=inverse_type,
        status=RelationshipStatus.ACTIVE,
        requested_by_user_id=original.requested_by_user_id,
        inverse_relationship_id=original.id,
        created_at=datetime.utcnow(),
        decided_at=datetime.utcnow(),
    )
    db.add(inverse)
    await db.flush()
    return inverse


async def get_relationship_by_id(
    db: AsyncSession,
    relationship_id: uuid.UUID,
) -> FamilyRelationship | None:
    """Get relationship by ID."""
    result = await db.execute(
        select(FamilyRelationship).where(FamilyRelationship.id == relationship_id)
    )
    return result.scalar_one_or_none()


async def approve_relationship(
    db: AsyncSession,
    relationship: FamilyRelationship,
    decided_by_user_id: uuid.UUID,
) -> FamilyRelationship:
    """Approve a pending relationship and create inverse edge."""
    relationship.status = RelationshipStatus.ACTIVE
    relationship.decided_by_user_id = decided_by_user_id
    relationship.decided_at = datetime.utcnow()

    await db.flush()

    inverse = await create_inverse_relationship(db, relationship)
    relationship.inverse_relationship_id = inverse.id

    await db.flush()
    await db.refresh(relationship)
    return relationship


async def reject_relationship(
    db: AsyncSession,
    relationship: FamilyRelationship,
    decided_by_user_id: uuid.UUID,
    reason: str,
) -> FamilyRelationship:
    """Reject a pending relationship."""
    relationship.status = RelationshipStatus.REJECTED
    relationship.decided_by_user_id = decided_by_user_id
    relationship.reason = reason
    relationship.decided_at = datetime.utcnow()

    await db.flush()
    await db.refresh(relationship)
    return relationship


async def list_pending_requests(
    db: AsyncSession,
    user_id: uuid.UUID,
) -> list[FamilyRelationship]:
    """List pending relationship requests for a user."""
    result = await db.execute(
        select(FamilyRelationship)
        .where(
            FamilyRelationship.requested_to_user_id == user_id,
            FamilyRelationship.status == RelationshipStatus.PENDING,
        )
        .order_by(FamilyRelationship.created_at.desc())
    )
    return list(result.scalars().all())


async def list_person_relationships(
    db: AsyncSession,
    person_id: uuid.UUID,
    include_pending: bool = False,
) -> list[FamilyRelationship]:
    """List relationships for a person."""
    query = select(FamilyRelationship).where(
        FamilyRelationship.from_person_id == person_id
    ).options(selectinload(FamilyRelationship.to_person))

    if not include_pending:
        query = query.where(FamilyRelationship.status == RelationshipStatus.ACTIVE)
    else:
        query = query.where(
            FamilyRelationship.status.in_([RelationshipStatus.ACTIVE, RelationshipStatus.PENDING])
        )

    query = query.order_by(FamilyRelationship.created_at.desc())

    result = await db.execute(query)
    return list(result.scalars().all())


async def check_relationship_exists(
    db: AsyncSession,
    from_person_id: uuid.UUID,
    to_person_id: uuid.UUID,
    relation_type: RelationType,
) -> bool:
    """Check if relationship already exists (any status)."""
    result = await db.execute(
        select(FamilyRelationship.id).where(
            FamilyRelationship.from_person_id == from_person_id,
            FamilyRelationship.to_person_id == to_person_id,
            FamilyRelationship.relation_type == relation_type,
        )
    )
    return result.scalar_one_or_none() is not None


async def check_unique_parent_constraint(
    db: AsyncSession,
    person_id: uuid.UUID,
    relation_type: RelationType,
) -> bool:
    """
    Check if adding a parent relationship violates unique parent constraint.
    A person can have at most 1 mother and 1 father.
    Returns True if constraint would be violated.
    """
    if relation_type not in (RelationType.MOTHER, RelationType.FATHER):
        return False

    result = await db.execute(
        select(FamilyRelationship.id).where(
            FamilyRelationship.from_person_id == person_id,
            FamilyRelationship.relation_type == relation_type,
            FamilyRelationship.status.in_([RelationshipStatus.ACTIVE, RelationshipStatus.PENDING]),
        )
    )
    return result.scalar_one_or_none() is not None


async def get_parents_count(
    db: AsyncSession,
    person_id: uuid.UUID,
) -> dict[str, int]:
    """Get count of mothers and fathers for a person."""
    result = await db.execute(
        select(FamilyRelationship.relation_type).where(
            FamilyRelationship.from_person_id == person_id,
            FamilyRelationship.relation_type.in_([RelationType.MOTHER, RelationType.FATHER]),
            FamilyRelationship.status == RelationshipStatus.ACTIVE,
        )
    )
    relations = list(result.scalars().all())
    return {
        "mothers": sum(1 for r in relations if r == RelationType.MOTHER),
        "fathers": sum(1 for r in relations if r == RelationType.FATHER),
    }
