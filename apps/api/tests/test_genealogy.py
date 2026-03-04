"""Tests for Genealogy module - family relationships, claims, graph API."""

import uuid
from datetime import datetime, timezone, timedelta

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    Person,
    User,
    UserRole,
    Gender,
    LifeStatus,
    FamilyRelationship,
    PersonClaimInvite,
    RelationType,
    RelationshipStatus,
    ClaimInviteStatus,
)
from app.services import relationship_service, claim_service, graph_service


@pytest.fixture
async def test_user(db: AsyncSession) -> User:
    """Create a test user."""
    user = User(
        id=uuid.uuid4(),
        email=f"test_{uuid.uuid4().hex[:8]}@example.com",
        password_hash="hashed",
        role=UserRole.USER,
        is_active=True,
    )
    db.add(user)
    await db.commit()
    return user


@pytest.fixture
async def other_user(db: AsyncSession) -> User:
    """Create another test user."""
    user = User(
        id=uuid.uuid4(),
        email=f"other_{uuid.uuid4().hex[:8]}@example.com",
        password_hash="hashed",
        role=UserRole.USER,
        is_active=True,
    )
    db.add(user)
    await db.commit()
    return user


@pytest.fixture
async def person_a(db: AsyncSession, test_user: User) -> Person:
    """Create person A (no linked user)."""
    person = Person(
        id=uuid.uuid4(),
        full_name="Person A",
        gender=Gender.MALE,
        life_status=LifeStatus.ALIVE,
        created_by_user_id=test_user.id,
    )
    db.add(person)
    await db.commit()
    return person


@pytest.fixture
async def person_b(db: AsyncSession, test_user: User) -> Person:
    """Create person B (no linked user)."""
    person = Person(
        id=uuid.uuid4(),
        full_name="Person B",
        gender=Gender.FEMALE,
        life_status=LifeStatus.ALIVE,
        created_by_user_id=test_user.id,
    )
    db.add(person)
    await db.commit()
    return person


@pytest.fixture
async def person_with_user(db: AsyncSession, other_user: User) -> Person:
    """Create person linked to other_user."""
    person = Person(
        id=uuid.uuid4(),
        full_name="Person With User",
        gender=Gender.MALE,
        life_status=LifeStatus.ALIVE,
        created_by_user_id=other_user.id,
        linked_user_id=other_user.id,
    )
    db.add(person)
    await db.commit()
    return person


class TestRelationshipCreation:
    """Tests for creating family relationships."""

    async def test_create_relationship_active_when_no_linked_user(
        self, db: AsyncSession, test_user: User, person_a: Person, person_b: Person
    ):
        """Relationship becomes active immediately if target has no linked user."""
        relationship = await relationship_service.create_relationship(
            db=db,
            from_person_id=person_a.id,
            to_person_id=person_b.id,
            relation_type=RelationType.MOTHER,
            requested_by_user_id=test_user.id,
        )
        await db.commit()

        assert relationship.status == RelationshipStatus.ACTIVE
        assert relationship.requested_to_user_id is None
        assert relationship.inverse_relationship_id is not None

    async def test_create_relationship_pending_when_target_has_linked_user(
        self, db: AsyncSession, test_user: User, person_a: Person, person_with_user: Person
    ):
        """Relationship is pending if target person has linked user."""
        relationship = await relationship_service.create_relationship(
            db=db,
            from_person_id=person_a.id,
            to_person_id=person_with_user.id,
            relation_type=RelationType.BROTHER,
            requested_by_user_id=test_user.id,
        )
        await db.commit()

        assert relationship.status == RelationshipStatus.PENDING
        assert relationship.requested_to_user_id == person_with_user.linked_user_id
        assert relationship.inverse_relationship_id is None

    async def test_inverse_relationship_created_on_active(
        self, db: AsyncSession, test_user: User, person_a: Person, person_b: Person
    ):
        """Inverse relationship is created when relationship becomes active."""
        relationship = await relationship_service.create_relationship(
            db=db,
            from_person_id=person_a.id,
            to_person_id=person_b.id,
            relation_type=RelationType.FATHER,
            requested_by_user_id=test_user.id,
        )
        await db.commit()

        inverse = await relationship_service.get_relationship_by_id(
            db, relationship.inverse_relationship_id
        )

        assert inverse is not None
        assert inverse.from_person_id == person_b.id
        assert inverse.to_person_id == person_a.id
        assert inverse.relation_type == RelationType.CHILD
        assert inverse.status == RelationshipStatus.ACTIVE


class TestRelationshipApproval:
    """Tests for approving/rejecting relationships."""

    async def test_approve_creates_inverse(
        self, db: AsyncSession, test_user: User, other_user: User,
        person_a: Person, person_with_user: Person
    ):
        """Approving a relationship creates inverse edge."""
        relationship = await relationship_service.create_relationship(
            db=db,
            from_person_id=person_a.id,
            to_person_id=person_with_user.id,
            relation_type=RelationType.SISTER,
            requested_by_user_id=test_user.id,
        )
        await db.commit()

        assert relationship.status == RelationshipStatus.PENDING

        approved = await relationship_service.approve_relationship(
            db=db,
            relationship=relationship,
            decided_by_user_id=other_user.id,
        )
        await db.commit()

        assert approved.status == RelationshipStatus.ACTIVE
        assert approved.decided_by_user_id == other_user.id
        assert approved.inverse_relationship_id is not None

        inverse = await relationship_service.get_relationship_by_id(
            db, approved.inverse_relationship_id
        )
        assert inverse is not None
        assert inverse.status == RelationshipStatus.ACTIVE

    async def test_reject_requires_reason(
        self, db: AsyncSession, test_user: User, other_user: User,
        person_a: Person, person_with_user: Person
    ):
        """Rejecting a relationship requires a reason."""
        relationship = await relationship_service.create_relationship(
            db=db,
            from_person_id=person_a.id,
            to_person_id=person_with_user.id,
            relation_type=RelationType.BROTHER,
            requested_by_user_id=test_user.id,
        )
        await db.commit()

        rejected = await relationship_service.reject_relationship(
            db=db,
            relationship=relationship,
            decided_by_user_id=other_user.id,
            reason="Not my relative",
        )
        await db.commit()

        assert rejected.status == RelationshipStatus.REJECTED
        assert rejected.reason == "Not my relative"
        assert rejected.inverse_relationship_id is None


