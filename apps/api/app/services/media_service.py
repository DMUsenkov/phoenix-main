"""Service for Media operations."""

import re
import uuid
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Media, MediaType, ModerationStatus, MemorialPage, EntityType
from app.services import moderation_service
from app.storage import S3Storage
from app.api.schemas.media import (
    ALLOWED_MIMES,
    ALLOWED_IMAGE_MIMES,
    PAGE_QUOTA_BYTES,
    PresignRequest,
)


def sanitize_filename(filename: str) -> str:
    """Sanitize filename for use in object key."""
    name = re.sub(r"[^\w\s\-.]", "", filename)
    name = re.sub(r"\s+", "_", name)
    return name[:100] if len(name) > 100 else name


def generate_object_key(page_id: uuid.UUID, filename: str) -> str:
    """Generate unique object key for storage."""
    sanitized = sanitize_filename(filename)
    unique_id = uuid.uuid4().hex[:8]
    return f"pages/{page_id}/{unique_id}_{sanitized}"


async def get_page_media_usage(db: AsyncSession, page_id: uuid.UUID) -> int:
    """Get total media size in bytes for a page."""
    result = await db.execute(
        select(func.coalesce(func.sum(Media.size_bytes), 0)).where(
            Media.page_id == page_id
        )
    )
    return result.scalar() or 0


async def check_quota(
    db: AsyncSession,
    page_id: uuid.UUID,
    additional_bytes: int,
) -> tuple[bool, int, int]:
    """Check if adding bytes would exceed quota. Returns (ok, used, limit)."""
    used = await get_page_media_usage(db, page_id)
    remaining = PAGE_QUOTA_BYTES - used
    ok = additional_bytes <= remaining
    return ok, used, PAGE_QUOTA_BYTES


def validate_mime_type(mime_type: str, media_type: MediaType) -> bool:
    """Validate mime type against allowed list."""
    if mime_type not in ALLOWED_MIMES:
        return False
    if media_type == MediaType.IMAGE and mime_type not in ALLOWED_IMAGE_MIMES:
        return False
    if media_type == MediaType.VIDEO and mime_type in ALLOWED_IMAGE_MIMES:
        return False
    return True


async def create_presign(
    db: AsyncSession,
    storage: S3Storage,
    data: PresignRequest,
    user_id: uuid.UUID,
) -> tuple[str, str, int]:
    """
    Create presigned URL for upload.
    Returns (upload_url, object_key, expires_in).
    Raises ValueError if validation fails.
    """
    if not validate_mime_type(data.mime_type, data.type):
        raise ValueError(f"Invalid mime type: {data.mime_type}")

    ok, used, limit = await check_quota(db, data.page_id, data.size_bytes)
    if not ok:
        raise ValueError(
            f"Quota exceeded. Used: {used} bytes, limit: {limit} bytes, "
            f"requested: {data.size_bytes} bytes"
        )

    object_key = generate_object_key(data.page_id, data.filename)
    expires_in = 3600

    upload_url = storage.generate_presigned_put_url(
        object_key=object_key,
        content_type=data.mime_type,
        content_length=data.size_bytes,
        expires_in=expires_in,
    )

    return upload_url, object_key, expires_in


async def confirm_upload(
    db: AsyncSession,
    storage: S3Storage,
    page_id: uuid.UUID,
    object_key: str,
    user_id: uuid.UUID,
) -> Media:
    """
    Confirm upload and create media record.
    Raises ValueError if validation fails.
    """
    obj_info = storage.head_object(object_key)
    if obj_info is None:
        raise ValueError("Object not found in storage")

    if obj_info.content_type not in ALLOWED_MIMES:
        storage.delete_object(object_key)
        raise ValueError(f"Invalid content type: {obj_info.content_type}")

    ok, used, limit = await check_quota(db, page_id, obj_info.size_bytes)
    if not ok:
        storage.delete_object(object_key)
        raise ValueError(
            f"Quota exceeded. Used: {used} bytes, limit: {limit} bytes, "
            f"file size: {obj_info.size_bytes} bytes"
        )

    media_type = (
        MediaType.IMAGE
        if obj_info.content_type in ALLOWED_IMAGE_MIMES
        else MediaType.VIDEO
    )

    media = Media(
        id=uuid.uuid4(),
        page_id=page_id,
        type=media_type,
        object_key=object_key,
        original_url=storage.get_public_url(object_key),
        mime_type=obj_info.content_type,
        size_bytes=obj_info.size_bytes,
        uploaded_by_user_id=user_id,
        moderation_status=ModerationStatus.PENDING,
        created_at=datetime.utcnow(),
    )

    db.add(media)
    await db.flush()
    await db.refresh(media)

    await moderation_service.create_moderation_task(
        db=db,
        entity_type=EntityType.MEDIA,
        entity_id=media.id,
        created_by_user_id=user_id,
    )

    return media


async def create_media_record(
    db: AsyncSession,
    storage: S3Storage,
    page_id: uuid.UUID,
    object_key: str,
    content_type: str,
    size_bytes: int,
    user_id: uuid.UUID,
) -> Media:
    """
    Create media record after direct upload.
    Raises ValueError if validation fails.
    """
    ok, used, limit = await check_quota(db, page_id, size_bytes)
    if not ok:
        raise ValueError(
            f"Quota exceeded. Used: {used} bytes, limit: {limit} bytes, "
            f"file size: {size_bytes} bytes"
        )

    media_type = (
        MediaType.IMAGE
        if content_type in ALLOWED_IMAGE_MIMES
        else MediaType.VIDEO
    )

    media = Media(
        id=uuid.uuid4(),
        page_id=page_id,
        type=media_type,
        object_key=object_key,
        original_url=storage.get_public_url(object_key),
        mime_type=content_type,
        size_bytes=size_bytes,
        uploaded_by_user_id=user_id,
        moderation_status=ModerationStatus.PENDING,
        created_at=datetime.utcnow(),
    )

    db.add(media)
    await db.flush()
    await db.refresh(media)

    await moderation_service.create_moderation_task(
        db=db,
        entity_type=EntityType.MEDIA,
        entity_id=media.id,
        created_by_user_id=user_id,
    )

    return media


async def get_page_media(
    db: AsyncSession,
    page_id: uuid.UUID,
) -> list[Media]:
    """Get all media for a page."""
    result = await db.execute(
        select(Media)
        .where(Media.page_id == page_id)
        .order_by(Media.created_at.desc())
    )
    return list(result.scalars().all())


async def get_media_by_id(
    db: AsyncSession,
    media_id: uuid.UUID,
) -> Media | None:
    """Get media by ID."""
    result = await db.execute(select(Media).where(Media.id == media_id))
    return result.scalar_one_or_none()


async def delete_media(
    db: AsyncSession,
    storage: S3Storage,
    media: Media,
) -> None:
    """Delete media record and object from storage."""
    storage.delete_object(media.object_key)
    await db.delete(media)
    await db.flush()


async def set_primary_media(
    db: AsyncSession,
    media: Media,
) -> Media:
    """Set media as primary for its page, unsetting any previous primary."""

    result = await db.execute(
        select(Media).where(
            Media.page_id == media.page_id,
            Media.is_primary == True,
        )
    )
    current_primary = result.scalars().all()
    for m in current_primary:
        m.is_primary = False


    media.is_primary = True
    await db.flush()
    await db.refresh(media)
    return media
