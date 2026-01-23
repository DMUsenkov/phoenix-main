"""Pydantic schemas for QR codes."""

import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class QRCodeResponse(BaseModel):
    """Response schema for QR code."""

    id: uuid.UUID
    page_id: uuid.UUID
    code: str
    is_active: bool
    short_url: str
    target_url: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class QRCodeCreateResponse(BaseModel):
    """Response schema for QR code creation."""

    id: uuid.UUID
    page_id: uuid.UUID
    code: str
    is_active: bool
    short_url: str
    target_url: str
    created_at: datetime

    model_config = {"from_attributes": True}


class QRImageParams(BaseModel):
    """Query params for QR image generation."""

    format: Literal["svg", "png"] = Field(default="svg", description="Image format")
    size: int = Field(default=512, ge=64, le=2048, description="Image size in pixels")


class QRCodeScanEventResponse(BaseModel):
    """Response schema for QR code scan event."""

    id: uuid.UUID
    qr_code_id: uuid.UUID
    scanned_at: datetime
    ip: str | None
    user_agent: str | None
    referer: str | None

    model_config = {"from_attributes": True}
