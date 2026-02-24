"""Analytics service for event tracking and aggregation."""

import uuid
import hashlib
from datetime import datetime, date, timezone, timedelta
from typing import Sequence

from sqlalchemy import select, func, and_, text
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import AnalyticsEvent, AnalyticsDaily, EventType, MetricType
from app.core.config import get_settings

settings = get_settings()


ALLOWED_EVENT_TYPES = {
    EventType.PAGE_VIEW.value,
    EventType.QR_SCAN.value,
    EventType.MAP_OPEN.value,
    EventType.MAP_OBJECT_OPEN.value,
    EventType.SHARE_CLICK.value,
    EventType.LINK_COPY.value,
}

MAX_PROPERTIES_SIZE = 4096


def hash_ip(ip: str | None) -> str | None:
    """Hash IP address with salt for privacy."""
    if not ip:
        return None
    salt = getattr(settings, 'IP_HASH_SALT', 'phoenix-default-salt')
    return hashlib.sha256(f"{ip}{salt}".encode()).hexdigest()[:64]


async def track_event(
    db: AsyncSession,
    event_type: str,
    org_id: uuid.UUID | None = None,
    page_id: uuid.UUID | None = None,
    object_id: uuid.UUID | None = None,
    qr_code_id: uuid.UUID | None = None,
    actor_user_id: uuid.UUID | None = None,
    anon_id: str | None = None,
    session_id: str | None = None,
    ip: str | None = None,
    user_agent: str | None = None,
    referer: str | None = None,
    properties: dict | None = None,
) -> AnalyticsEvent:
    """Track a single analytics event."""
    event = AnalyticsEvent(
        id=uuid.uuid4(),
        event_type=event_type,
        occurred_at=datetime.utcnow(),
        org_id=org_id,
        page_id=page_id,
        object_id=object_id,
        qr_code_id=qr_code_id,
        actor_user_id=actor_user_id,
        anon_id=anon_id[:64] if anon_id else None,
        session_id=session_id[:64] if session_id else None,
        ip_hash=hash_ip(ip),
        user_agent=user_agent[:512] if user_agent else None,
        referer=referer[:1024] if referer else None,
        properties=properties,
    )
    db.add(event)
    await db.flush()
    return event


async def track_page_view(
    db: AsyncSession,
    page_id: uuid.UUID,
    org_id: uuid.UUID | None = None,
    actor_user_id: uuid.UUID | None = None,
    anon_id: str | None = None,
    session_id: str | None = None,
    ip: str | None = None,
    user_agent: str | None = None,
    referer: str | None = None,
) -> AnalyticsEvent:
    """Track a page view event."""
    return await track_event(
        db=db,
        event_type=EventType.PAGE_VIEW.value,
        page_id=page_id,
        org_id=org_id,
        actor_user_id=actor_user_id,
        anon_id=anon_id,
        session_id=session_id,
        ip=ip,
        user_agent=user_agent,
        referer=referer,
    )


async def track_qr_scan(
    db: AsyncSession,
    qr_code_id: uuid.UUID,
    page_id: uuid.UUID | None = None,
    object_id: uuid.UUID | None = None,
    org_id: uuid.UUID | None = None,
    anon_id: str | None = None,
    session_id: str | None = None,
    ip: str | None = None,
    user_agent: str | None = None,
    referer: str | None = None,
) -> AnalyticsEvent:
    """Track a QR code scan event."""
    return await track_event(
        db=db,
        event_type=EventType.QR_SCAN.value,
        qr_code_id=qr_code_id,
        page_id=page_id,
        object_id=object_id,
        org_id=org_id,
        anon_id=anon_id,
        session_id=session_id,
        ip=ip,
        user_agent=user_agent,
        referer=referer,
    )


async def upsert_daily_metric(
    db: AsyncSession,
    target_date: date,
    metric: str,
    value: int,
    org_id: uuid.UUID | None = None,
    page_id: uuid.UUID | None = None,
    object_id: uuid.UUID | None = None,
) -> None:
    """Upsert a daily metric value."""
    stmt = insert(AnalyticsDaily).values(
        id=uuid.uuid4(),
        date=target_date,
        org_id=org_id,
        page_id=page_id,
        object_id=object_id,
        metric=metric,
        value=value,
    ).on_conflict_do_update(
        constraint="uq_analytics_daily_composite",
        set_={"value": value},
    )
    await db.execute(stmt)


