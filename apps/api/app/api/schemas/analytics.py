"""Pydantic schemas for Analytics API."""

from datetime import date
from typing import Any
from pydantic import BaseModel, Field


class TrackEventRequest(BaseModel):
    """Request to track a client-side event."""
    event_type: str = Field(..., max_length=50)
    anon_id: str | None = Field(None, max_length=64)
    session_id: str | None = Field(None, max_length=64)
    page_id: str | None = None
    object_id: str | None = None
    properties: dict[str, Any] | None = Field(None, max_length=4096)


class TrackEventResponse(BaseModel):
    """Response after tracking an event."""
    success: bool


class TimeseriesPoint(BaseModel):
    """A single point in timeseries data."""
    date: str
    views: int
    qr_scans: int


class TopPageItem(BaseModel):
    """Top page item in reports."""
    page_id: str
    title: str | None = None
    slug: str | None = None
    views: int
    qr_scans: int = 0


class TopObjectItem(BaseModel):
    """Top object item in reports."""
    object_id: str
    type: str | None = None
    title: str | None = None
    opens: int


class ReportTotals(BaseModel):
    """Total metrics for a report."""
    views: int = 0
    unique_visitors: int = 0
    qr_scans: int = 0
    map_opens: int = 0
    map_object_opens: int = 0
    share_clicks: int = 0
    link_copies: int = 0


class OrgReportSummary(BaseModel):
    """Summary report for an organization."""
    org_id: str
    from_date: date
    to_date: date
    totals: ReportTotals
    timeseries: list[TimeseriesPoint]
    top_pages: list[TopPageItem]
    top_objects: list[TopObjectItem]
