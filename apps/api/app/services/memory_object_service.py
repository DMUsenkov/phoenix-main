"""Service for MemoryObject operations."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    MemoryObject,
    ObjectType,
    ObjectStatus,
    ObjectVisibility,
    MemorialPage,
    PageStatus,
)


async def create_object(
    db: AsyncSession,
    page_id: uuid.UUID,
    object_type: ObjectType,
    lat: float,
    lng: float,
    user_id: uuid.UUID,
    title: str | None = None,
    description: str | None = None,
    address: str | None = None,
    status: ObjectStatus = ObjectStatus.DRAFT,
    visibility: ObjectVisibility = ObjectVisibility.PUBLIC,
) -> MemoryObject:
    """Create a new memory object."""
    obj = MemoryObject(
        id=uuid.uuid4(),
        page_id=page_id,
        type=object_type,
        title=title,
        description=description,
        lat=lat,
        lng=lng,
        address=address,
        status=status,
        visibility=visibility,
        owner_user_id=user_id,
        created_by_user_id=user_id,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(obj)
    await db.flush()
    await db.refresh(obj)
    return obj


async def get_object_by_id(
    db: AsyncSession,
    object_id: uuid.UUID,
) -> MemoryObject | None:
    """Get memory object by ID."""
    result = await db.execute(
        select(MemoryObject).where(MemoryObject.id == object_id)
    )
    return result.scalar_one_or_none()


async def list_user_objects(
    db: AsyncSession,
    user_id: uuid.UUID,
    status_filter: ObjectStatus | None = None,
    type_filter: ObjectType | None = None,
    limit: int = 50,
    offset: int = 0,
) -> tuple[list[MemoryObject], int]:
    """List objects owned by user. Returns (objects, total_count)."""
    query = select(MemoryObject).where(MemoryObject.owner_user_id == user_id)
    count_query = select(MemoryObject).where(MemoryObject.owner_user_id == user_id)

    if status_filter:
        query = query.where(MemoryObject.status == status_filter)
        count_query = count_query.where(MemoryObject.status == status_filter)

    if type_filter:
        query = query.where(MemoryObject.type == type_filter)
        count_query = count_query.where(MemoryObject.type == type_filter)

    query = query.order_by(MemoryObject.created_at.desc())
    query = query.limit(limit).offset(offset)

    result = await db.execute(query)
    objects = list(result.scalars().all())

    count_result = await db.execute(count_query)
    total = len(list(count_result.scalars().all()))

    return objects, total


async def update_object(
    db: AsyncSession,
    obj: MemoryObject,
    title: str | None = None,
    description: str | None = None,
    lat: float | None = None,
    lng: float | None = None,
    address: str | None = None,
    visibility: ObjectVisibility | None = None,
) -> MemoryObject:
    """Update memory object fields."""
    if title is not None:
        obj.title = title
    if description is not None:
        obj.description = description
    if lat is not None:
        obj.lat = lat
    if lng is not None:
        obj.lng = lng
    if address is not None:
        obj.address = address
    if visibility is not None:
        obj.visibility = visibility

    obj.updated_at = datetime.now(timezone.utc)

    await db.flush()
    await db.refresh(obj)
    return obj


async def archive_object(
    db: AsyncSession,
    obj: MemoryObject,
) -> MemoryObject:
    """Soft delete - set status to archived."""
    obj.status = ObjectStatus.ARCHIVED
    obj.updated_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(obj)
    return obj


async def publish_object(
    db: AsyncSession,
    obj: MemoryObject,
    require_moderation: bool = True,
) -> MemoryObject:
    """Publish object. If require_moderation=True, sets to on_moderation and creates task."""
    from app.services import moderation_service
    from app.models import EntityType

    if require_moderation:
        obj.status = ObjectStatus.ON_MODERATION
        obj.updated_at = datetime.now(timezone.utc)
        await db.flush()

        await moderation_service.create_moderation_task(
            db=db,
            entity_type=EntityType.OBJECT,
            entity_id=obj.id,
            created_by_user_id=obj.created_by_user_id,
            org_id=obj.owner_org_id,
        )
    else:
        obj.status = ObjectStatus.PUBLISHED
        obj.updated_at = datetime.now(timezone.utc)

    await db.flush()
    await db.refresh(obj)
    return obj


async def get_page_by_id(
    db: AsyncSession,
    page_id: uuid.UUID,
) -> MemorialPage | None:
    """Get memorial page by ID."""
    result = await db.execute(
        select(MemorialPage).where(MemorialPage.id == page_id)
    )
    return result.scalar_one_or_none()


async def is_page_published(
    db: AsyncSession,
    page_id: uuid.UUID,
) -> bool:
    """Check if page is published."""
    page = await get_page_by_id(db, page_id)
    if not page:
        return False
    return page.status == PageStatus.PUBLISHED
