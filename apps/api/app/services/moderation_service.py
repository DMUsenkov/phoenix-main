"""Service for Moderation operations."""

import uuid
from datetime import datetime

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    ModerationTask,
    EntityType,
    TaskStatus,
    Media,
    ModerationStatus,
    MemorialPage,
    PageStatus,
    MemoryObject,
    ObjectStatus,
)
from app.services import audit_service


async def create_moderation_task(
    db: AsyncSession,
    entity_type: EntityType,
    entity_id: uuid.UUID,
    created_by_user_id: uuid.UUID | None = None,
    org_id: uuid.UUID | None = None,
    priority: int = 0,
) -> ModerationTask:
    """Create a new moderation task for an entity."""
    task = ModerationTask(
        id=uuid.uuid4(),
        entity_type=entity_type,
        entity_id=entity_id,
        org_id=org_id,
        status=TaskStatus.PENDING,
        priority=priority,
        created_by_user_id=created_by_user_id,
        created_at=datetime.utcnow(),
    )
    db.add(task)
    await db.flush()
    await db.refresh(task)

    await audit_service.log_moderation_task_created(
        db=db,
        task_id=task.id,
        entity_type=entity_type.value,
        entity_id=entity_id,
        created_by_user_id=created_by_user_id,
        org_id=org_id,
    )

    return task


async def get_task_by_id(
    db: AsyncSession,
    task_id: uuid.UUID,
) -> ModerationTask | None:
    """Get moderation task by ID."""
    result = await db.execute(
        select(ModerationTask).where(ModerationTask.id == task_id)
    )
    return result.scalar_one_or_none()


async def list_tasks(
    db: AsyncSession,
    entity_type: EntityType | None = None,
    status: TaskStatus | None = None,
    org_id: uuid.UUID | None = None,
    limit: int = 50,
    offset: int = 0,
) -> tuple[list[ModerationTask], int]:
    """List moderation tasks with filters. Returns (tasks, total_count)."""
    query = select(ModerationTask)
    count_query = select(func.count()).select_from(ModerationTask)

    if entity_type:
        query = query.where(ModerationTask.entity_type == entity_type)
        count_query = count_query.where(ModerationTask.entity_type == entity_type)

    if status:
        query = query.where(ModerationTask.status == status)
        count_query = count_query.where(ModerationTask.status == status)

    if org_id:
        query = query.where(ModerationTask.org_id == org_id)
        count_query = count_query.where(ModerationTask.org_id == org_id)

    query = query.order_by(ModerationTask.priority.desc(), ModerationTask.created_at.desc())
    query = query.limit(limit).offset(offset)

    result = await db.execute(query)
    tasks = list(result.scalars().all())

    count_result = await db.execute(count_query)
    total = count_result.scalar() or 0

    return tasks, total


async def approve_task(
    db: AsyncSession,
    task: ModerationTask,
    moderator_user_id: uuid.UUID,
) -> ModerationTask:
    """Approve a moderation task and update related entity."""
    old_status: str | None = None
    new_status: str | None = None

    task.status = TaskStatus.APPROVED
    task.moderator_user_id = moderator_user_id
    task.decided_at = datetime.utcnow()

    if task.entity_type == EntityType.MEDIA:
        result = await db.execute(
            select(Media).where(Media.id == task.entity_id)
        )
        media = result.scalar_one_or_none()
        if media:
            old_status = media.moderation_status.value
            media.moderation_status = ModerationStatus.APPROVED
            new_status = ModerationStatus.APPROVED.value

    elif task.entity_type == EntityType.PAGE:
        result = await db.execute(
            select(MemorialPage).where(MemorialPage.id == task.entity_id)
        )
        page = result.scalar_one_or_none()
        if page:
            old_status = page.status.value
            page.status = PageStatus.PUBLISHED
            page.published_at = datetime.utcnow()
            new_status = PageStatus.PUBLISHED.value

    elif task.entity_type == EntityType.OBJECT:
        result = await db.execute(
            select(MemoryObject).where(MemoryObject.id == task.entity_id)
        )
        obj = result.scalar_one_or_none()
        if obj:
            old_status = obj.status.value
            obj.status = ObjectStatus.PUBLISHED
            obj.updated_at = datetime.utcnow()
            new_status = ObjectStatus.PUBLISHED.value

    await db.flush()
    await db.refresh(task)

    await audit_service.log_moderation_decision(
        db=db,
        task_id=task.id,
        entity_type=task.entity_type.value,
        entity_id=task.entity_id,
        decision="approved",
        moderator_user_id=moderator_user_id,
        org_id=task.org_id,
        old_status=old_status,
        new_status=new_status,
    )

    return task


