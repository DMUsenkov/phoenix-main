"""Service for Audit Event logging."""

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.models import AuditEvent


class AuditEventType:
    """Audit event type constants."""


    MODERATION_TASK_CREATED = "moderation.task_created"
    MODERATION_APPROVED = "moderation.approved"
    MODERATION_REJECTED = "moderation.rejected"


    PAGE_CREATED = "page.created"
    PAGE_UPDATED = "page.updated"
    PAGE_PUBLISHED = "page.published"
    PAGE_ARCHIVED = "page.archived"


    OBJECT_CREATED = "object.created"
    OBJECT_UPDATED = "object.updated"
    OBJECT_PUBLISHED = "object.published"
    OBJECT_ARCHIVED = "object.archived"


    MEDIA_UPLOADED = "media.uploaded"
    MEDIA_CONFIRMED = "media.confirmed"
    MEDIA_DELETED = "media.deleted"


    ORG_MEMBER_INVITED = "org.member_invited"
    ORG_MEMBER_JOINED = "org.member_joined"
    ORG_MEMBER_ROLE_CHANGED = "org.member_role_changed"
    ORG_MEMBER_REVOKED = "org.member_revoked"


async def log_event(
    db: AsyncSession,
    event_type: str,
    actor_user_id: uuid.UUID | None = None,
    entity_type: str | None = None,
    entity_id: uuid.UUID | None = None,
    org_id: uuid.UUID | None = None,
    payload: dict[str, Any] | None = None,
) -> AuditEvent:
    """Log an audit event."""
    event = AuditEvent(
        id=uuid.uuid4(),
        event_type=event_type,
        actor_user_id=actor_user_id,
        entity_type=entity_type,
        entity_id=entity_id,
        org_id=org_id,
        payload=payload,
        created_at=datetime.utcnow(),
    )
    db.add(event)
    await db.flush()
    return event


async def log_moderation_task_created(
    db: AsyncSession,
    task_id: uuid.UUID,
    entity_type: str,
    entity_id: uuid.UUID,
    created_by_user_id: uuid.UUID | None = None,
    org_id: uuid.UUID | None = None,
) -> AuditEvent:
    """Log moderation task creation."""
    return await log_event(
        db=db,
        event_type=AuditEventType.MODERATION_TASK_CREATED,
        actor_user_id=created_by_user_id,
        entity_type=entity_type,
        entity_id=entity_id,
        org_id=org_id,
        payload={"task_id": str(task_id)},
    )


async def log_moderation_decision(
    db: AsyncSession,
    task_id: uuid.UUID,
    entity_type: str,
    entity_id: uuid.UUID,
    decision: str,
    moderator_user_id: uuid.UUID,
    org_id: uuid.UUID | None = None,
    reason: str | None = None,
    old_status: str | None = None,
    new_status: str | None = None,
) -> AuditEvent:
    """Log moderation approve/reject decision."""
    event_type = (
        AuditEventType.MODERATION_APPROVED
        if decision == "approved"
        else AuditEventType.MODERATION_REJECTED
    )

    payload: dict[str, Any] = {
        "task_id": str(task_id),
        "decision": decision,
    }
    if reason:
        payload["reason"] = reason
    if old_status:
        payload["old_status"] = old_status
    if new_status:
        payload["new_status"] = new_status

    return await log_event(
        db=db,
        event_type=event_type,
        actor_user_id=moderator_user_id,
        entity_type=entity_type,
        entity_id=entity_id,
        org_id=org_id,
        payload=payload,
    )


async def log_entity_status_change(
    db: AsyncSession,
    event_type: str,
    entity_type: str,
    entity_id: uuid.UUID,
    actor_user_id: uuid.UUID | None = None,
    org_id: uuid.UUID | None = None,
    old_status: str | None = None,
    new_status: str | None = None,
) -> AuditEvent:
    """Log entity status change (publish, archive, etc.)."""
    payload: dict[str, Any] = {}
    if old_status:
        payload["old_status"] = old_status
    if new_status:
        payload["new_status"] = new_status

    return await log_event(
        db=db,
        event_type=event_type,
        actor_user_id=actor_user_id,
        entity_type=entity_type,
        entity_id=entity_id,
        org_id=org_id,
        payload=payload if payload else None,
    )
