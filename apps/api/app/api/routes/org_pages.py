"""Organization-owned pages routes for Phoenix API."""

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth.dependencies import ActiveUser
from app.auth.org_rbac import require_org_editor, require_org_member
from app.db.session import get_db
from app.models import MemorialPage, Person, PageStatus, PageVisibility, Gender, LifeStatus
from app.services import org_service
from app.services.page_service import generate_slug, ensure_unique_slug
from app.api.schemas.page import (
    PageCreate,
    PageResponse,
    PageUpdate,
    PagesListResponse,
    PageListResponse,
)


router = APIRouter(prefix="/orgs/{org_id}/pages", tags=["Org Pages"])


@router.post("", response_model=PageResponse)
async def create_org_page(
    org_id: uuid.UUID,
    data: PageCreate,
    user: ActiveUser,
    db: AsyncSession = Depends(get_db),
) -> PageResponse:
    """Create org-owned page with person. Requires org_editor+."""
    await require_org_editor(db, org_id, user)

    org = await org_service.get_organization_by_id(db, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    person = Person(
        id=uuid.uuid4(),
        full_name=data.person.full_name,
        gender=data.person.gender or Gender.UNKNOWN,
        life_status=data.person.life_status or LifeStatus.UNKNOWN,
        birth_date=data.person.birth_date,
        death_date=data.person.death_date,
        created_by_user_id=user.id,
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
        visibility=data.visibility or PageVisibility.PUBLIC,
        status=PageStatus.DRAFT,
        owner_user_id=None,
        owner_org_id=org_id,
        org_project_id=data.project_id,
        created_by_user_id=user.id,
    )
    db.add(page)
    await db.flush()
    await db.refresh(page, ["person"])
    await db.commit()

    return PageResponse.model_validate(page)


@router.get("", response_model=PagesListResponse)
async def list_org_pages(
    org_id: uuid.UUID,
    user: ActiveUser,
    status: PageStatus | None = None,
    project_id: uuid.UUID | None = None,
    db: AsyncSession = Depends(get_db),
) -> PagesListResponse:
    """List org-owned pages. Requires membership."""
    await require_org_member(db, org_id, user)

    pages = await org_service.get_org_pages(db, org_id, status, project_id)

    items = []
    for p in pages:
        person_response = None
        if p.person:
            from app.api.schemas.page import PersonResponse
            person_response = PersonResponse.model_validate(p.person)
        items.append(PageListResponse(
            id=p.id,
            slug=p.slug,
            title=p.title,
            status=p.status,
            visibility=p.visibility,
            created_at=p.created_at,
            person_name=p.person.full_name if p.person else "Unknown",
            person=person_response,
        ))

    return PagesListResponse(
        items=items,
        total=len(items),
        page=1,
        size=len(items),
    )


@router.get("/{page_id}", response_model=PageResponse)
async def get_org_page(
    org_id: uuid.UUID,
    page_id: uuid.UUID,
    user: ActiveUser,
    db: AsyncSession = Depends(get_db),
) -> PageResponse:
    """Get org-owned page. Requires membership."""
    await require_org_member(db, org_id, user)

    result = await db.execute(
        select(MemorialPage)
        .options(selectinload(MemorialPage.person))
        .where(
            MemorialPage.id == page_id,
            MemorialPage.owner_org_id == org_id,
        )
    )
    page = result.scalar_one_or_none()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    return PageResponse.model_validate(page)


@router.patch("/{page_id}", response_model=PageResponse)
async def update_org_page(
    org_id: uuid.UUID,
    page_id: uuid.UUID,
    data: PageUpdate,
    user: ActiveUser,
    db: AsyncSession = Depends(get_db),
) -> PageResponse:
    """Update org-owned page. Requires org_editor+."""
    await require_org_editor(db, org_id, user)

    result = await db.execute(
        select(MemorialPage)
        .options(selectinload(MemorialPage.person))
        .where(
            MemorialPage.id == page_id,
            MemorialPage.owner_org_id == org_id,
        )
    )
    page = result.scalar_one_or_none()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

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
        if data.person.death_place is not None:
            person.death_place = data.person.death_place
        if data.person.burial_place is not None:
            person.burial_place = data.person.burial_place
        if data.person.burial_place_lat is not None:
            person.burial_place_lat = data.person.burial_place_lat
        if data.person.burial_place_lng is not None:
            person.burial_place_lng = data.person.burial_place_lng
        if data.person.burial_photo_url is not None:
            person.burial_photo_url = data.person.burial_photo_url

    if data.title is not None:
        page.title = data.title
    if data.short_description is not None:
        page.short_description = data.short_description
    if data.biography is not None:
        page.biography = data.biography
    if data.biography_json is not None:
        page.biography_json = data.biography_json
    if data.visibility is not None:
        page.visibility = data.visibility
    if data.org_project_id is not None:
        page.org_project_id = data.org_project_id

    await db.flush()
    await db.commit()
    await db.refresh(page, ["person"])

    return PageResponse.model_validate(page)


@router.post("/{page_id}/publish", response_model=PageResponse)
async def publish_org_page(
    org_id: uuid.UUID,
    page_id: uuid.UUID,
    user: ActiveUser,
    db: AsyncSession = Depends(get_db),
) -> PageResponse:
    """Publish org-owned page. Requires org_editor+. Goes to org moderation."""
    await require_org_editor(db, org_id, user)

    result = await db.execute(
        select(MemorialPage)
        .options(selectinload(MemorialPage.person))
        .where(
            MemorialPage.id == page_id,
            MemorialPage.owner_org_id == org_id,
        )
    )
    page = result.scalar_one_or_none()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    if page.status == PageStatus.PUBLISHED:
        raise HTTPException(status_code=400, detail="Page is already published")

    if page.status == PageStatus.ON_MODERATION:
        raise HTTPException(status_code=400, detail="Page is already on moderation")

    from app.services import page_service
    page = await page_service.publish_page(db, page, require_moderation=True)
    await db.commit()

    return PageResponse.model_validate(page)