async def reject_task(
    db: AsyncSession,
    task: ModerationTask,
    moderator_user_id: uuid.UUID,
    reason: str,
) -> ModerationTask:
    """Reject a moderation task and update related entity."""
    old_status: str | None = None
    new_status: str | None = None

    task.status = TaskStatus.REJECTED
    task.moderator_user_id = moderator_user_id
    task.reason = reason
    task.decided_at = datetime.utcnow()

    if task.entity_type == EntityType.MEDIA:
        result = await db.execute(
            select(Media).where(Media.id == task.entity_id)
        )
        media = result.scalar_one_or_none()
        if media:
            old_status = media.moderation_status.value
            media.moderation_status = ModerationStatus.REJECTED
            new_status = ModerationStatus.REJECTED.value

    elif task.entity_type == EntityType.PAGE:
        result = await db.execute(
            select(MemorialPage).where(MemorialPage.id == task.entity_id)
        )
        page = result.scalar_one_or_none()
        if page:
            old_status = page.status.value
            page.status = PageStatus.REJECTED
            new_status = PageStatus.REJECTED.value

    elif task.entity_type == EntityType.OBJECT:
        result = await db.execute(
            select(MemoryObject).where(MemoryObject.id == task.entity_id)
        )
        obj = result.scalar_one_or_none()
        if obj:
            old_status = obj.status.value
            obj.status = ObjectStatus.REJECTED
            obj.updated_at = datetime.utcnow()
            new_status = ObjectStatus.REJECTED.value

    await db.flush()
    await db.refresh(task)

    await audit_service.log_moderation_decision(
        db=db,
        task_id=task.id,
        entity_type=task.entity_type.value,
        entity_id=task.entity_id,
        decision="rejected",
        moderator_user_id=moderator_user_id,
        org_id=task.org_id,
        reason=reason,
        old_status=old_status,
        new_status=new_status,
    )

    return task


async def get_task_for_entity(
    db: AsyncSession,
    entity_type: EntityType,
    entity_id: uuid.UUID,
) -> ModerationTask | None:
    """Get the latest moderation task for an entity."""
    result = await db.execute(
        select(ModerationTask)
        .where(ModerationTask.entity_type == entity_type)
        .where(ModerationTask.entity_id == entity_id)
        .order_by(ModerationTask.created_at.desc())
        .limit(1)
    )
    return result.scalar_one_or_none()


async def get_entity_summary(
    db: AsyncSession,
    task: ModerationTask,
) -> dict:
    """Get summary of the entity being moderated."""
    from sqlalchemy.orm import selectinload

    summary: dict = {
        "entity_type": task.entity_type.value,
        "entity_id": str(task.entity_id),
    }

    if task.entity_type == EntityType.PAGE:
        result = await db.execute(
            select(MemorialPage)
            .options(selectinload(MemorialPage.person))
            .where(MemorialPage.id == task.entity_id)
        )
        page = result.scalar_one_or_none()
        if page:
            summary.update({
                "name": page.person.full_name if page.person else None,
                "slug": page.slug,
                "title": page.title,
                "status": page.status.value,
                "visibility": page.visibility.value,
                "biography_preview": (page.biography[:200] + "...") if page.biography and len(page.biography) > 200 else page.biography,
                "created_at": page.created_at.isoformat() if page.created_at else None,
            })

    elif task.entity_type == EntityType.MEDIA:
        result = await db.execute(
            select(Media).where(Media.id == task.entity_id)
        )
        media = result.scalar_one_or_none()
        if media:
            summary.update({
                "media_type": media.media_type.value,
                "filename": media.filename,
                "url": media.url,
                "moderation_status": media.moderation_status.value,
                "created_at": media.created_at.isoformat() if media.created_at else None,
            })

    elif task.entity_type == EntityType.OBJECT:
        result = await db.execute(
            select(MemoryObject).where(MemoryObject.id == task.entity_id)
        )
        obj = result.scalar_one_or_none()
        if obj:
            summary.update({
                "object_type": obj.type.value,
                "title": obj.title,
                "description_preview": (obj.description[:200] + "...") if obj.description and len(obj.description) > 200 else obj.description,
                "lat": obj.lat,
                "lng": obj.lng,
                "address": obj.address,
                "status": obj.status.value,
                "visibility": obj.visibility.value,
                "page_id": str(obj.page_id),
                "created_at": obj.created_at.isoformat() if obj.created_at else None,
            })

    return summary
