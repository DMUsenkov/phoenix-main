"""Service for Family Graph operations - BFS traversal."""

import uuid
from dataclasses import dataclass
from typing import Any

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    FamilyRelationship,
    RelationshipStatus,
    Person,
)


@dataclass
class GraphNode:
    """Node in family graph."""
    id: str
    full_name: str
    life_status: str
    gender: str
    page_slug: str | None
    linked_user_id: str | None


@dataclass
class GraphEdge:
    """Edge in family graph."""
    id: str
    from_person_id: str
    to_person_id: str
    relation_type: str


@dataclass
class FamilyGraph:
    """Family graph result."""
    root_person_id: str
    nodes: list[GraphNode]
    edges: list[GraphEdge]
    depth: int


MAX_DEPTH = 5
MAX_NODES = 200


async def get_family_graph(
    db: AsyncSession,
    root_person_id: uuid.UUID,
    depth: int = 3,
    include_pending: bool = False,
) -> FamilyGraph:
    """Get family graph using BFS traversal."""
    depth = min(depth, MAX_DEPTH)

    visited_persons: set[uuid.UUID] = set()
    nodes: list[GraphNode] = []
    edges: list[GraphEdge] = []

    current_layer: set[uuid.UUID] = {root_person_id}

    for current_depth in range(depth + 1):
        if not current_layer or len(visited_persons) >= MAX_NODES:
            break

        new_person_ids = current_layer - visited_persons
        if not new_person_ids:
            break

        persons = await fetch_persons(db, list(new_person_ids))
        for person in persons:
            if len(nodes) >= MAX_NODES:
                break
            if person.id in visited_persons:
                continue

            visited_persons.add(person.id)

            page_slug = None
            if person.memorial_page:
                page_slug = person.memorial_page.slug

            nodes.append(GraphNode(
                id=str(person.id),
                full_name=person.full_name,
                life_status=person.life_status.value,
                gender=person.gender.value,
                page_slug=page_slug,
                linked_user_id=str(person.linked_user_id) if person.linked_user_id else None,
            ))

        if current_depth < depth:
            relationships = await fetch_relationships(
                db,
                list(new_person_ids),
                include_pending=include_pending
            )

            next_layer: set[uuid.UUID] = set()

            for rel in relationships:
                if rel.from_person_id in visited_persons:
                    edges.append(GraphEdge(
                        id=str(rel.id),
                        from_person_id=str(rel.from_person_id),
                        to_person_id=str(rel.to_person_id),
                        relation_type=rel.relation_type.value,
                    ))

                    if rel.to_person_id not in visited_persons:
                        next_layer.add(rel.to_person_id)

            current_layer = next_layer

    return FamilyGraph(
        root_person_id=str(root_person_id),
        nodes=nodes,
        edges=edges,
        depth=depth,
    )


async def fetch_persons(
    db: AsyncSession,
    person_ids: list[uuid.UUID],
) -> list[Person]:
    """Fetch persons by IDs with memorial_page loaded."""
    from sqlalchemy.orm import selectinload

    if not person_ids:
        return []

    result = await db.execute(
        select(Person)
        .options(selectinload(Person.memorial_page))
        .where(Person.id.in_(person_ids))
    )
    return list(result.scalars().all())


async def fetch_relationships(
    db: AsyncSession,
    person_ids: list[uuid.UUID],
    include_pending: bool = False,
) -> list[FamilyRelationship]:
    """Fetch relationships where from_person_id is in the list."""
    if not person_ids:
        return []

    query = select(FamilyRelationship).where(
        FamilyRelationship.from_person_id.in_(person_ids)
    )

    if include_pending:
        query = query.where(
            FamilyRelationship.status.in_([
                RelationshipStatus.ACTIVE,
                RelationshipStatus.PENDING,
            ])
        )
    else:
        query = query.where(FamilyRelationship.status == RelationshipStatus.ACTIVE)

    result = await db.execute(query)
    return list(result.scalars().all())


async def get_family_graph_cte(
    db: AsyncSession,
    root_person_id: uuid.UUID,
    depth: int = 3,
    include_pending: bool = False,
) -> FamilyGraph:
    """Get family graph using recursive CTE (alternative implementation)."""
    depth = min(depth, MAX_DEPTH)

    status_filter = "('active')" if not include_pending else "('active', 'pending')"

    cte_query = text(f"""
        WITH RECURSIVE family_tree AS (
            SELECT
                p.id as person_id,
                0 as depth
            FROM persons p
            WHERE p.id = :root_id

            UNION

            SELECT
                fr.to_person_id as person_id,
                ft.depth + 1 as depth
            FROM family_tree ft
            JOIN family_relationships fr ON fr.from_person_id = ft.person_id
            WHERE ft.depth < :max_depth
              AND fr.status IN {status_filter}
        )
        SELECT DISTINCT person_id, MIN(depth) as depth
        FROM family_tree
        GROUP BY person_id
        LIMIT :max_nodes
    """)

    result = await db.execute(
        cte_query,
        {"root_id": str(root_person_id), "max_depth": depth, "max_nodes": MAX_NODES}
    )
    rows = result.fetchall()

    person_ids = [uuid.UUID(row[0]) for row in rows]

    if not person_ids:
        return FamilyGraph(
            root_person_id=str(root_person_id),
            nodes=[],
            edges=[],
            depth=depth,
        )

    persons = await fetch_persons(db, person_ids)
    relationships = await fetch_relationships(db, person_ids, include_pending)

    person_id_set = set(person_ids)

    nodes = [
        GraphNode(
            id=str(p.id),
            full_name=p.full_name,
            life_status=p.life_status.value,
            gender=p.gender.value,
            page_slug=p.memorial_page.slug if p.memorial_page else None,
            linked_user_id=str(p.linked_user_id) if p.linked_user_id else None,
        )
        for p in persons
    ]

    edges = [
        GraphEdge(
            id=str(r.id),
            from_person_id=str(r.from_person_id),
            to_person_id=str(r.to_person_id),
            relation_type=r.relation_type.value,
        )
        for r in relationships
        if r.from_person_id in person_id_set and r.to_person_id in person_id_set
    ]

    return FamilyGraph(
        root_person_id=str(root_person_id),
        nodes=nodes,
        edges=edges,
        depth=depth,
    )
