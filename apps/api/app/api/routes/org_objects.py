"""Organization-owned objects routes for Phoenix API."""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import ActiveUser
from app.auth.org_rbac import require_org_editor, require_org_member
from app.db.session import get_db
from app.models import MemoryObject, ObjectStatus, ObjectType, ObjectVisibility
from app.services import org_service
from app.api.schemas.memory_object import (
    ObjectCreate,
    ObjectResponse,
    ObjectUpdate,
)


router = APIRouter(prefix="/orgs/{org_id}/objects", tags=["Org Objects"])


@router.post("", response_model=ObjectResponse)
async def create_org_object(
    org_id: uuid.UUID,
    data: ObjectCreate,
    user: ActiveUser,
    db: AsyncSession = Depends(get_db),
) -> ObjectResponse:
    """Create org-owned memory object. Requires org_editor+."""
    await require_org_editor(db, org_id, user)

    org = await org_service.get_organization_by_id(db, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    obj = MemoryObject(
        id=uuid.uuid4(),
        page_id=data.page_id,
        type=data.type,
        title=data.title,
        description=data.description,
        lat=data.lat,
        lng=data.lng,
        address=data.address,
        status=ObjectStatus.DRAFT,
        visibility=data.visibility or ObjectVisibility.PUBLIC,
        owner_user_id=None,
        owner_org_id=org_id,
        org_project_id=data.project_id if hasattr(data, 'project_id') else None,
        created_by_user_id=user.id,
    )
    db.add(obj)
    await db.flush()
    await db.commit()
    await db.refresh(obj)

    return ObjectResponse.model_validate(obj)


@router.get("", response_model=list[ObjectResponse])
async def list_org_objects(
    org_id: uuid.UUID,
    user: ActiveUser,
    project_id: uuid.UUID | None = Query(None),
    status: ObjectStatus | None = Query(None),
    db: AsyncSession = Depends(get_db),
) -> list[ObjectResponse]:
    """List org-owned objects. Requires membership."""
    await require_org_member(db, org_id, user)

    objects = await org_service.get_org_objects(db, org_id, project_id, status)

    return [ObjectResponse.model_validate(o) for o in objects]


@router.get("/{object_id}", response_model=ObjectResponse)
async def get_org_object(
    org_id: uuid.UUID,
    object_id: uuid.UUID,
    user: ActiveUser,
    db: AsyncSession = Depends(get_db),
) -> ObjectResponse:
    """Get org-owned object. Requires membership."""
    await require_org_member(db, org_id, user)

    result = await db.execute(
        select(MemoryObject).where(
            MemoryObject.id == object_id,
            MemoryObject.owner_org_id == org_id,
        )
    )
    obj = result.scalar_one_or_none()
    if not obj:
        raise HTTPException(status_code=404, detail="Object not found")

    return ObjectResponse.model_validate(obj)


@router.patch("/{object_id}", response_model=ObjectResponse)
async def update_org_object(
    org_id: uuid.UUID,
    object_id: uuid.UUID,
    data: ObjectUpdate,
    user: ActiveUser,
    db: AsyncSession = Depends(get_db),
) -> ObjectResponse:
    """Update org-owned object. Requires org_editor+."""
    await require_org_editor(db, org_id, user)

    result = await db.execute(
        select(MemoryObject).where(
            MemoryObject.id == object_id,
            MemoryObject.owner_org_id == org_id,
        )
    )
    obj = result.scalar_one_or_none()
    if not obj:
        raise HTTPException(status_code=404, detail="Object not found")

    if data.title is not None:
        obj.title = data.title
    if data.description is not None:
        obj.description = data.description
    if data.lat is not None:
        obj.lat = data.lat
    if data.lng is not None:
        obj.lng = data.lng
    if data.address is not None:
        obj.address = data.address
    if data.visibility is not None:
        obj.visibility = data.visibility

    await db.flush()
    await db.commit()
    await db.refresh(obj)

    return ObjectResponse.model_validate(obj)


@router.post("/{object_id}/publish", response_model=ObjectResponse)
async def publish_org_object(
    org_id: uuid.UUID,
    object_id: uuid.UUID,
    user: ActiveUser,
    db: AsyncSession = Depends(get_db),
) -> ObjectResponse:
    """Publish org-owned object. Requires org_editor+."""
    await require_org_editor(db, org_id, user)

    result = await db.execute(
        select(MemoryObject).where(
            MemoryObject.id == object_id,
            MemoryObject.owner_org_id == org_id,
        )
    )
    obj = result.scalar_one_or_none()
    if not obj:
        raise HTTPException(status_code=404, detail="Object not found")

    if obj.status == ObjectStatus.PUBLISHED:
        raise HTTPException(status_code=400, detail="Object is already published")

    obj.status = ObjectStatus.PUBLISHED

    await db.flush()
    await db.commit()
    await db.refresh(obj)

    return ObjectResponse.model_validate(obj)


@router.patch("/{object_id}/project", response_model=ObjectResponse)
async def link_object_to_project(
    org_id: uuid.UUID,
    object_id: uuid.UUID,
    user: ActiveUser,
    project_id: uuid.UUID | None = Query(None),
    db: AsyncSession = Depends(get_db),
) -> ObjectResponse:
    """Link object to project. Requires org_editor+."""
    await require_org_editor(db, org_id, user)

    result = await db.execute(
        select(MemoryObject).where(
            MemoryObject.id == object_id,
            MemoryObject.owner_org_id == org_id,
        )
    )
    obj = result.scalar_one_or_none()
    if not obj:
        raise HTTPException(status_code=404, detail="Object not found")

    if project_id:
        project = await org_service.get_project_by_id(db, project_id)
        if not project or project.org_id != org_id:
            raise HTTPException(status_code=404, detail="Project not found")

    obj.org_project_id = project_id

    await db.flush()
    await db.commit()
    await db.refresh(obj)

    return ObjectResponse.model_validate(obj)
