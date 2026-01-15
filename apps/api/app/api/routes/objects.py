"""Memory Objects API routes for Phoenix."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import require_active_user, ActiveUser
from app.db.session import get_db
from app.models import UserRole, ObjectStatus, ObjectType, PageStatus
from app.services import memory_object_service
from app.api.schemas.memory_object import (
    ObjectCreate,
    ObjectUpdate,
    ObjectResponse,
    ObjectListResponse,
    MessageResponse,
)

router = APIRouter(prefix="/objects", tags=["Objects"])


async def get_object_with_access(
    db: AsyncSession,
    object_id: uuid.UUID,
    user: ActiveUser,
) -> "MemoryObject":
    """Get object and verify user has access."""
    from app.models import MemoryObject

    obj = await memory_object_service.get_object_by_id(db, object_id)
    if not obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Object not found",
        )
    if user.role != UserRole.ADMIN and obj.owner_user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    return obj


@router.post(
    "",
    response_model=ObjectResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a memory object",
)
async def create_object(
    data: ObjectCreate,
    user: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ObjectResponse:
    """Create a new memory object for a page."""
    page = await memory_object_service.get_page_by_id(db, data.page_id)
    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page not found",
        )

    if user.role != UserRole.ADMIN and page.owner_user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create objects for your own pages",
        )

    obj = await memory_object_service.create_object(
        db=db,
        page_id=data.page_id,
        object_type=data.type,
        lat=data.lat,
        lng=data.lng,
        user_id=user.id,
        title=data.title,
        description=data.description,
        address=data.address,
        visibility=data.visibility,
    )

    return ObjectResponse.model_validate(obj)


@router.get(
    "",
    response_model=ObjectListResponse,
    summary="List my objects",
)
async def list_objects(
    user: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    object_status: ObjectStatus | None = Query(None, alias="status"),
    object_type: ObjectType | None = Query(None, alias="type"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
) -> ObjectListResponse:
    """List objects owned by the current user."""
    objects, total = await memory_object_service.list_user_objects(
        db=db,
        user_id=user.id,
        status_filter=object_status,
        type_filter=object_type,
        limit=limit,
        offset=offset,
    )

    return ObjectListResponse(
        items=[ObjectResponse.model_validate(o) for o in objects],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get(
    "/{object_id}",
    response_model=ObjectResponse,
    summary="Get object by ID",
)
async def get_object(
    object_id: uuid.UUID,
    user: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ObjectResponse:
    """Get a memory object by ID."""
    obj = await get_object_with_access(db, object_id, user)
    return ObjectResponse.model_validate(obj)


@router.patch(
    "/{object_id}",
    response_model=ObjectResponse,
    summary="Update object",
)
async def update_object(
    object_id: uuid.UUID,
    data: ObjectUpdate,
    user: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ObjectResponse:
    """Update a memory object."""
    obj = await get_object_with_access(db, object_id, user)

    updated = await memory_object_service.update_object(
        db=db,
        obj=obj,
        title=data.title,
        description=data.description,
        lat=data.lat,
        lng=data.lng,
        address=data.address,
        visibility=data.visibility,
    )

    return ObjectResponse.model_validate(updated)


@router.delete(
    "/{object_id}",
    response_model=MessageResponse,
    summary="Delete (archive) object",
)
async def delete_object(
    object_id: uuid.UUID,
    user: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> MessageResponse:
    """Soft delete a memory object (set status to archived)."""
    obj = await get_object_with_access(db, object_id, user)
    await memory_object_service.archive_object(db, obj)
    return MessageResponse(message="Object archived successfully")


@router.post(
    "/{object_id}/publish",
    response_model=ObjectResponse,
    summary="Publish object",
)
async def publish_object(
    object_id: uuid.UUID,
    user: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ObjectResponse:
    """Publish a memory object. Page must be published first."""
    obj = await get_object_with_access(db, object_id, user)

    if obj.status == ObjectStatus.PUBLISHED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Object is already published",
        )

    if obj.status == ObjectStatus.ARCHIVED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot publish archived object",
        )

    is_page_published = await memory_object_service.is_page_published(db, obj.page_id)
    if not is_page_published:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot publish object: page is not published",
        )

    published = await memory_object_service.publish_object(db, obj)
    return ObjectResponse.model_validate(published)
