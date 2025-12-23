"""Media API routes for Phoenix."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import require_active_user, ActiveUser
from app.db.session import get_db
from app.models import MemorialPage, UserRole
from app.storage import get_storage, S3Storage
from app.api.schemas.media import (
    PresignRequest,
    PresignResponse,
    ConfirmRequest,
    MediaResponse,
    MediaListResponse,
    QuotaResponse,
    PAGE_QUOTA_BYTES,
    ALLOWED_MIMES,
    MAX_FILE_SIZE_BYTES,
)
from app.api.schemas.page import MessageResponse
from app.services import media_service, page_service

router = APIRouter(prefix="/media", tags=["Media"])


async def get_page_with_access(
    db: AsyncSession,
    page_id: uuid.UUID,
    user: ActiveUser,
) -> MemorialPage:
    """Get page and verify user has access."""
    page = await page_service.get_page_by_id(db, page_id)
    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page not found",
        )


    if user.role == UserRole.ADMIN:
        return page


    if page.owner_user_id and page.owner_user_id == user.id:
        return page


    if page.owner_org_id:
        from app.services import org_service
        from app.models import OrgRole

        member = await org_service.get_member_by_user_id(db, page.owner_org_id, user.id)
        if member and member.role in [OrgRole.ORG_ADMIN, OrgRole.ORG_EDITOR]:
            return page

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Access denied",
    )


def get_storage_dep() -> S3Storage:
    """Dependency for storage."""
    return get_storage()


@router.post(
    "/presign",
    response_model=PresignResponse,
    summary="Get presigned URL for upload",
)
async def presign_upload(
    data: PresignRequest,
    user: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    storage: Annotated[S3Storage, Depends(get_storage_dep)],
) -> PresignResponse:
    """Get a presigned URL for uploading media to a page."""
    await get_page_with_access(db, data.page_id, user)

    try:
        upload_url, object_key, expires_in = await media_service.create_presign(
            db, storage, data, user.id
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    return PresignResponse(
        upload_url=upload_url,
        object_key=object_key,
        expires_in=expires_in,
    )


@router.post(
    "/confirm",
    response_model=MediaResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Confirm upload and create media record",
)
async def confirm_upload(
    data: ConfirmRequest,
    user: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    storage: Annotated[S3Storage, Depends(get_storage_dep)],
) -> MediaResponse:
    """Confirm upload after file has been uploaded to presigned URL."""
    await get_page_with_access(db, data.page_id, user)

    try:
        media = await media_service.confirm_upload(
            db, storage, data.page_id, data.object_key, user.id
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    return MediaResponse.model_validate(media)


@router.post(
    "/upload",
    response_model=MediaResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Direct file upload",
)
async def upload_file(
    file: Annotated[UploadFile, File()],
    page_id: Annotated[str, Form()],
    user: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    storage: Annotated[S3Storage, Depends(get_storage_dep)],
) -> MediaResponse:
    """Upload a file directly through the API."""
    page_uuid = uuid.UUID(page_id)
    await get_page_with_access(db, page_uuid, user)

    if file.content_type not in ALLOWED_MIMES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type: {file.content_type}. Allowed: {', '.join(ALLOWED_MIMES)}",
        )

    content = await file.read()
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE_BYTES // (1024*1024)} MB",
        )

    object_key = media_service.generate_object_key(page_uuid, file.filename or "upload")

    import io
    file_obj = io.BytesIO(content)
    success = storage.upload_fileobj(file_obj, object_key, file.content_type)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload file to storage",
        )

    try:
        media = await media_service.create_media_record(
            db, storage, page_uuid, object_key, file.content_type, len(content), user.id
        )
    except ValueError as e:
        storage.delete_object(object_key)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    return MediaResponse.model_validate(media)


@router.delete(
    "/{media_id}",
    response_model=MessageResponse,
    summary="Delete media",
)
async def delete_media(
    media_id: uuid.UUID,
    user: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    storage: Annotated[S3Storage, Depends(get_storage_dep)],
) -> MessageResponse:
    """Delete a media item."""
    media = await media_service.get_media_by_id(db, media_id)
    if not media:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media not found",
        )

    await get_page_with_access(db, media.page_id, user)
    await media_service.delete_media(db, storage, media)

    return MessageResponse(message="Media deleted successfully")


@router.post(
    "/{media_id}/set-primary",
    response_model=MediaResponse,
    summary="Set media as primary photo",
)
async def set_primary_media(
    media_id: uuid.UUID,
    user: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> MediaResponse:
    """Set a media item as the primary photo for its page."""
    media = await media_service.get_media_by_id(db, media_id)
    if not media:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media not found",
        )

    await get_page_with_access(db, media.page_id, user)

    updated_media = await media_service.set_primary_media(db, media)
    return MediaResponse.model_validate(updated_media)


pages_media_router = APIRouter(prefix="/pages", tags=["Pages"])


@pages_media_router.get(
    "/{page_id}/media",
    response_model=MediaListResponse,
    summary="List media for a page",
)
async def list_page_media(
    page_id: uuid.UUID,
    user: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> MediaListResponse:
    """Get all media for a page."""
    await get_page_with_access(db, page_id, user)

    media_list = await media_service.get_page_media(db, page_id)

    return MediaListResponse(
        items=[MediaResponse.model_validate(m) for m in media_list],
        total=len(media_list),
    )


@pages_media_router.get(
    "/{page_id}/media/quota",
    response_model=QuotaResponse,
    summary="Get media quota for a page",
)
async def get_page_quota(
    page_id: uuid.UUID,
    user: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> QuotaResponse:
    """Get media quota usage for a page."""
    await get_page_with_access(db, page_id, user)

    used = await media_service.get_page_media_usage(db, page_id)

    return QuotaResponse(
        used_bytes=used,
        limit_bytes=PAGE_QUOTA_BYTES,
        remaining_bytes=PAGE_QUOTA_BYTES - used,
    )
