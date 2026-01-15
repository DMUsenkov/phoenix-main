"""Pydantic schemas for MemoryObject API."""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field, field_validator

from app.models import ObjectType, ObjectStatus, ObjectVisibility


class ObjectCreate(BaseModel):
    """Request schema for creating a memory object."""

    page_id: uuid.UUID
    type: ObjectType
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)
    title: str | None = Field(None, max_length=255)
    description: str | None = None
    address: str | None = Field(None, max_length=512)
    visibility: ObjectVisibility = ObjectVisibility.PUBLIC


class ObjectUpdate(BaseModel):
    """Request schema for updating a memory object."""

    title: str | None = Field(None, max_length=255)
    description: str | None = None
    lat: float | None = Field(None, ge=-90, le=90)
    lng: float | None = Field(None, ge=-180, le=180)
    address: str | None = Field(None, max_length=512)
    visibility: ObjectVisibility | None = None


class ObjectResponse(BaseModel):
    """Response schema for memory object."""

    id: uuid.UUID
    page_id: uuid.UUID
    type: ObjectType
    title: str | None = None
    description: str | None = None
    lat: float
    lng: float
    address: str | None = None
    status: ObjectStatus
    visibility: ObjectVisibility
    owner_user_id: uuid.UUID | None = None
    created_by_user_id: uuid.UUID | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ObjectListResponse(BaseModel):
    """Response schema for list of memory objects."""

    items: list[ObjectResponse]
    total: int
    limit: int
    offset: int


class ObjectListParams(BaseModel):
    """Query parameters for listing objects."""

    status: ObjectStatus | None = None
    type: ObjectType | None = None
    limit: int = Field(default=50, ge=1, le=100)
    offset: int = Field(default=0, ge=0)


class MessageResponse(BaseModel):
    """Generic message response."""

    message: str
