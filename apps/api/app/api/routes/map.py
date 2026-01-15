"""Map API routes for Phoenix."""

from typing import Annotated

from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import require_active_user, ActiveUser
from app.db.session import get_db
from app.models import UserRole, ObjectType, ObjectStatus, ObjectVisibility
from app.services import map_service
from app.api.schemas.map import (
    MapObjectDTO,
    PrivateMapObjectDTO,
    MapObjectsResponse,
    PrivateMapObjectsResponse,
    BurialPointDTO,
    BurialPointsResponse,
    MAX_BBOX_SIZE_LAT,
    MAX_BBOX_SIZE_LNG,
    DEFAULT_LIMIT,
    MAX_LIMIT,
)


public_router = APIRouter(prefix="/public/map", tags=["Public Map"])
private_router = APIRouter(prefix="/map", tags=["Map"])


def validate_bbox(
    min_lat: float,
    min_lng: float,
    max_lat: float,
    max_lng: float,
) -> None:
    """Validate bbox parameters."""
    if min_lat >= max_lat:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="minLat must be less than maxLat",
        )
    if min_lng >= max_lng:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="minLng must be less than maxLng",
        )

    lat_size = max_lat - min_lat
    lng_size = max_lng - min_lng

    if lat_size > MAX_BBOX_SIZE_LAT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"BBox latitude range too large: {lat_size:.2f} > {MAX_BBOX_SIZE_LAT}",
        )
    if lng_size > MAX_BBOX_SIZE_LNG:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"BBox longitude range too large: {lng_size:.2f} > {MAX_BBOX_SIZE_LNG}",
        )


def parse_types(types: str | None) -> list[ObjectType] | None:
    """Parse comma-separated types string into list."""
    if not types:
        return None
    try:
        return [ObjectType(t.strip()) for t in types.split(",")]
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid type value: {e}",
        )


@public_router.get(
    "/burials",
    response_model=BurialPointsResponse,
    summary="Get burial points for map",
)
async def get_burial_points(
    db: Annotated[AsyncSession, Depends(get_db)],
    limit: int = Query(1000, ge=1, le=5000),
) -> BurialPointsResponse:
    """
    Get all published public memorial pages with burial coordinates.
    Returns burial points with person info and primary photo for map display.
    """
    results = await map_service.get_burial_points(db=db, limit=limit)

    items = [
        BurialPointDTO(
            page_slug=r.page_slug,
            full_name=r.full_name,
            lat=r.lat,
            lng=r.lng,
            burial_place=r.burial_place,
            photo_url=r.photo_url,
            birth_date=r.birth_date,
            death_date=r.death_date,
        )
        for r in results
    ]

    return BurialPointsResponse(items=items, total=len(items))


@public_router.get(
    "/objects",
    response_model=MapObjectsResponse,
    summary="Get public map objects",
)
async def get_public_map_objects(
    db: Annotated[AsyncSession, Depends(get_db)],
    min_lat: float = Query(..., alias="minLat", ge=-90, le=90),
    min_lng: float = Query(..., alias="minLng", ge=-180, le=180),
    max_lat: float = Query(..., alias="maxLat", ge=-90, le=90),
    max_lng: float = Query(..., alias="maxLng", ge=-180, le=180),
    types: str | None = Query(None, description="Comma-separated types: tree,plaque,place"),
    limit: int = Query(DEFAULT_LIMIT, ge=1, le=MAX_LIMIT),
) -> MapObjectsResponse:
    """
    Get published+public memory objects within bounding box.
    For public map display.
    """
    validate_bbox(min_lat, min_lng, max_lat, max_lng)
    parsed_types = parse_types(types)

    results = await map_service.get_public_map_objects(
        db=db,
        min_lat=min_lat,
        min_lng=min_lng,
        max_lat=max_lat,
        max_lng=max_lng,
        types=parsed_types,
        limit=limit,
    )

    items = [
        MapObjectDTO(
            id=r.id,
            type=r.type,
            lat=r.lat,
            lng=r.lng,
            title=r.title,
            page_slug=r.page_slug,
            life_status=r.life_status,
        )
        for r in results
    ]

    return MapObjectsResponse(
        items=items,
        total=len(items),
        limit=limit,
    )


@private_router.get(
    "/objects",
    response_model=PrivateMapObjectsResponse,
    summary="Get private map objects",
)
async def get_private_map_objects(
    user: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    min_lat: float = Query(..., alias="minLat", ge=-90, le=90),
    min_lng: float = Query(..., alias="minLng", ge=-180, le=180),
    max_lat: float = Query(..., alias="maxLat", ge=-90, le=90),
    max_lng: float = Query(..., alias="maxLng", ge=-180, le=180),
    types: str | None = Query(None, description="Comma-separated types: tree,plaque,place"),
    object_status: ObjectStatus | None = Query(None, alias="status"),
    visibility: ObjectVisibility | None = Query(None),
    limit: int = Query(DEFAULT_LIMIT, ge=1, le=MAX_LIMIT),
    scope: str | None = Query(None, description="'all' for admin to see all objects"),
) -> PrivateMapObjectsResponse:
    """
    Get memory objects within bounding box for authenticated user.
    Owner sees only their objects. Admin with scope=all sees all.
    """
    validate_bbox(min_lat, min_lng, max_lat, max_lng)
    parsed_types = parse_types(types)

    scope_all = scope == "all" and user.role == UserRole.ADMIN

    results = await map_service.get_private_map_objects(
        db=db,
        user_id=user.id,
        min_lat=min_lat,
        min_lng=min_lng,
        max_lat=max_lat,
        max_lng=max_lng,
        types=parsed_types,
        status=object_status,
        visibility=visibility,
        limit=limit,
        scope_all=scope_all,
    )

    items = [
        PrivateMapObjectDTO(
            id=r.id,
            type=r.type,
            lat=r.lat,
            lng=r.lng,
            title=r.title,
            page_slug=r.page_slug,
            life_status=r.life_status,
            status=r.status,
            visibility=r.visibility,
        )
        for r in results
    ]

    return PrivateMapObjectsResponse(
        items=items,
        total=len(items),
        limit=limit,
    )
