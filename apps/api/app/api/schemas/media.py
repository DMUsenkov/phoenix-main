"""Pydantic schemas for Media."""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.models.media import MediaType, ModerationStatus


ALLOWED_IMAGE_MIMES = {"image/jpeg", "image/png", "image/webp", "image/avif"}
ALLOWED_VIDEO_MIMES = {"video/mp4", "video/webm"}
ALLOWED_MIMES = ALLOWED_IMAGE_MIMES | ALLOWED_VIDEO_MIMES

PAGE_QUOTA_BYTES = 100 * 1024 * 1024
MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024


class PresignRequest(BaseModel):
    """Request for presigned upload URL."""

    page_id: uuid.UUID
    filename: str = Field(..., min_length=1, max_length=255)
    mime_type: str = Field(..., min_length=1, max_length=128)
    size_bytes: int = Field(..., gt=0, le=MAX_FILE_SIZE_BYTES)
    type: MediaType


class PresignResponse(BaseModel):
    """Response with presigned upload URL."""

    upload_url: str
    object_key: str
    expires_in: int


class ConfirmRequest(BaseModel):
    """Request to confirm upload."""

    page_id: uuid.UUID
    object_key: str = Field(..., min_length=1, max_length=512)


class MediaResponse(BaseModel):
    """Media item response."""

    model_config = {"from_attributes": True}

    id: uuid.UUID
    page_id: uuid.UUID
    type: MediaType
    object_key: str
    original_url: str | None
    preview_url: str | None
    mime_type: str
    size_bytes: int
    width: int | None
    height: int | None
    duration_seconds: float | None
    moderation_status: ModerationStatus
    is_primary: bool
    created_at: datetime


class MediaListResponse(BaseModel):
    """List of media items."""

    items: list[MediaResponse]
    total: int


class QuotaResponse(BaseModel):
    """Page media quota info."""

    used_bytes: int
    limit_bytes: int
    remaining_bytes: int
