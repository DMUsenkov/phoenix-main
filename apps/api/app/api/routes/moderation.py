"""Admin moderation routes for Phoenix API."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import require_role
from app.db.session import get_db
from app.models import User, UserRole, EntityType, TaskStatus
from app.services import moderation_service
from app.api.schemas.moderation import (
    ModerationTaskResponse,
    ModerationTaskDetailResponse,
    ModerationTaskListResponse,
    RejectRequest,
    ApproveResponse,
    RejectResponse,
)

router = APIRouter(prefix="/admin/moderation", tags=["Admin Moderation"])


AdminUser = Annotated[User, Depends(require_role([UserRole.ADMIN]))]


@router.get(
    "/tasks",
    response_model=ModerationTaskListResponse,
    summary="List moderation tasks",
)
async def list_moderation_tasks(
    admin: AdminUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    entity_type: EntityType | None = Query(None, description="Filter by entity type"),
    task_status: TaskStatus | None = Query(None, alias="status", description="Filter by status"),
    org_id: uuid.UUID | None = Query(None, description="Filter by organization"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
) -> ModerationTaskListResponse:
    """List moderation tasks with optional filters."""
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
    summary="Get moderation task details",
)
async def get_moderation_task(
    task_id: uuid.UUID,
    admin: AdminUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ModerationTaskDetailResponse:
    """Get moderation task details with entity summary."""
    task = await moderation_service.get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Moderation task not found",
        )

    entity_summary = await moderation_service.get_entity_summary(db, task)

    return ModerationTaskDetailResponse(
        task=ModerationTaskResponse.model_validate(task),
        entity_summary=entity_summary,
    )


@router.post(
    "/tasks/{task_id}/approve",
    response_model=ApproveResponse,
    summary="Approve a moderation task",
)
async def approve_task(
    task_id: uuid.UUID,
    admin: AdminUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ApproveResponse:
    """Approve a moderation task. Updates the related entity status."""
    task = await moderation_service.get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Moderation task not found",
        )

    if task.status != TaskStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Task already {task.status.value}",
        )

    updated_task = await moderation_service.approve_task(
        db=db,
        task=task,
        moderator_user_id=admin.id,
    )

    return ApproveResponse(
        message="Task approved successfully",
        task=ModerationTaskResponse.model_validate(updated_task),
    )


@router.post(
    "/tasks/{task_id}/reject",
    response_model=RejectResponse,
    summary="Reject a moderation task",
)
async def reject_task(
    task_id: uuid.UUID,
    data: RejectRequest,
    admin: AdminUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> RejectResponse:
    """Reject a moderation task with a reason. Updates the related entity status."""
    task = await moderation_service.get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Moderation task not found",
        )

    if task.status != TaskStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Task already {task.status.value}",
        )

    updated_task = await moderation_service.reject_task(
        db=db,
        task=task,
        moderator_user_id=admin.id,
        reason=data.reason,
    )

    return RejectResponse(
        message="Task rejected successfully",
        task=ModerationTaskResponse.model_validate(updated_task),
    )