class TestClaimInvites:
    """Tests for person claim invites."""

    async def test_create_claim_invite(
        self, db: AsyncSession, test_user: User, person_a: Person
    ):
        """Create a claim invite for a person."""
        invite = await claim_service.create_claim_invite(
            db=db,
            person_id=person_a.id,
            email="relative@example.com",
            created_by_user_id=test_user.id,
        )
        await db.commit()

        assert invite.status == ClaimInviteStatus.PENDING
        assert invite.email == "relative@example.com"
        assert invite.token is not None
        assert len(invite.token) > 20

    async def test_accept_claim_links_person(
        self, db: AsyncSession, test_user: User, other_user: User, person_a: Person
    ):
        """Accepting claim invite links person to user."""
        invite = await claim_service.create_claim_invite(
            db=db,
            person_id=person_a.id,
            email="relative@example.com",
            created_by_user_id=test_user.id,
        )
        await db.commit()

        accepted = await claim_service.accept_claim_invite(
            db=db,
            invite=invite,
            user_id=other_user.id,
        )
        await db.commit()

        assert accepted.status == ClaimInviteStatus.ACCEPTED
        assert accepted.accepted_by_user_id == other_user.id

        await db.refresh(person_a)
        assert person_a.linked_user_id == other_user.id

    async def test_cannot_accept_expired_invite(
        self, db: AsyncSession, test_user: User, other_user: User, person_a: Person
    ):
        """Cannot accept an expired invite."""
        invite = await claim_service.create_claim_invite(
            db=db,
            person_id=person_a.id,
            email="relative@example.com",
            created_by_user_id=test_user.id,
            expiry_days=-1,
        )
        await db.commit()

        with pytest.raises(ValueError, match="expired"):
            await claim_service.accept_claim_invite(
                db=db,
                invite=invite,
                user_id=other_user.id,
            )


class TestFamilyGraph:
    """Tests for family graph API."""

    async def test_graph_respects_depth_limit(
        self, db: AsyncSession, test_user: User
    ):
        """Graph respects depth limit."""
        persons = []
        for i in range(5):
            p = Person(
                id=uuid.uuid4(),
                full_name=f"Person {i}",
                gender=Gender.MALE,
                life_status=LifeStatus.ALIVE,
                created_by_user_id=test_user.id,
            )
            db.add(p)
            persons.append(p)
        await db.commit()

        for i in range(len(persons) - 1):
            await relationship_service.create_relationship(
                db=db,
                from_person_id=persons[i].id,
                to_person_id=persons[i + 1].id,
                relation_type=RelationType.CHILD,
                requested_by_user_id=test_user.id,
            )
        await db.commit()

        graph = await graph_service.get_family_graph(
            db=db,
            root_person_id=persons[0].id,
            depth=2,
        )

        assert len(graph.nodes) <= 3
        assert graph.depth == 2

    async def test_graph_excludes_pending_by_default(
        self, db: AsyncSession, test_user: User, person_a: Person, person_with_user: Person
    ):
        """Graph excludes pending relationships by default."""
        await relationship_service.create_relationship(
            db=db,
            from_person_id=person_a.id,
            to_person_id=person_with_user.id,
            relation_type=RelationType.BROTHER,
            requested_by_user_id=test_user.id,
        )
        await db.commit()

        graph = await graph_service.get_family_graph(
            db=db,
            root_person_id=person_a.id,
            depth=2,
            include_pending=False,
        )

        assert len(graph.nodes) == 1
        assert len(graph.edges) == 0

    async def test_graph_includes_pending_when_requested(
        self, db: AsyncSession, test_user: User, person_a: Person, person_with_user: Person
    ):
        """Graph includes pending relationships when requested."""
        await relationship_service.create_relationship(
            db=db,
            from_person_id=person_a.id,
            to_person_id=person_with_user.id,
            relation_type=RelationType.BROTHER,
            requested_by_user_id=test_user.id,
        )
        await db.commit()

        graph = await graph_service.get_family_graph(
            db=db,
            root_person_id=person_a.id,
            depth=2,
            include_pending=True,
        )

        assert len(graph.nodes) == 2
        assert len(graph.edges) == 1


class TestListPendingRequests:
    """Tests for listing pending relationship requests."""

    async def test_list_pending_for_user(
        self, db: AsyncSession, test_user: User, other_user: User,
        person_a: Person, person_with_user: Person
    ):
        """List pending requests for a user."""
        await relationship_service.create_relationship(
            db=db,
            from_person_id=person_a.id,
            to_person_id=person_with_user.id,
            relation_type=RelationType.FATHER,
            requested_by_user_id=test_user.id,
        )
        await db.commit()

        pending = await relationship_service.list_pending_requests(db, other_user.id)

        assert len(pending) == 1
        assert pending[0].from_person_id == person_a.id
        assert pending[0].to_person_id == person_with_user.id
