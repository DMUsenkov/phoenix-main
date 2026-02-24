"""Pydantic schemas for extended page content - life events, achievements, etc."""

import uuid
from datetime import date as date_type, datetime
from typing import Any

from pydantic import BaseModel, Field, field_validator

from app.models.page_content import AchievementCategory, ValueType


class LocationInput(BaseModel):
    """Schema for location with optional coordinates."""

    address: str | None = Field(None, max_length=512)
    lat: float | None = Field(None, ge=-90, le=90)
    lng: float | None = Field(None, ge=-180, le=180)


class LocationResponse(BaseModel):
    """Schema for location response."""

    address: str | None
    lat: float | None
    lng: float | None


class RichTextDocument(BaseModel):
    """Schema for TipTap Rich Text JSON document."""

    type: str = "doc"
    content: list[dict[str, Any]] = Field(default_factory=list)


class LifeEventCreate(BaseModel):
    """Schema for creating a life event."""

    title: str = Field(..., min_length=1, max_length=255)
    description: dict | None = None
    start_date: date_type | None = None
    end_date: date_type | None = None
    location: str | None = Field(None, max_length=512)
    sort_order: int = 0

    @field_validator("end_date")
    @classmethod
    def validate_end_date(cls, v: date_type | None, info) -> date_type | None:
        if v is not None:
            start_date = info.data.get("start_date")
            if start_date and v < start_date:
                raise ValueError("end_date cannot be before start_date")
        return v


class LifeEventUpdate(BaseModel):
    """Schema for updating a life event."""

    title: str | None = Field(None, min_length=1, max_length=255)
    description: dict | None = None
    start_date: date_type | None = None
    end_date: date_type | None = None
    location: str | None = Field(None, max_length=512)
    sort_order: int | None = None


class LifeEventResponse(BaseModel):
    """Schema for life event response."""

    model_config = {"from_attributes": True}

    id: uuid.UUID
    title: str
    description: dict | None
    start_date: date_type | None
    end_date: date_type | None
    location: str | None
    sort_order: int
    created_at: datetime
    updated_at: datetime


class AchievementCreate(BaseModel):
    """Schema for creating an achievement."""

    title: str = Field(..., min_length=1, max_length=255)
    description: dict | None = None
    date: date_type | None = None
    category: AchievementCategory | None = None
    custom_category: str | None = Field(None, max_length=100)
    sort_order: int = 0

    @field_validator("custom_category")
    @classmethod
    def validate_custom_category(cls, v: str | None, info) -> str | None:
        category = info.data.get("category")
        if v and category != AchievementCategory.OTHER:
            raise ValueError("custom_category can only be set when category is 'other'")
        return v


class AchievementUpdate(BaseModel):
    """Schema for updating an achievement."""

    title: str | None = Field(None, min_length=1, max_length=255)
    description: dict | None = None
    date: date_type | None = None
    category: AchievementCategory | None = None
    custom_category: str | None = Field(None, max_length=100)
    sort_order: int | None = None


class AchievementResponse(BaseModel):
    """Schema for achievement response."""

    model_config = {"from_attributes": True}

    id: uuid.UUID
    title: str
    description: dict | None
    date: date_type | None
    category: AchievementCategory | None
    custom_category: str | None
    sort_order: int
    created_at: datetime
    updated_at: datetime


class EducationCreate(BaseModel):
    """Schema for creating an education record."""

    institution: str = Field(..., min_length=1, max_length=255)
    degree: str | None = Field(None, max_length=255)
    field_of_study: str | None = Field(None, max_length=255)
    start_year: int | None = Field(None, ge=1800, le=2100)
    end_year: int | None = Field(None, ge=1800, le=2100)
    description: dict | None = None
    sort_order: int = 0

    @field_validator("end_year")
    @classmethod
    def validate_end_year(cls, v: int | None, info) -> int | None:
        if v is not None:
            start_year = info.data.get("start_year")
            if start_year and v < start_year:
                raise ValueError("end_year cannot be before start_year")
        return v


class EducationUpdate(BaseModel):
    """Schema for updating an education record."""

    institution: str | None = Field(None, min_length=1, max_length=255)
    degree: str | None = Field(None, max_length=255)
    field_of_study: str | None = Field(None, max_length=255)
    start_year: int | None = Field(None, ge=1800, le=2100)
    end_year: int | None = Field(None, ge=1800, le=2100)
    description: dict | None = None
    sort_order: int | None = None


