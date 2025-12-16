"""Public API routes for Phoenix (no auth required)."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models import (
    PageStatus,
    PageVisibility,
    Organization,
    OrgProject,
    ProjectStatus,
    MemorialPage,
    MemoryObject,
    ObjectStatus,
    Person,
    Media,
    MediaType,
)
from app.api.schemas.page import PagePublicResponse, PageSearchItem, PageSearchResponse
from app.api.schemas.page_content import (
    LifeEventResponse,
    AchievementResponse,
    EducationResponse,
    CareerResponse,
    PersonValueResponse,
    PersonValuesGrouped,
    QuoteResponse,
    MemorialMessagePublicResponse,
    PageContentResponse,
)
from app.api.schemas.media import MediaResponse
from app.services import page_service, analytics_service, page_content_service
from app.models.media import ModerationStatus

router = APIRouter(prefix="/public", tags=["Public"])


class PublicOrgResponse(BaseModel):
    """Public organization info."""
    id: uuid.UUID
    name: str
    slug: str
    type: str
    description: str | None

    model_config = {"from_attributes": True}


class PublicProjectResponse(BaseModel):
    """Public project info with stats."""
    id: uuid.UUID
    org_id: uuid.UUID
    name: str
    description: str | None
    lat: float | None
    lng: float | None
    address: str | None
    pages_count: int = 0
    objects_count: int = 0

    model_config = {"from_attributes": True}


class PublicProjectListResponse(BaseModel):
    """List of public projects."""
    items: list[PublicProjectResponse]
    total: int


@router.get(
    "/pages/{slug}",
    response_model=PagePublicResponse,
    summary="Get a published page by slug",
)
async def get_public_page(
    slug: str,
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> PagePublicResponse:
    """Get a published memorial page by slug (public access)."""
    page = await page_service.get_page_by_slug(db, slug)

    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page not found",
        )

    if page.status != PageStatus.PUBLISHED:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page not found",
        )

    if page.visibility == PageVisibility.PRIVATE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page not found",
        )

    ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    referer = request.headers.get("referer")

    await analytics_service.track_page_view(
        db=db,
        page_id=page.id,
        org_id=page.owner_org_id,
        ip=ip,
        user_agent=user_agent,
        referer=referer,
    )
    await db.commit()

    return PagePublicResponse(
        slug=page.slug,
        title=page.title,
        biography=page.biography,
        biography_json=page.biography_json,
        short_description=page.short_description,
        person=page.person,
        published_at=page.published_at,
    )


@router.get(
    "/orgs/{org_slug}",
    response_model=PublicOrgResponse,
    summary="Get public organization info by slug",
)
async def get_public_organization(
    org_slug: str,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> PublicOrgResponse:
    """Get public organization info by slug."""
    result = await db.execute(
        select(Organization).where(
            Organization.slug == org_slug,
            Organization.is_active == True,
        )
    )
    org = result.scalar_one_or_none()

    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found",
        )

    return PublicOrgResponse.model_validate(org)


@router.get(
    "/orgs/{org_slug}/projects",
    response_model=PublicProjectListResponse,
    summary="Get public projects of an organization",
)
async def get_public_org_projects(
    org_slug: str,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> PublicProjectListResponse:
    """Get public projects of an organization with page/object counts."""
    result = await db.execute(
        select(Organization).where(
            Organization.slug == org_slug,
            Organization.is_active == True,
        )
    )
    org = result.scalar_one_or_none()

    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found",
        )

    projects_result = await db.execute(
        select(OrgProject).where(
            OrgProject.org_id == org.id,
            OrgProject.status == ProjectStatus.ACTIVE,
        ).order_by(OrgProject.created_at.desc())
    )
    projects = projects_result.scalars().all()

    items = []
    for project in projects:
        pages_count_result = await db.execute(
            select(func.count(MemorialPage.id)).where(
                MemorialPage.owner_org_id == org.id,
                MemorialPage.status == PageStatus.PUBLISHED,
            )
        )
        pages_count = pages_count_result.scalar() or 0

        objects_count_result = await db.execute(
            select(func.count(MemoryObject.id)).where(
                MemoryObject.org_project_id == project.id,
                MemoryObject.status == ObjectStatus.PUBLISHED,
            )
        )
        objects_count = objects_count_result.scalar() or 0

        items.append(PublicProjectResponse(
            id=project.id,
            org_id=project.org_id,
            name=project.name,
            description=project.description,
            lat=project.lat,
            lng=project.lng,
            address=project.address,
            pages_count=pages_count,
            objects_count=objects_count,
        ))

    return PublicProjectListResponse(items=items, total=len(items))


@router.get(
    "/projects/{project_id}",
    response_model=PublicProjectResponse,
    summary="Get public project details",
)
async def get_public_project(
    project_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> PublicProjectResponse:
    """Get public project details with page/object counts."""
    result = await db.execute(
        select(OrgProject).where(
            OrgProject.id == project_id,
            OrgProject.status == ProjectStatus.ACTIVE,
        )
    )
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    org_result = await db.execute(
        select(Organization).where(
            Organization.id == project.org_id,
            Organization.is_active == True,
        )
    )
    org = org_result.scalar_one_or_none()

    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    pages_count_result = await db.execute(
        select(func.count(MemorialPage.id)).where(
            MemorialPage.owner_org_id == project.org_id,
            MemorialPage.status == PageStatus.PUBLISHED,
        )
    )
    pages_count = pages_count_result.scalar() or 0

    objects_count_result = await db.execute(
        select(func.count(MemoryObject.id)).where(
            MemoryObject.org_project_id == project.id,
            MemoryObject.status == ObjectStatus.PUBLISHED,
        )
    )
    objects_count = objects_count_result.scalar() or 0

    return PublicProjectResponse(
        id=project.id,
        org_id=project.org_id,
        name=project.name,
        description=project.description,
        lat=project.lat,
        lng=project.lng,
        address=project.address,
        pages_count=pages_count,
        objects_count=objects_count,
    )


@router.get("/search", response_model=PageSearchResponse)
async def search_pages(
    q: str = Query(..., min_length=2, description="Search query"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=50, description="Items per page"),
    db: AsyncSession = Depends(get_db),
) -> PageSearchResponse:
    """Search published memorial pages by person name or title."""
    search_term = f"%{q}%"


    count_query = (
        select(func.count(MemorialPage.id))
        .join(Person, MemorialPage.person_id == Person.id)
        .where(
            MemorialPage.status == PageStatus.PUBLISHED,
            Person.full_name.ilike(search_term),
        )
    )
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0


    offset = (page - 1) * size
    query = (
        select(MemorialPage, Person)
        .join(Person, MemorialPage.person_id == Person.id)
        .where(
            MemorialPage.status == PageStatus.PUBLISHED,
            Person.full_name.ilike(search_term),
        )
        .order_by(Person.full_name)
        .offset(offset)
        .limit(size)
    )

    result = await db.execute(query)
    rows = result.all()

    items = []
    for row in rows:
        page_obj = row[0]
        person = row[1]


        primary_photo_url = None
        media_query = (
            select(Media)
            .where(
                Media.page_id == page_obj.id,
                Media.type == MediaType.IMAGE,
                Media.is_primary == True,
            )
            .limit(1)
        )
        media_result = await db.execute(media_query)
        media = media_result.scalar_one_or_none()
        if media:
            primary_photo_url = media.original_url

        items.append(PageSearchItem(
            slug=page_obj.slug,
            title=page_obj.title,
            short_description=page_obj.short_description,
            person_name=person.full_name,
            birth_date=person.birth_date,
            death_date=person.death_date,
            life_status=person.life_status,
            primary_photo_url=primary_photo_url,
        ))

    return PageSearchResponse(
        items=items,
        total=total,
        page=page,
        size=size,
        query=q,
    )


class PublicMediaResponse(BaseModel):
    """Public media response (only approved media)."""

    id: uuid.UUID
    type: str
    original_url: str | None
    preview_url: str | None
    mime_type: str
    width: int | None
    height: int | None
    is_primary: bool

    model_config = {"from_attributes": True}


class PublicMediaListResponse(BaseModel):
    """List of public media items."""

    items: list[PublicMediaResponse]
    total: int
    primary_photo: PublicMediaResponse | None = None


@router.get(
    "/pages/{slug}/media",
    response_model=PublicMediaListResponse,
    summary="Get approved media for a published page",
)
async def get_public_page_media(
    slug: str,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> PublicMediaListResponse:
    """Get approved media for a published memorial page (public access)."""
    page = await page_service.get_page_by_slug(db, slug)

    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page not found",
        )

    if page.status != PageStatus.PUBLISHED:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page not found",
        )

    if page.visibility == PageVisibility.PRIVATE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page not found",
        )


    media_query = (
        select(Media)
        .where(
            Media.page_id == page.id,
            Media.moderation_status == ModerationStatus.APPROVED,
        )
        .order_by(Media.is_primary.desc(), Media.created_at.desc())
    )
    result = await db.execute(media_query)
    media_items = result.scalars().all()

    items = [
        PublicMediaResponse(
            id=m.id,
            type=m.type.value,
            original_url=m.original_url,
            preview_url=m.preview_url,
            mime_type=m.mime_type,
            width=m.width,
            height=m.height,
            is_primary=m.is_primary,
        )
        for m in media_items
    ]

    primary_photo = next((item for item in items if item.is_primary), None)

    return PublicMediaListResponse(
        items=items,
        total=len(items),
        primary_photo=primary_photo,
    )


@router.get(
    "/pages/{slug}/content",
    response_model=PageContentResponse,
    summary="Get content for a published page",
)
async def get_public_page_content(
    slug: str,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> PageContentResponse:
    """Get extended content for a published memorial page (public access)."""
    page = await page_service.get_page_by_slug(db, slug)

    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page not found",
        )

    if page.status != PageStatus.PUBLISHED:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page not found",
        )

    if page.visibility == PageVisibility.PRIVATE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page not found",
        )


    content = await page_content_service.get_full_page_content(
        db, page.id, include_unapproved_messages=False
    )

    grouped_values = content["values"]
    return PageContentResponse(
        life_events=[LifeEventResponse.model_validate(e) for e in content["life_events"]],
        achievements=[AchievementResponse.model_validate(a) for a in content["achievements"]],
        education=[EducationResponse.model_validate(e) for e in content["education"]],
        career=[CareerResponse.model_validate(c) for c in content["career"]],
        values=PersonValuesGrouped(
            values=[PersonValueResponse.model_validate(v) for v in grouped_values["values"]],
            beliefs=[PersonValueResponse.model_validate(v) for v in grouped_values["beliefs"]],
            principles=[PersonValueResponse.model_validate(v) for v in grouped_values["principles"]],
        ),
        quotes=[QuoteResponse.model_validate(q) for q in content["quotes"]],
        memorial_messages=[MemorialMessagePublicResponse.model_validate(m) for m in content["memorial_messages"]],
    )
