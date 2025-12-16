"""Pages API routes for Phoenix."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import require_active_user, ActiveUser
from app.db.session import get_db
from app.models import MemorialPage, PageStatus, UserRole
from app.api.schemas.page import (
    PageCreate,
    PageUpdate,
    PageResponse,
    PageListResponse,
    PagesListResponse,
    MessageResponse,
)
from app.services import page_service

router = APIRouter(prefix="/pages", tags=["Pages"])


def can_access_page(page: MemorialPage, user: ActiveUser) -> bool:
    """Check if user can access a page."""
    if user.role == UserRole.ADMIN:
        return True
    return page.owner_user_id == user.id


def can_modify_page(page: MemorialPage, user: ActiveUser) -> bool:
    """Check if user can modify a page."""
    if user.role == UserRole.ADMIN:
        return True
    return page.owner_user_id == user.id


@router.post(
    "",
    response_model=PageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new memorial page",
)
async def create_page(
    data: PageCreate,
    user: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> PageResponse:
    """Create a new Person and MemorialPage."""
    page = await page_service.create_page(db, data, user.id)
    return PageResponse(
        id=page.id,
        slug=page.slug,
        title=page.title,
        biography=page.biography,
        short_description=page.short_description,
        biography_json=page.biography_json,
        visibility=page.visibility,
        status=page.status,
        published_at=page.published_at,
        created_at=page.created_at,
        updated_at=page.updated_at,
        person=page.person,
    )


@router.get(
    "",
    response_model=PagesListResponse,
    summary="List my pages",
)
async def list_my_pages(
    user: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    status_filter: Annotated[PageStatus | None, Query(alias="status")] = None,
    page: Annotated[int, Query(ge=1)] = 1,
    size: Annotated[int, Query(ge=1, le=100)] = 20,
) -> PagesListResponse:
    """List pages owned by the current user."""
    pages, total = await page_service.get_user_pages(
        db, user.id, status=status_filter, page=page, size=size
    )

    items = [
        PageListResponse(
            id=p.id,
            slug=p.slug,
            title=p.title,
            status=p.status,
            visibility=p.visibility,
            created_at=p.created_at,
            person_name=p.person.full_name,
        )
        for p in pages
    ]

    return PagesListResponse(items=items, total=total, page=page, size=size)


@router.get(
    "/{page_id}",
    response_model=PageResponse,
    summary="Get a page by ID",
)
async def get_page(
    page_id: uuid.UUID,
    user: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> PageResponse:
    """Get a memorial page by ID."""
    page = await page_service.get_page_by_id(db, page_id)

    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page not found",
        )

    if not can_access_page(page, user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    return PageResponse(
        id=page.id,
        slug=page.slug,
        title=page.title,
        biography=page.biography,
        short_description=page.short_description,
        biography_json=page.biography_json,
        visibility=page.visibility,
        status=page.status,
        published_at=page.published_at,
        created_at=page.created_at,
        updated_at=page.updated_at,
        person=page.person,
    )


@router.patch(
    "/{page_id}",
    response_model=PageResponse,
    summary="Update a page",
)
async def update_page(
    page_id: uuid.UUID,
    data: PageUpdate,
    user: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> PageResponse:
    """Update a memorial page."""
    page = await page_service.get_page_by_id(db, page_id)

    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page not found",
        )

    if not can_modify_page(page, user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    page = await page_service.update_page(db, page, data)

    return PageResponse(
        id=page.id,
        slug=page.slug,
        title=page.title,
        biography=page.biography,
        short_description=page.short_description,
        biography_json=page.biography_json,
        visibility=page.visibility,
        status=page.status,
        published_at=page.published_at,
        created_at=page.created_at,
        updated_at=page.updated_at,
        person=page.person,
    )


@router.delete(
    "/{page_id}",
    response_model=MessageResponse,
    summary="Archive a page",
)
async def delete_page(
    page_id: uuid.UUID,
    user: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> MessageResponse:
    """Archive (soft delete) a memorial page."""
    page = await page_service.get_page_by_id(db, page_id)

    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page not found",
        )

    if not can_modify_page(page, user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    await page_service.archive_page(db, page)

    return MessageResponse(message="Page archived successfully")


@router.post(
    "/{page_id}/publish",
    response_model=PageResponse,
    summary="Publish a page",
)
async def publish_page(
    page_id: uuid.UUID,
    user: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    skip_moderation: Annotated[bool, Query()] = False,
) -> PageResponse:
    """Publish a memorial page. Admin can skip moderation."""
    page = await page_service.get_page_by_id(db, page_id)

    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page not found",
        )

    if not can_modify_page(page, user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    if page.status == PageStatus.PUBLISHED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Page is already published",
        )

    require_moderation = not (skip_moderation and user.role == UserRole.ADMIN)
    page = await page_service.publish_page(db, page, require_moderation=require_moderation)

    return PageResponse(
        id=page.id,
        slug=page.slug,
        title=page.title,
        biography=page.biography,
        short_description=page.short_description,
        biography_json=page.biography_json,
        visibility=page.visibility,
        status=page.status,
        published_at=page.published_at,
        created_at=page.created_at,
        updated_at=page.updated_at,
        person=page.person,
    )
