"""Analytics routes for Phoenix API."""

import uuid
from datetime import date, timedelta
from typing import Annotated
from io import StringIO
import csv

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services import analytics_service
from app.api.schemas.analytics import (
    TrackEventRequest,
    TrackEventResponse,
    OrgReportSummary,
    ReportTotals,
    TimeseriesPoint,
    TopPageItem,
    TopObjectItem,
)

public_router = APIRouter(prefix="/public/analytics", tags=["Analytics Public"])


RATE_LIMIT_EVENTS_PER_MINUTE = 60
_rate_limit_cache: dict[str, list[float]] = {}


def _check_rate_limit(identifier: str) -> bool:
    """Simple in-memory rate limiting (for MVP)."""
    import time
    now = time.time()
    window = 60

    if identifier not in _rate_limit_cache:
        _rate_limit_cache[identifier] = []

    _rate_limit_cache[identifier] = [
        t for t in _rate_limit_cache[identifier] if now - t < window
    ]

    if len(_rate_limit_cache[identifier]) >= RATE_LIMIT_EVENTS_PER_MINUTE:
        return False

    _rate_limit_cache[identifier].append(now)
    return True


@public_router.post(
    "/events",
    response_model=TrackEventResponse,
    summary="Track a client-side analytics event",
)
async def track_client_event(
    data: TrackEventRequest,
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TrackEventResponse:
    """Track a client-side event (map interactions, shares, etc.)."""
    if not analytics_service.is_event_type_allowed(data.event_type):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Event type '{data.event_type}' is not allowed",
        )

    ip = request.client.host if request.client else None
    identifier = data.anon_id or analytics_service.hash_ip(ip) or "unknown"

    if not _check_rate_limit(identifier):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded",
        )

    if data.properties and len(str(data.properties)) > analytics_service.MAX_PROPERTIES_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Properties payload too large",
        )

    user_agent = request.headers.get("user-agent")
    referer = request.headers.get("referer")

    page_id = uuid.UUID(data.page_id) if data.page_id else None
    object_id = uuid.UUID(data.object_id) if data.object_id else None

    await analytics_service.track_event(
        db=db,
        event_type=data.event_type,
        page_id=page_id,
        object_id=object_id,
        anon_id=data.anon_id,
        session_id=data.session_id,
        ip=ip,
        user_agent=user_agent,
        referer=referer,
        properties=data.properties,
    )
    await db.commit()

    return TrackEventResponse(success=True)
