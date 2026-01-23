"""QR code routes for Phoenix API."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import ActiveUser
from app.core.config import get_settings
from app.db.session import get_db
from app.models import MemorialPage, UserRole
from app.services import qr_service, analytics_service
from app.services.page_service import get_page_by_id
from app.api.schemas.qr import QRCodeResponse, QRImageParams


router = APIRouter(tags=["QR Codes"])
public_router = APIRouter(tags=["QR Redirect"])


async def _check_page_access(page: MemorialPage, user: ActiveUser, db: AsyncSession) -> None:
    """Check if user has access to the page (owner, org member, or admin)."""
    from sqlalchemy import select
    from app.models import OrganizationMember


    if user.role == UserRole.ADMIN:
        return


    if page.owner_user_id == user.id:
        return


    if page.owner_org_id:
        result = await db.execute(
            select(OrganizationMember.id).where(
                OrganizationMember.org_id == page.owner_org_id,
                OrganizationMember.user_id == user.id,
                OrganizationMember.role.in_(["owner", "admin", "editor", "org_admin", "org_editor"]),
            )
        )
        if result.scalar_one_or_none() is not None:
            return

    raise HTTPException(status_code=403, detail="Access denied")


@router.post("/pages/{page_id}/qr", response_model=QRCodeResponse)
async def create_or_get_qr(
    page_id: uuid.UUID,
    user: ActiveUser,
    db: AsyncSession = Depends(get_db),
) -> QRCodeResponse:
    """Create or get QR code for a page (idempotent)."""
    page = await get_page_by_id(db, page_id)
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    await _check_page_access(page, user, db)

    qr = await qr_service.create_qr_for_page(db, page_id, user.id)
    await db.commit()

    settings = get_settings()
    short_url = qr_service.build_short_url(qr.code, settings.PUBLIC_BASE_URL)
    target_url = qr_service.build_target_url(page.slug)

    return QRCodeResponse(
        id=qr.id,
        page_id=qr.page_id,
        code=qr.code,
        is_active=qr.is_active,
        short_url=short_url,
        target_url=target_url,
        created_at=qr.created_at,
        updated_at=qr.updated_at,
    )


@router.get("/pages/{page_id}/qr", response_model=QRCodeResponse)
async def get_qr(
    page_id: uuid.UUID,
    user: ActiveUser,
    db: AsyncSession = Depends(get_db),
) -> QRCodeResponse:
    """Get QR code for a page."""
    page = await get_page_by_id(db, page_id)
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    await _check_page_access(page, user, db)

    qr = await qr_service.get_qr_by_page_id(db, page_id)
    if not qr:
        raise HTTPException(status_code=404, detail="QR code not found")

    settings = get_settings()
    short_url = qr_service.build_short_url(qr.code, settings.PUBLIC_BASE_URL)
    target_url = qr_service.build_target_url(page.slug)

    return QRCodeResponse(
        id=qr.id,
        page_id=qr.page_id,
        code=qr.code,
        is_active=qr.is_active,
        short_url=short_url,
        target_url=target_url,
        created_at=qr.created_at,
        updated_at=qr.updated_at,
    )


@router.post("/pages/{page_id}/qr/regenerate", response_model=QRCodeResponse)
async def regenerate_qr(
    page_id: uuid.UUID,
    user: ActiveUser,
    db: AsyncSession = Depends(get_db),
) -> QRCodeResponse:
    """Regenerate QR code for a page. Old QR code will be deactivated."""
    page = await get_page_by_id(db, page_id)
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    await _check_page_access(page, user, db)

    qr = await qr_service.regenerate_qr_for_page(db, page_id, user.id)
    await db.commit()

    settings = get_settings()
    short_url = qr_service.build_short_url(qr.code, settings.PUBLIC_BASE_URL)
    target_url = qr_service.build_target_url(page.slug)

    return QRCodeResponse(
        id=qr.id,
        page_id=qr.page_id,
        code=qr.code,
        is_active=qr.is_active,
        short_url=short_url,
        target_url=target_url,
        created_at=qr.created_at,
        updated_at=qr.updated_at,
    )


@router.get("/qr/{code}/image")
async def get_qr_image(
    code: str,
    user: ActiveUser,
    db: AsyncSession = Depends(get_db),
    format: str = Query(default="svg", pattern="^(svg|png)$"),
    size: int = Query(default=512, ge=64, le=2048),
) -> Response:
    """Get QR code image (SVG or PNG)."""
    qr = await qr_service.get_qr_by_code(db, code)
    if not qr:
        raise HTTPException(status_code=404, detail="QR code not found")

    page = qr.page
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    await _check_page_access(page, user, db)

    settings = get_settings()
    short_url = qr_service.build_short_url(code, settings.PUBLIC_BASE_URL)

    if format == "svg":
        svg_content = qr_service.generate_qr_svg(short_url, size)
        return Response(
            content=svg_content,
            media_type="image/svg+xml",
            headers={
                "Content-Disposition": f'inline; filename="qr-{code}.svg"',
                "Cache-Control": "public, max-age=86400",
            },
        )
    else:
        png_content = qr_service.generate_qr_png(short_url, size)
        return Response(
            content=png_content,
            media_type="image/png",
            headers={
                "Content-Disposition": f'inline; filename="qr-{code}.png"',
                "Cache-Control": "public, max-age=86400",
            },
        )


@public_router.get("/q/{code}")
async def redirect_qr(
    code: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> RedirectResponse:
    """Redirect from QR short code to public page."""
    qr = await qr_service.get_qr_by_code(db, code)

    if not qr or not qr.is_active:
        raise HTTPException(status_code=404, detail="QR code not found or inactive")

    page = qr.page
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    referer = request.headers.get("referer")

    await analytics_service.track_qr_scan(
        db=db,
        qr_code_id=qr.id,
        page_id=page.id,
        org_id=page.owner_org_id,
        ip=ip,
        user_agent=user_agent,
        referer=referer,
    )
    await db.commit()

    target_url = qr_service.build_target_url(page.slug)

    return RedirectResponse(url=target_url, status_code=302)
