"""Service for MemorialPage operations."""

import re
import secrets
import uuid
from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import MemorialPage, PageStatus, Person
from app.api.schemas.page import PageCreate, PageUpdate


def generate_slug(full_name: str) -> str:
    """Generate a URL-friendly slug from full name."""
    slug = full_name.lower().strip()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[-\s]+", "-", slug)
    slug = slug.strip("-")
    suffix = secrets.token_hex(4)
    return f"{slug}-{suffix}"


async def ensure_unique_slug(db: AsyncSession, base_slug: str) -> str:
    """Ensure slug is unique, adding suffix if needed."""
    slug = base_slug
    counter = 0

    while True:
        result = await db.execute(
            select(MemorialPage.id).where(MemorialPage.slug == slug)
        )
        if result.scalar_one_or_none() is None:
            return slug
        counter += 1
        slug = f"{base_slug}-{counter}"


async def create_page(
    db: AsyncSession,
    data: PageCreate,
    user_id: uuid.UUID,
) -> MemorialPage:
    """Create a Person and MemorialPage in one transaction."""
    person = Person(
        id=uuid.uuid4(),
        full_name=data.person.full_name,
        gender=data.person.gender,
        life_status=data.person.life_status,
        birth_date=data.person.birth_date,
        death_date=data.person.death_date,

        birth_place=data.person.birth_place,
        birth_place_lat=data.person.birth_place_lat,
        birth_place_lng=data.person.birth_place_lng,
        death_place=data.person.death_place,
        death_place_lat=data.person.death_place_lat,
        death_place_lng=data.person.death_place_lng,
        burial_place=data.person.burial_place,
        burial_place_lat=data.person.burial_place_lat,
        burial_place_lng=data.person.burial_place_lng,
        burial_photo_url=data.person.burial_photo_url,
        created_by_user_id=user_id,
    )
    db.add(person)
    await db.flush()

    base_slug = generate_slug(data.person.full_name)
    slug = await ensure_unique_slug(db, base_slug)

    page = MemorialPage(
        id=uuid.uuid4(),
        person_id=person.id,
        slug=slug,
        title=data.title or data.person.full_name,
        biography=data.biography,
        short_description=data.short_description,
        biography_json=data.biography_json,
        visibility=data.visibility,
        status=PageStatus.DRAFT,
        owner_user_id=user_id,
        created_by_user_id=user_id,
    )
    db.add(page)
    await db.flush()
    await db.refresh(page, ["person"])

    return page


async def get_page_by_id(
    db: AsyncSession,
    page_id: uuid.UUID,
) -> MemorialPage | None:
    """Get a page by ID with person loaded."""
    result = await db.execute(
        select(MemorialPage)
        .options(selectinload(MemorialPage.person))
        .where(MemorialPage.id == page_id)
    )
    return result.scalar_one_or_none()


async def get_page_by_slug(
    db: AsyncSession,
    slug: str,
) -> MemorialPage | None:
    """Get a page by slug with person loaded."""
    result = await db.execute(
        select(MemorialPage)
        .options(selectinload(MemorialPage.person))
        .where(MemorialPage.slug == slug)
    )
    return result.scalar_one_or_none()


async def get_user_pages(
    db: AsyncSession,
    user_id: uuid.UUID,
    status: PageStatus | None = None,
    page: int = 1,
    size: int = 20,
) -> tuple[list[MemorialPage], int]:
    """Get pages owned by user with pagination."""
    query = (
        select(MemorialPage)
        .options(selectinload(MemorialPage.person))
        .where(MemorialPage.owner_user_id == user_id)
    )

    if status:
        query = query.where(MemorialPage.status == status)

    count_query = (
        select(func.count())
        .select_from(MemorialPage)
        .where(MemorialPage.owner_user_id == user_id)
    )
    if status:
        count_query = count_query.where(MemorialPage.status == status)

    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    query = query.order_by(MemorialPage.created_at.desc())
    query = query.offset((page - 1) * size).limit(size)

    result = await db.execute(query)
    pages = list(result.scalars().all())

    return pages, total


async def update_page(
    db: AsyncSession,
    page: MemorialPage,
    data: PageUpdate,
) -> MemorialPage:
    """Update a page and optionally its person."""
    if data.title is not None:
        page.title = data.title
    if data.biography is not None:
        page.biography = data.biography
    if data.short_description is not None:
        page.short_description = data.short_description
    if data.biography_json is not None:
        page.biography_json = data.biography_json
    if data.visibility is not None:
        page.visibility = data.visibility

    if data.person:
        person = page.person
        if data.person.full_name is not None:
            person.full_name = data.person.full_name
        if data.person.gender is not None:
            person.gender = data.person.gender
        if data.person.life_status is not None:
            person.life_status = data.person.life_status
        if data.person.birth_date is not None:
            person.birth_date = data.person.birth_date
        if data.person.death_date is not None:
            person.death_date = data.person.death_date

        if data.person.birth_place is not None:
            person.birth_place = data.person.birth_place
        if data.person.birth_place_lat is not None:
            person.birth_place_lat = data.person.birth_place_lat
        if data.person.birth_place_lng is not None:
            person.birth_place_lng = data.person.birth_place_lng
        if data.person.death_place is not None:
            person.death_place = data.person.death_place
        if data.person.death_place_lat is not None:
            person.death_place_lat = data.person.death_place_lat
        if data.person.death_place_lng is not None:
            person.death_place_lng = data.person.death_place_lng
        if data.person.burial_place is not None:
            person.burial_place = data.person.burial_place
        if data.person.burial_place_lat is not None:
            person.burial_place_lat = data.person.burial_place_lat
        if data.person.burial_place_lng is not None:
            person.burial_place_lng = data.person.burial_place_lng
        if data.person.burial_photo_url is not None:
            person.burial_photo_url = data.person.burial_photo_url

    await db.flush()
    await db.refresh(page, ["person"])

    return page


async def publish_page(
    db: AsyncSession,
    page: MemorialPage,
    require_moderation: bool = True,
) -> MemorialPage:
    """Publish a page. If require_moderation=True, sets to on_moderation and creates task.

    - Pages with owner_org_id go to org moderation
    - Personal pages (owner_user_id only) go to system admin moderation
    """
    from app.services import moderation_service
    from app.models import EntityType

    if require_moderation:
        page.status = PageStatus.ON_MODERATION
        await db.flush()

        await moderation_service.create_moderation_task(
            db=db,
            entity_type=EntityType.PAGE,
            entity_id=page.id,
            created_by_user_id=page.created_by_user_id,
            org_id=page.owner_org_id,
        )
    else:
        page.status = PageStatus.PUBLISHED
        page.published_at = datetime.utcnow()

    await db.flush()
    await db.refresh(page)
    return page


async def archive_page(
    db: AsyncSession,
    page: MemorialPage,
) -> MemorialPage:
    """Archive (soft delete) a page."""
    page.status = PageStatus.ARCHIVED
    await db.flush()
    await db.refresh(page)
    return page
