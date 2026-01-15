"""Service for Map API queries."""

import uuid
from dataclasses import dataclass

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models import (
    MemoryObject,
    MemorialPage,
    Person,
    Media,
    MediaType,
    ObjectType,
    ObjectStatus,
    ObjectVisibility,
    PageStatus,
    PageVisibility,
)
from app.models.media import ModerationStatus


@dataclass
class MapObjectResult:
    """Result object for map queries with joined data."""

    id: uuid.UUID
    type: ObjectType
    lat: float
    lng: float
    title: str | None
    page_slug: str
    life_status: str | None
    status: ObjectStatus
    visibility: ObjectVisibility


async def get_public_map_objects(
    db: AsyncSession,
    min_lat: float,
    min_lng: float,
    max_lat: float,
    max_lng: float,
    types: list[ObjectType] | None = None,
    limit: int = 300,
) -> list[MapObjectResult]:
    """
    Get published+public objects within bbox for public map.
    Joins with memorial_pages for slug and persons for life_status.
    """
    query = (
        select(
            MemoryObject.id,
            MemoryObject.type,
            MemoryObject.lat,
            MemoryObject.lng,
            MemoryObject.title,
            MemorialPage.slug.label("page_slug"),
            Person.life_status,
            MemoryObject.status,
            MemoryObject.visibility,
        )
        .join(MemorialPage, MemoryObject.page_id == MemorialPage.id)
        .join(Person, MemorialPage.person_id == Person.id)
        .where(
            and_(
                MemoryObject.status == ObjectStatus.PUBLISHED,
                MemoryObject.visibility == ObjectVisibility.PUBLIC,
                MemoryObject.lat >= min_lat,
                MemoryObject.lat <= max_lat,
                MemoryObject.lng >= min_lng,
                MemoryObject.lng <= max_lng,
            )
        )
    )

    if types:
        query = query.where(MemoryObject.type.in_(types))

    query = query.limit(limit)

    result = await db.execute(query)
    rows = result.all()

    return [
        MapObjectResult(
            id=row.id,
            type=row.type,
            lat=row.lat,
            lng=row.lng,
            title=row.title,
            page_slug=row.page_slug,
            life_status=row.life_status,
            status=row.status,
            visibility=row.visibility,
        )
        for row in rows
    ]


async def get_private_map_objects(
    db: AsyncSession,
    user_id: uuid.UUID,
    min_lat: float,
    min_lng: float,
    max_lat: float,
    max_lng: float,
    types: list[ObjectType] | None = None,
    status: ObjectStatus | None = None,
    visibility: ObjectVisibility | None = None,
    limit: int = 300,
    scope_all: bool = False,
) -> list[MapObjectResult]:
    """
    Get objects within bbox for private map (owner's objects).
    Admin with scope_all=True can see all objects.
    """
    query = (
        select(
            MemoryObject.id,
            MemoryObject.type,
            MemoryObject.lat,
            MemoryObject.lng,
            MemoryObject.title,
            MemorialPage.slug.label("page_slug"),
            Person.life_status,
            MemoryObject.status,
            MemoryObject.visibility,
        )
        .join(MemorialPage, MemoryObject.page_id == MemorialPage.id)
        .join(Person, MemorialPage.person_id == Person.id)
        .where(
            and_(
                MemoryObject.lat >= min_lat,
                MemoryObject.lat <= max_lat,
                MemoryObject.lng >= min_lng,
                MemoryObject.lng <= max_lng,
            )
        )
    )

    if not scope_all:
        query = query.where(MemoryObject.owner_user_id == user_id)

    if types:
        query = query.where(MemoryObject.type.in_(types))

    if status:
        query = query.where(MemoryObject.status == status)

    if visibility:
        query = query.where(MemoryObject.visibility == visibility)

    query = query.order_by(MemoryObject.created_at.desc())
    query = query.limit(limit)

    result = await db.execute(query)
    rows = result.all()

    return [
        MapObjectResult(
            id=row.id,
            type=row.type,
            lat=row.lat,
            lng=row.lng,
            title=row.title,
            page_slug=row.page_slug,
            life_status=row.life_status,
            status=row.status,
            visibility=row.visibility,
        )
        for row in rows
    ]


@dataclass
class BurialPointResult:
    """Result object for burial point queries."""

    page_slug: str
    full_name: str
    lat: float
    lng: float
    burial_place: str | None
    photo_url: str | None
    birth_date: str | None
    death_date: str | None


async def get_burial_points(
    db: AsyncSession,
    limit: int = 1000,
) -> list[BurialPointResult]:
    """
    Get all published public pages with burial coordinates.
    Returns burial points with person info and primary photo.
    """
    query = (
        select(
            MemorialPage.id.label("page_id"),
            MemorialPage.slug,
            Person.full_name,
            Person.burial_place_lat,
            Person.burial_place_lng,
            Person.burial_place,
            Person.birth_date,
            Person.death_date,
        )
        .join(Person, MemorialPage.person_id == Person.id)
        .where(
            and_(
                MemorialPage.status == PageStatus.PUBLISHED,
                MemorialPage.visibility == PageVisibility.PUBLIC,
                Person.burial_place_lat.isnot(None),
                Person.burial_place_lng.isnot(None),
            )
        )
        .limit(limit)
    )

    result = await db.execute(query)
    rows = result.all()

    results = []
    for row in rows:

        photo_query = (
            select(Media.original_url)
            .where(
                and_(
                    Media.page_id == row.page_id,
                    Media.type == MediaType.IMAGE,
                    Media.is_primary == True,
                    Media.moderation_status == ModerationStatus.APPROVED,
                )
            )
            .limit(1)
        )
        photo_result = await db.execute(photo_query)
        photo_url = photo_result.scalar_one_or_none()

        results.append(
            BurialPointResult(
                page_slug=row.slug,
                full_name=row.full_name,
                lat=row.burial_place_lat,
                lng=row.burial_place_lng,
                burial_place=row.burial_place,
                photo_url=photo_url,
                birth_date=str(row.birth_date) if row.birth_date else None,
                death_date=str(row.death_date) if row.death_date else None,
            )
        )

    return results
