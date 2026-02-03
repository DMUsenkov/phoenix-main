"""Organization reports routes for Phoenix API."""

import uuid
from datetime import date, timedelta
from typing import Annotated
from io import StringIO
import csv

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.db.session import get_db
from app.models import User, Organization, OrganizationMember, OrgRole, UserRole, MemorialPage, MemoryObject
from app.services import analytics_service
from app.api.schemas.analytics import (
    OrgReportSummary,
    ReportTotals,
    TimeseriesPoint,
    TopPageItem,
    TopObjectItem,
)

router = APIRouter(prefix="/orgs/{org_id}/reports", tags=["Org Reports"])


async def check_org_viewer_access(
    db: AsyncSession,
    org_id: uuid.UUID,
    user: User,
) -> Organization:
    """Check if user has viewer+ access to org."""
    if user.role == UserRole.ADMIN:
        result = await db.execute(select(Organization).where(Organization.id == org_id))
        org = result.scalar_one_or_none()
        if not org:
            raise HTTPException(status_code=404, detail="Organization not found")
        return org

    result = await db.execute(
        select(OrganizationMember).where(
            OrganizationMember.organization_id == org_id,
            OrganizationMember.user_id == user.id,
        )
    )
    member = result.scalar_one_or_none()

    if not member:
        raise HTTPException(status_code=403, detail="Access denied")

    result = await db.execute(select(Organization).where(Organization.id == org_id))
    org = result.scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    return org


@router.get(
    "/summary",
    response_model=OrgReportSummary,
    summary="Get analytics summary for organization",
)
async def get_org_summary(
    org_id: uuid.UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    from_date: date = Query(default_factory=lambda: date.today() - timedelta(days=30)),
    to_date: date = Query(default_factory=date.today),
) -> OrgReportSummary:
    """Get analytics summary for an organization."""
    await check_org_viewer_access(db, org_id, user)

    summary = await analytics_service.get_org_summary(db, org_id, from_date, to_date)

    top_pages_enriched = []
    for item in summary["top_pages"]:
        page_id = uuid.UUID(item["page_id"])
        result = await db.execute(select(MemorialPage).where(MemorialPage.id == page_id))
        page = result.scalar_one_or_none()
        top_pages_enriched.append(TopPageItem(
            page_id=item["page_id"],
            title=page.title if page else None,
            slug=page.slug if page else None,
            views=item["views"],
            qr_scans=0,
        ))

    top_objects_enriched = []
    for item in summary["top_objects"]:
        object_id = uuid.UUID(item["object_id"])
        result = await db.execute(select(MemoryObject).where(MemoryObject.id == object_id))
        obj = result.scalar_one_or_none()
        top_objects_enriched.append(TopObjectItem(
            object_id=item["object_id"],
            type=obj.type.value if obj else None,
            title=obj.title if obj else None,
            opens=item["opens"],
        ))

    totals = summary["totals"]
    return OrgReportSummary(
        org_id=str(org_id),
        from_date=from_date,
        to_date=to_date,
        totals=ReportTotals(
            views=totals.get("views", 0),
            unique_visitors=totals.get("unique_visitors", 0),
            qr_scans=totals.get("qr_scans", 0),
            map_opens=totals.get("map_opens", 0),
            map_object_opens=totals.get("map_object_opens", 0),
            share_clicks=totals.get("share_clicks", 0),
            link_copies=totals.get("link_copies", 0),
        ),
        timeseries=[
            TimeseriesPoint(
                date=item["date"],
                views=item["views"],
                qr_scans=item["qr_scans"],
            )
            for item in summary["timeseries"]
        ],
        top_pages=top_pages_enriched,
        top_objects=top_objects_enriched,
    )


@router.get(
    "/export",
    summary="Export analytics data as CSV",
)
async def export_org_report(
    org_id: uuid.UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    from_date: date = Query(default_factory=lambda: date.today() - timedelta(days=30)),
    to_date: date = Query(default_factory=date.today),
    report_type: str = Query(default="summary", pattern="^(summary|pages|objects)$"),
) -> Response:
    """Export analytics data as CSV."""
    await check_org_viewer_access(db, org_id, user)

    summary = await analytics_service.get_org_summary(db, org_id, from_date, to_date)

    output = StringIO()
    writer = csv.writer(output)

    if report_type == "summary":
        writer.writerow(["Metric", "Value"])
        totals = summary["totals"]
        writer.writerow(["Views", totals.get("views", 0)])
        writer.writerow(["Unique Visitors", totals.get("unique_visitors", 0)])
        writer.writerow(["QR Scans", totals.get("qr_scans", 0)])
        writer.writerow(["Map Opens", totals.get("map_opens", 0)])
        writer.writerow(["Map Object Opens", totals.get("map_object_opens", 0)])
        writer.writerow([])
        writer.writerow(["Date", "Views", "QR Scans"])
        for item in summary["timeseries"]:
            writer.writerow([item["date"], item["views"], item["qr_scans"]])

    elif report_type == "pages":
        writer.writerow(["Page ID", "Title", "Slug", "Views"])
        for item in summary["top_pages"]:
            page_id = uuid.UUID(item["page_id"])
            result = await db.execute(select(MemorialPage).where(MemorialPage.id == page_id))
            page = result.scalar_one_or_none()
            writer.writerow([
                item["page_id"],
                page.title if page else "",
                page.slug if page else "",
                item["views"],
            ])

    elif report_type == "objects":
        writer.writerow(["Object ID", "Type", "Title", "Opens"])
        for item in summary["top_objects"]:
            object_id = uuid.UUID(item["object_id"])
            result = await db.execute(select(MemoryObject).where(MemoryObject.id == object_id))
            obj = result.scalar_one_or_none()
            writer.writerow([
                item["object_id"],
                obj.type.value if obj else "",
                obj.title if obj else "",
                item["opens"],
            ])

    csv_content = output.getvalue()
    filename = f"report_{report_type}_{from_date}_{to_date}.csv"

    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
        },
    )
