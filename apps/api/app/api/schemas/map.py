"""Pydantic schemas for Map API."""

import uuid
from typing import Annotated

from pydantic import BaseModel, Field, field_validator, model_validator

from app.models import ObjectType, ObjectStatus, ObjectVisibility, LifeStatus


MAX_BBOX_SIZE_LAT = 10.0
MAX_BBOX_SIZE_LNG = 10.0
DEFAULT_LIMIT = 300
MAX_LIMIT = 1000


class BBoxParams(BaseModel):
    """Bounding box query parameters with validation."""

    min_lat: float = Field(..., ge=-90, le=90, alias="minLat")
    min_lng: float = Field(..., ge=-180, le=180, alias="minLng")
    max_lat: float = Field(..., ge=-90, le=90, alias="maxLat")
    max_lng: float = Field(..., ge=-180, le=180, alias="maxLng")

    model_config = {"populate_by_name": True}

    @model_validator(mode="after")
    def validate_bbox(self) -> "BBoxParams":
        if self.min_lat >= self.max_lat:
            raise ValueError("minLat must be less than maxLat")
        if self.min_lng >= self.max_lng:
            raise ValueError("minLng must be less than maxLng")

        lat_size = self.max_lat - self.min_lat
        lng_size = self.max_lng - self.min_lng

        if lat_size > MAX_BBOX_SIZE_LAT:
            raise ValueError(
                f"BBox latitude range too large: {lat_size:.2f} > {MAX_BBOX_SIZE_LAT}"
            )
        if lng_size > MAX_BBOX_SIZE_LNG:
            raise ValueError(
                f"BBox longitude range too large: {lng_size:.2f} > {MAX_BBOX_SIZE_LNG}"
            )

        return self


class PublicMapQueryParams(BaseModel):
    """Query parameters for public map endpoint."""

    min_lat: float = Field(..., ge=-90, le=90, alias="minLat")
    min_lng: float = Field(..., ge=-180, le=180, alias="minLng")
    max_lat: float = Field(..., ge=-90, le=90, alias="maxLat")
    max_lng: float = Field(..., ge=-180, le=180, alias="maxLng")
    types: list[ObjectType] | None = None
    limit: int = Field(default=DEFAULT_LIMIT, ge=1, le=MAX_LIMIT)

    model_config = {"populate_by_name": True}

    @model_validator(mode="after")
    def validate_bbox(self) -> "PublicMapQueryParams":
        if self.min_lat >= self.max_lat:
            raise ValueError("minLat must be less than maxLat")
        if self.min_lng >= self.max_lng:
            raise ValueError("minLng must be less than maxLng")

        lat_size = self.max_lat - self.min_lat
        lng_size = self.max_lng - self.min_lng

        if lat_size > MAX_BBOX_SIZE_LAT:
            raise ValueError(
                f"BBox latitude range too large: {lat_size:.2f} > {MAX_BBOX_SIZE_LAT}"
            )
        if lng_size > MAX_BBOX_SIZE_LNG:
            raise ValueError(
                f"BBox longitude range too large: {lng_size:.2f} > {MAX_BBOX_SIZE_LNG}"
            )

        return self


class PrivateMapQueryParams(BaseModel):
    """Query parameters for private map endpoint."""

    min_lat: float = Field(..., ge=-90, le=90, alias="minLat")
    min_lng: float = Field(..., ge=-180, le=180, alias="minLng")
    max_lat: float = Field(..., ge=-90, le=90, alias="maxLat")
    max_lng: float = Field(..., ge=-180, le=180, alias="maxLng")
    types: list[ObjectType] | None = None
    status: ObjectStatus | None = None
    visibility: ObjectVisibility | None = None
    limit: int = Field(default=DEFAULT_LIMIT, ge=1, le=MAX_LIMIT)
    scope: str | None = Field(default=None, description="'all' for admin to see all objects")

    model_config = {"populate_by_name": True}

    @model_validator(mode="after")
    def validate_bbox(self) -> "PrivateMapQueryParams":
        if self.min_lat >= self.max_lat:
            raise ValueError("minLat must be less than maxLat")
        if self.min_lng >= self.max_lng:
            raise ValueError("minLng must be less than maxLng")

        lat_size = self.max_lat - self.min_lat
        lng_size = self.max_lng - self.min_lng

        if lat_size > MAX_BBOX_SIZE_LAT:
            raise ValueError(
                f"BBox latitude range too large: {lat_size:.2f} > {MAX_BBOX_SIZE_LAT}"
            )
        if lng_size > MAX_BBOX_SIZE_LNG:
            raise ValueError(
                f"BBox longitude range too large: {lng_size:.2f} > {MAX_BBOX_SIZE_LNG}"
            )

        return self


class MapObjectDTO(BaseModel):
    """Lightweight DTO for map markers (public)."""

    id: uuid.UUID
    type: ObjectType
    lat: float
    lng: float
    title: str | None = None
    page_slug: str
    life_status: LifeStatus | None = None

    model_config = {"from_attributes": True}


class PrivateMapObjectDTO(BaseModel):
    """DTO for map markers with status/visibility (private)."""

    id: uuid.UUID
    type: ObjectType
    lat: float
    lng: float
    title: str | None = None
    page_slug: str
    life_status: LifeStatus | None = None
    status: ObjectStatus
    visibility: ObjectVisibility

    model_config = {"from_attributes": True}


class MapObjectsResponse(BaseModel):
    """Response for map objects endpoint."""

    items: list[MapObjectDTO]
    total: int
    limit: int


class PrivateMapObjectsResponse(BaseModel):
    """Response for private map objects endpoint."""

    items: list[PrivateMapObjectDTO]
    total: int
    limit: int


class BurialPointDTO(BaseModel):
    """DTO for burial point on map."""

    page_slug: str
    full_name: str
    lat: float
    lng: float
    burial_place: str | None = None
    photo_url: str | None = None
    birth_date: str | None = None
    death_date: str | None = None

    model_config = {"from_attributes": True}


class BurialPointsResponse(BaseModel):
    """Response for burial points endpoint."""

    items: list[BurialPointDTO]
    total: int
