"""Pydantic schemas for MemorialPage and Person."""

import uuid
from datetime import date, datetime

from pydantic import BaseModel, Field, field_validator

from app.models.person import Gender, LifeStatus
from app.models.memorial_page import PageVisibility, PageStatus


class LocationInput(BaseModel):
    """Schema for location input with optional coordinates."""

    address: str | None = Field(None, max_length=512)
    lat: float | None = Field(None, ge=-90, le=90)
    lng: float | None = Field(None, ge=-180, le=180)


class LocationResponse(BaseModel):
    """Schema for location response."""

    address: str | None
    lat: float | None
    lng: float | None


class PersonCreate(BaseModel):
    """Schema for creating a Person."""

    full_name: str = Field(..., min_length=1, max_length=255)
    gender: Gender = Gender.UNKNOWN
    life_status: LifeStatus = LifeStatus.UNKNOWN
    birth_date: date | None = None
    death_date: date | None = None

    birth_place: str | None = Field(None, max_length=512)
    birth_place_lat: float | None = Field(None, ge=-90, le=90)
    birth_place_lng: float | None = Field(None, ge=-180, le=180)
    death_place: str | None = Field(None, max_length=512)
    death_place_lat: float | None = Field(None, ge=-90, le=90)
    death_place_lng: float | None = Field(None, ge=-180, le=180)
    burial_place: str | None = Field(None, max_length=512)
    burial_place_lat: float | None = Field(None, ge=-90, le=90)
    burial_place_lng: float | None = Field(None, ge=-180, le=180)
    burial_photo_url: str | None = Field(None, max_length=1024)

    @field_validator("death_date")
    @classmethod
    def validate_death_date(cls, v: date | None, info) -> date | None:
        if v is not None:
            life_status = info.data.get("life_status")
            if life_status and life_status != LifeStatus.DECEASED:
                raise ValueError("death_date can only be set if life_status is deceased")
            birth_date = info.data.get("birth_date")
            if birth_date and v < birth_date:
                raise ValueError("death_date cannot be before birth_date")
        return v


class PersonUpdate(BaseModel):
    """Schema for updating a Person."""

    full_name: str | None = Field(None, min_length=1, max_length=255)
    gender: Gender | None = None
    life_status: LifeStatus | None = None
    birth_date: date | None = None
    death_date: date | None = None

    birth_place: str | None = Field(None, max_length=512)
    birth_place_lat: float | None = Field(None, ge=-90, le=90)
    birth_place_lng: float | None = Field(None, ge=-180, le=180)
    death_place: str | None = Field(None, max_length=512)
    death_place_lat: float | None = Field(None, ge=-90, le=90)
    death_place_lng: float | None = Field(None, ge=-180, le=180)
    burial_place: str | None = Field(None, max_length=512)
    burial_place_lat: float | None = Field(None, ge=-90, le=90)
    burial_place_lng: float | None = Field(None, ge=-180, le=180)
    burial_photo_url: str | None = Field(None, max_length=1024)


class PersonResponse(BaseModel):
    """Schema for Person response."""

    model_config = {"from_attributes": True}

    id: uuid.UUID
    full_name: str
    gender: Gender
    life_status: LifeStatus
    birth_date: date | None
    death_date: date | None

    birth_place: str | None = None
    birth_place_lat: float | None = None
    birth_place_lng: float | None = None
    death_place: str | None = None
    death_place_lat: float | None = None
    death_place_lng: float | None = None
    burial_place: str | None = None
    burial_place_lat: float | None = None
    burial_place_lng: float | None = None
    burial_photo_url: str | None = None
    created_at: datetime
    updated_at: datetime


class PageCreate(BaseModel):
    """Schema for creating a MemorialPage with Person."""

    person: PersonCreate
    title: str | None = Field(None, max_length=255)
    biography: str | None = None
    short_description: str | None = Field(None, max_length=500)
    biography_json: dict | None = None
    visibility: PageVisibility = PageVisibility.PUBLIC
    project_id: uuid.UUID | None = None


class PageUpdate(BaseModel):
    """Schema for updating a MemorialPage."""

    person: PersonUpdate | None = None
    title: str | None = Field(None, max_length=255)
    biography: str | None = None
    short_description: str | None = Field(None, max_length=500)
    biography_json: dict | None = None
    visibility: PageVisibility | None = None
    org_project_id: uuid.UUID | None = None


class PageResponse(BaseModel):
    """Schema for MemorialPage response."""

    model_config = {"from_attributes": True}

    id: uuid.UUID
    slug: str
    title: str | None
    biography: str | None
    short_description: str | None = None
    biography_json: dict | None = None
    visibility: PageVisibility
    status: PageStatus
    org_project_id: uuid.UUID | None = None
    published_at: datetime | None
    created_at: datetime
    updated_at: datetime
    person: PersonResponse


class PageListResponse(BaseModel):
    """Schema for list of MemorialPages."""

    model_config = {"from_attributes": True}

    id: uuid.UUID
    slug: str
    title: str | None
    status: PageStatus
    visibility: PageVisibility
    created_at: datetime
    person_name: str
    person: PersonResponse | None = None


class PagePublicResponse(BaseModel):
    """Schema for public MemorialPage response (limited fields)."""

    model_config = {"from_attributes": True}

    slug: str
    title: str | None
    biography: str | None
    short_description: str | None = None
    biography_json: dict | None = None
    person: PersonResponse
    published_at: datetime | None


class PagesListResponse(BaseModel):
    """Schema for paginated list of pages."""

    items: list[PageListResponse]
    total: int
    page: int
    size: int


class MessageResponse(BaseModel):
    """Generic message response."""

    message: str


class PageSearchItem(BaseModel):
    """Schema for a single page search result."""

    slug: str
    title: str | None
    short_description: str | None = None
    person_name: str
    birth_date: date | None = None
    death_date: date | None = None
    life_status: LifeStatus
    primary_photo_url: str | None = None


class PageSearchResponse(BaseModel):
    """Schema for paginated page search results."""

    items: list[PageSearchItem]
    total: int
    page: int
    size: int
    query: str