async def compute_daily_aggregates(
    db: AsyncSession,
    target_date: date,
    org_id: uuid.UUID | None = None,
) -> None:
    """Compute and upsert daily aggregates for a given date."""
    start_dt = datetime.combine(target_date, datetime.min.time())
    end_dt = start_dt + timedelta(days=1)

    org_filter = AnalyticsEvent.org_id == org_id if org_id else True

    views_result = await db.execute(
        select(func.count(AnalyticsEvent.id)).where(
            and_(
                AnalyticsEvent.event_type == EventType.PAGE_VIEW.value,
                AnalyticsEvent.occurred_at >= start_dt,
                AnalyticsEvent.occurred_at < end_dt,
                org_filter,
            )
        )
    )
    views_count = views_result.scalar() or 0

    unique_result = await db.execute(
        select(func.count(func.distinct(
            func.coalesce(AnalyticsEvent.anon_id, AnalyticsEvent.ip_hash)
        ))).where(
            and_(
                AnalyticsEvent.event_type == EventType.PAGE_VIEW.value,
                AnalyticsEvent.occurred_at >= start_dt,
                AnalyticsEvent.occurred_at < end_dt,
                org_filter,
            )
        )
    )
    unique_count = unique_result.scalar() or 0

    qr_result = await db.execute(
        select(func.count(AnalyticsEvent.id)).where(
            and_(
                AnalyticsEvent.event_type == EventType.QR_SCAN.value,
                AnalyticsEvent.occurred_at >= start_dt,
                AnalyticsEvent.occurred_at < end_dt,
                org_filter,
            )
        )
    )
    qr_count = qr_result.scalar() or 0

    map_opens_result = await db.execute(
        select(func.count(AnalyticsEvent.id)).where(
            and_(
                AnalyticsEvent.event_type == EventType.MAP_OPEN.value,
                AnalyticsEvent.occurred_at >= start_dt,
                AnalyticsEvent.occurred_at < end_dt,
                org_filter,
            )
        )
    )
    map_opens_count = map_opens_result.scalar() or 0

    map_object_result = await db.execute(
        select(func.count(AnalyticsEvent.id)).where(
            and_(
                AnalyticsEvent.event_type == EventType.MAP_OBJECT_OPEN.value,
                AnalyticsEvent.occurred_at >= start_dt,
                AnalyticsEvent.occurred_at < end_dt,
                org_filter,
            )
        )
    )
    map_object_count = map_object_result.scalar() or 0

    await upsert_daily_metric(db, target_date, MetricType.VIEWS.value, views_count, org_id=org_id)
    await upsert_daily_metric(db, target_date, MetricType.UNIQUE_VISITORS.value, unique_count, org_id=org_id)
    await upsert_daily_metric(db, target_date, MetricType.QR_SCANS.value, qr_count, org_id=org_id)
    await upsert_daily_metric(db, target_date, MetricType.MAP_OPENS.value, map_opens_count, org_id=org_id)
    await upsert_daily_metric(db, target_date, MetricType.MAP_OBJECT_OPENS.value, map_object_count, org_id=org_id)