class EducationResponse(BaseModel):
    """Schema for education response."""

    model_config = {"from_attributes": True}

    id: uuid.UUID
    institution: str
    degree: str | None
    field_of_study: str | None
    start_year: int | None
    end_year: int | None
    description: dict | None
    sort_order: int
    created_at: datetime
    updated_at: datetime


class CareerCreate(BaseModel):
    """Schema for creating a career record."""

    organization: str = Field(..., min_length=1, max_length=255)
    role: str = Field(..., min_length=1, max_length=255)
    start_date: date_type | None = None
    end_date: date_type | None = None
    description: dict | None = None
    sort_order: int = 0

    @field_validator("end_date")
    @classmethod
    def validate_end_date(cls, v: date_type | None, info) -> date_type | None:
        if v is not None:
            start_date = info.data.get("start_date")
            if start_date and v < start_date:
                raise ValueError("end_date cannot be before start_date")
        return v


class CareerUpdate(BaseModel):
    """Schema for updating a career record."""

    organization: str | None = Field(None, min_length=1, max_length=255)
    role: str | None = Field(None, min_length=1, max_length=255)
    start_date: date_type | None = None
    end_date: date_type | None = None
    description: dict | None = None
    sort_order: int | None = None


class CareerResponse(BaseModel):
    """Schema for career response."""

    model_config = {"from_attributes": True}

    id: uuid.UUID
    organization: str
    role: str
    start_date: date_type | None
    end_date: date_type | None
    description: dict | None
    sort_order: int
    created_at: datetime
    updated_at: datetime


class PersonValueCreate(BaseModel):
    """Schema for creating a person value."""

    type: ValueType
    text: str = Field(..., min_length=1, max_length=500)
    sort_order: int = 0


class PersonValueUpdate(BaseModel):
    """Schema for updating a person value."""

    type: ValueType | None = None
    text: str | None = Field(None, min_length=1, max_length=500)
    sort_order: int | None = None


class PersonValueResponse(BaseModel):
    """Schema for person value response."""

    model_config = {"from_attributes": True}

    id: uuid.UUID
    type: ValueType
    text: str
    sort_order: int
    created_at: datetime


class PersonValuesGrouped(BaseModel):
    """Schema for grouped person values."""

    values: list[PersonValueResponse] = []
    beliefs: list[PersonValueResponse] = []
    principles: list[PersonValueResponse] = []


class QuoteCreate(BaseModel):
    """Schema for creating a quote."""

    text: str = Field(..., min_length=1, max_length=2000)
    source: str | None = Field(None, max_length=255)
    sort_order: int = 0


class QuoteUpdate(BaseModel):
    """Schema for updating a quote."""

    text: str | None = Field(None, min_length=1, max_length=2000)
    source: str | None = Field(None, max_length=255)
    sort_order: int | None = None


class QuoteResponse(BaseModel):
    """Schema for quote response."""

    model_config = {"from_attributes": True}

    id: uuid.UUID
    text: str
    source: str | None
    sort_order: int
    created_at: datetime


class MemorialMessageCreate(BaseModel):
    """Schema for creating a memorial message."""

    author_name: str = Field(..., min_length=1, max_length=255)
    text: dict = Field(..., description="Rich text content in TipTap JSON format")


class MemorialMessageUpdate(BaseModel):
    """Schema for updating a memorial message (admin only)."""

    is_approved: bool | None = None


class MemorialMessageResponse(BaseModel):
    """Schema for memorial message response."""

    model_config = {"from_attributes": True}

    id: uuid.UUID
    author_name: str
    author_user_id: uuid.UUID | None
    text: dict
    is_approved: bool
    approved_at: datetime | None
    created_at: datetime


class MemorialMessagePublicResponse(BaseModel):
    """Schema for public memorial message (only approved)."""

    model_config = {"from_attributes": True}

    id: uuid.UUID
    author_name: str
    text: dict
    created_at: datetime


class ReorderItemsRequest(BaseModel):
    """Schema for reordering items."""

    item_ids: list[uuid.UUID] = Field(..., min_length=1)


class PageContentResponse(BaseModel):
    """Schema for full page content (all extended data)."""

    life_events: list[LifeEventResponse] = []
    achievements: list[AchievementResponse] = []
    education: list[EducationResponse] = []
    career: list[CareerResponse] = []
    values: PersonValuesGrouped = Field(default_factory=PersonValuesGrouped)
    quotes: list[QuoteResponse] = []
    memorial_messages: list[MemorialMessagePublicResponse] = []
