"""Organization moderation routes for Phoenix API."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.db.session import get_db
from app.models import User, EntityType, TaskStatus, OrgRole
from app.services import moderation_service, org_service
from app.api.schemas.moderation import (
    ModerationTaskResponse,
    ModerationTaskDetailResponse,
    ModerationTaskListResponse,
    RejectRequest,
    ApproveResponse,
    RejectResponse,
)

router = APIRouter(prefix="/orgs/{org_id}/moderation", tags=["Org Moderation"])


async def require_org_moderator(
    org_id: uuid.UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """Require user to be org_moderator or org_admin in the organization, or system admin."""
    from app.models import UserRole


    if user.role == UserRole.ADMIN:
        return user

    member = await org_service.get_member_by_user_id(db, org_id, user.id)
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a member of this organization",
        )

    if member.role not in [OrgRole.ORG_ADMIN, OrgRole.ORG_MODERATOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Moderation requires org_admin or org_moderator role",
        )

    return user


@router.get(
    "/tasks",
    response_model=ModerationTaskListResponse,
    summary="List organization moderation tasks",
)
async def list_org_moderation_tasks(
    org_id: uuid.UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    entity_type: EntityType | None = Query(None, description="Filter by entity type"),
    task_status: TaskStatus | None = Query(None, alias="status", description="Filter by status"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
) -> ModerationTaskListResponse:
    """List moderation tasks for organization."""
    await require_org_moderator(org_id, user, db)

    tasks, total = await moderation_service.list_tasks(
        db=db,
        entity_type=entity_type,
        status=task_status,
        org_id=org_id,
        limit=limit,
        offset=offset,
    )

    return ModerationTaskListResponse(
        items=[ModerationTaskResponse.model_validate(t) for t in tasks],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get(
    "/tasks/{task_id}",
    response_model=ModerationTaskDetailResponse,
    summary="Get organization moderation task details",
)
async def get_org_moderation_task(
    org_id: uuid.UUID,
    task_id: uuid.UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ModerationTaskDetailResponse:
    """Get moderation task details within organization scope."""
    await require_org_moderator(org_id, user, db)

    task = await moderation_service.get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Moderation task not found",
        )

    if task.org_id != org_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Task does not belong to this organization",
        )

    entity_summary = await moderation_service.get_entity_summary(db, task)

    return ModerationTaskDetailResponse(
        task=ModerationTaskResponse.model_validate(task),
        entity_summary=entity_summary,
    )


@router.post(
    "/tasks/{task_id}/approve",
    response_model=ApproveResponse,
    summary="Approve an organization moderation task",
)
async def approve_org_task(
    org_id: uuid.UUID,
    task_id: uuid.UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ApproveResponse:
    """Approve a moderation task within organization scope."""
    await require_org_moderator(org_id, user, db)

    task = await moderation_service.get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Moderation task not found",
        )

    if task.org_id != org_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Task does not belong to this organization",
        )

    if task.status != TaskStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Task already {task.status.value}",
        )

    updated_task = await moderation_service.approve_task(
        db=db,
        task=task,
        moderator_user_id=user.id,
    )

    return ApproveResponse(
        message="Task approved successfully",
        task=ModerationTaskResponse.model_validate(updated_task),
    )


@router.post(
    "/tasks/{task_id}/reject",
    response_model=RejectResponse,
    summary="Reject an organization moderation task",
)
async def reject_org_task(
    org_id: uuid.UUID,
    task_id: uuid.UUID,
    data: RejectRequest,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> RejectResponse:
    """Reject a moderation task within organization scope."""
    await require_org_moderator(org_id, user, db)

    task = await moderation_service.get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Moderation task not found",
        )

    if task.org_id != org_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Task does not belong to this organization",
        )

    if task.status != TaskStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Task already {task.status.value}",
        )

    updated_task = await moderation_service.reject_task(
        db=db,
        task=task,
        moderator_user_id=user.id,
        reason=data.reason,
    )

    return RejectResponse(
        message="Task rejected successfully",
        task=ModerationTaskResponse.model_validate(updated_task),
    )