async def get_org_summary(
    db: AsyncSession,
    org_id: uuid.UUID,
    from_date: date,
    to_date: date,
) -> dict:
    """Get analytics summary for an organization."""
    start_dt = datetime.combine(from_date, datetime.min.time())
    end_dt = datetime.combine(to_date + timedelta(days=1), datetime.min.time())

    totals = {}
    for metric in [MetricType.VIEWS, MetricType.UNIQUE_VISITORS, MetricType.QR_SCANS,
                   MetricType.MAP_OPENS, MetricType.MAP_OBJECT_OPENS]:
        result = await db.execute(
            select(func.count(AnalyticsEvent.id)).where(
                and_(
                    AnalyticsEvent.org_id == org_id,
                    AnalyticsEvent.occurred_at >= start_dt,
                    AnalyticsEvent.occurred_at < end_dt,
                    AnalyticsEvent.event_type == _metric_to_event_type(metric),
                )
            )
        )
        totals[metric.value] = result.scalar() or 0

    unique_result = await db.execute(
        select(func.count(func.distinct(
            func.coalesce(AnalyticsEvent.anon_id, AnalyticsEvent.ip_hash)
        ))).where(
            and_(
                AnalyticsEvent.org_id == org_id,
                AnalyticsEvent.occurred_at >= start_dt,
                AnalyticsEvent.occurred_at < end_dt,
                AnalyticsEvent.event_type == EventType.PAGE_VIEW.value,
            )
        )
    )
    totals[MetricType.UNIQUE_VISITORS.value] = unique_result.scalar() or 0

    timeseries_result = await db.execute(
        select(
            func.date(AnalyticsEvent.occurred_at).label("day"),
            AnalyticsEvent.event_type,
            func.count(AnalyticsEvent.id).label("count"),
        ).where(
            and_(
                AnalyticsEvent.org_id == org_id,
                AnalyticsEvent.occurred_at >= start_dt,
                AnalyticsEvent.occurred_at < end_dt,
                AnalyticsEvent.event_type.in_([EventType.PAGE_VIEW.value, EventType.QR_SCAN.value]),
            )
        ).group_by(
            func.date(AnalyticsEvent.occurred_at),
            AnalyticsEvent.event_type,
        ).order_by(func.date(AnalyticsEvent.occurred_at))
    )

    timeseries: dict[str, dict[str, int]] = {}
    for row in timeseries_result:
        day_str = row.day.isoformat() if hasattr(row.day, 'isoformat') else str(row.day)
        if day_str not in timeseries:
            timeseries[day_str] = {"views": 0, "qr_scans": 0}
        if row.event_type == EventType.PAGE_VIEW.value:
            timeseries[day_str]["views"] = row.count
        elif row.event_type == EventType.QR_SCAN.value:
            timeseries[day_str]["qr_scans"] = row.count

    timeseries_list = [
        {"date": k, "views": v["views"], "qr_scans": v["qr_scans"]}
        for k, v in sorted(timeseries.items())
    ]

    top_pages_result = await db.execute(
        select(
            AnalyticsEvent.page_id,
            func.count(AnalyticsEvent.id).label("views"),
        ).where(
            and_(
                AnalyticsEvent.org_id == org_id,
                AnalyticsEvent.occurred_at >= start_dt,
                AnalyticsEvent.occurred_at < end_dt,
                AnalyticsEvent.event_type == EventType.PAGE_VIEW.value,
                AnalyticsEvent.page_id.isnot(None),
            )
        ).group_by(AnalyticsEvent.page_id).order_by(func.count(AnalyticsEvent.id).desc()).limit(10)
    )
    top_pages = [{"page_id": str(row.page_id), "views": row.views} for row in top_pages_result]

    top_objects_result = await db.execute(
        select(
            AnalyticsEvent.object_id,
            func.count(AnalyticsEvent.id).label("opens"),
        ).where(
            and_(
                AnalyticsEvent.org_id == org_id,
                AnalyticsEvent.occurred_at >= start_dt,
                AnalyticsEvent.occurred_at < end_dt,
                AnalyticsEvent.event_type == EventType.MAP_OBJECT_OPEN.value,
                AnalyticsEvent.object_id.isnot(None),
            )
        ).group_by(AnalyticsEvent.object_id).order_by(func.count(AnalyticsEvent.id).desc()).limit(10)
    )
    top_objects = [{"object_id": str(row.object_id), "opens": row.opens} for row in top_objects_result]

    return {
        "totals": totals,
        "timeseries": timeseries_list,
        "top_pages": top_pages,
        "top_objects": top_objects,
    }


def _metric_to_event_type(metric: MetricType) -> str:
    """Map metric type to event type."""
    mapping = {
        MetricType.VIEWS: EventType.PAGE_VIEW.value,
        MetricType.QR_SCANS: EventType.QR_SCAN.value,
        MetricType.MAP_OPENS: EventType.MAP_OPEN.value,
        MetricType.MAP_OBJECT_OPENS: EventType.MAP_OBJECT_OPEN.value,
        MetricType.SHARE_CLICKS: EventType.SHARE_CLICK.value,
        MetricType.LINK_COPIES: EventType.LINK_COPY.value,
    }
    return mapping.get(metric, EventType.PAGE_VIEW.value)


def is_event_type_allowed(event_type: str) -> bool:
    """Check if event type is in allowlist."""
    return event_type in ALLOWED_EVENT_TYPES
