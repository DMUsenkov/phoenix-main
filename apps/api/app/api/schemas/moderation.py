"""Pydantic schemas for Moderation API."""

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

from app.models import EntityType, TaskStatus


class ModerationTaskResponse(BaseModel):
    """Response schema for moderation task."""

    id: uuid.UUID
    entity_type: EntityType
    entity_id: uuid.UUID
    org_id: uuid.UUID | None = None
    status: TaskStatus
    priority: int = 0
    reason: str | None = None
    created_by_user_id: uuid.UUID | None = None
    moderator_user_id: uuid.UUID | None = None
    created_at: datetime
    decided_at: datetime | None = None

    model_config = {"from_attributes": True}


class ModerationTaskDetailResponse(BaseModel):
    """Response schema for moderation task with entity details."""

    task: ModerationTaskResponse
    entity_summary: dict[str, Any]


class ModerationTaskListResponse(BaseModel):
    """Response schema for list of moderation tasks."""

    items: list[ModerationTaskResponse]
    total: int
    limit: int
    offset: int


class ModerationTaskListParams(BaseModel):
    """Query parameters for listing moderation tasks."""

    entity_type: EntityType | None = None
    status: TaskStatus | None = None
    org_id: uuid.UUID | None = None
    limit: int = Field(default=50, ge=1, le=100)
    offset: int = Field(default=0, ge=0)


class RejectRequest(BaseModel):
    """Request schema for rejecting a moderation task."""

    reason: str = Field(..., min_length=1, max_length=1000)


class ApproveResponse(BaseModel):
    """Response schema for approve action."""

    message: str
    task: ModerationTaskResponse


class RejectResponse(BaseModel):
    """Response schema for reject action."""

    message: str
    task: ModerationTaskResponse
