"""Service for QR code operations."""

import io
import secrets
import string
import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import QRCode, QRCodeScanEvent, MemorialPage


BASE62_ALPHABET = string.ascii_letters + string.digits
CODE_LENGTH = 8


def generate_base62_code(length: int = CODE_LENGTH) -> str:
    """Generate a cryptographically secure base62 code."""
    return "".join(secrets.choice(BASE62_ALPHABET) for _ in range(length))


async def ensure_unique_code(db: AsyncSession, max_attempts: int = 10) -> str:
    """Generate a unique QR code, retrying on collision."""
    for _ in range(max_attempts):
        code = generate_base62_code()
        result = await db.execute(
            select(QRCode.id).where(QRCode.code == code)
        )
        if result.scalar_one_or_none() is None:
            return code
    raise RuntimeError("Failed to generate unique QR code after max attempts")


async def get_qr_by_page_id(
    db: AsyncSession,
    page_id: uuid.UUID,
) -> QRCode | None:
    """Get QR code by page ID."""
    result = await db.execute(
        select(QRCode)
        .options(selectinload(QRCode.page))
        .where(QRCode.page_id == page_id)
    )
    return result.scalar_one_or_none()


async def get_qr_by_code(
    db: AsyncSession,
    code: str,
) -> QRCode | None:
    """Get QR code by short code."""
    result = await db.execute(
        select(QRCode)
        .options(selectinload(QRCode.page))
        .where(QRCode.code == code)
    )
    return result.scalar_one_or_none()


async def create_qr_for_page(
    db: AsyncSession,
    page_id: uuid.UUID,
    user_id: uuid.UUID,
) -> QRCode:
    """Create a QR code for a page (idempotent - returns existing if exists)."""
    existing = await get_qr_by_page_id(db, page_id)
    if existing:
        return existing

    code = await ensure_unique_code(db)

    qr = QRCode(
        id=uuid.uuid4(),
        page_id=page_id,
        code=code,
        is_active=True,
        created_by_user_id=user_id,
    )
    db.add(qr)
    await db.flush()
    await db.refresh(qr, ["page"])

    return qr


async def regenerate_qr_for_page(
    db: AsyncSession,
    page_id: uuid.UUID,
    user_id: uuid.UUID,
) -> QRCode:
    """Regenerate QR code for a page with a new code. Updates existing QR code."""
    existing = await get_qr_by_page_id(db, page_id)

    if not existing:
        return await create_qr_for_page(db, page_id, user_id)

    new_code = await ensure_unique_code(db)
    existing.code = new_code
    existing.is_active = True

    await db.flush()
    await db.refresh(existing, ["page"])

    return existing


async def create_scan_event(
    db: AsyncSession,
    qr_code_id: uuid.UUID,
    ip: str | None = None,
    user_agent: str | None = None,
    referer: str | None = None,
) -> QRCodeScanEvent:
    """Create a scan event for analytics."""
    event = QRCodeScanEvent(
        id=uuid.uuid4(),
        qr_code_id=qr_code_id,
        scanned_at=datetime.now(timezone.utc),
        ip=ip,
        user_agent=user_agent,
        referer=referer,
    )
    db.add(event)
    await db.flush()
    return event


def generate_qr_svg(data: str, size: int = 512) -> str:
    """Generate QR code as SVG string."""
    import qrcode
    import qrcode.image.svg

    factory = qrcode.image.svg.SvgPathImage
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=2,
    )
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(image_factory=factory)

    buffer = io.BytesIO()
    img.save(buffer)
    svg_content = buffer.getvalue().decode("utf-8")

    svg_content = svg_content.replace(
        'width="',
        f'width="{size}" height="{size}" viewBox="0 0 ',
        1,
    )

    return svg_content


def generate_qr_png(data: str, size: int = 512) -> bytes:
    """Generate QR code as PNG bytes."""
    import qrcode
    from PIL import Image

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=2,
    )
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    img = img.resize((size, size), Image.Resampling.LANCZOS)

    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    return buffer.getvalue()


def build_short_url(code: str, base_url: str) -> str:
    """Build the short URL for a QR code."""
    base_url = base_url.rstrip("/")
    return f"{base_url}/q/{code}"


def build_target_url(slug: str) -> str:
    """Build the target URL (public page) for a QR code."""
    return f"/p/{slug}"
