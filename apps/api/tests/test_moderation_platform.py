"""Tests for unified moderation platform."""

import uuid
from datetime import datetime, timezone

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    ModerationTask,
    AuditEvent,
    EntityType,
    TaskStatus,
    MemorialPage,
    PageStatus,
    MemoryObject,
    ObjectStatus,
    ObjectType,
    ObjectVisibility,
    Person,
    LifeStatus,
    User,
    UserRole,
)
from app.services import moderation_service, page_service, memory_object_service


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
async def admin_user(db: AsyncSession) -> User:
    """Create an admin user."""
    user = User(
        id=uuid.uuid4(),
        email=f"admin_{uuid.uuid4().hex[:8]}@example.com",
        password_hash="hashed",
        role=UserRole.ADMIN,
        is_active=True,
    )
    db.add(user)
    await db.commit()
    return user


@pytest.fixture
async def test_person(db: AsyncSession, test_user: User) -> Person:
    """Create a test person."""
    person = Person(
        id=uuid.uuid4(),
        full_name="Test Person",
        life_status=LifeStatus.DECEASED,
        created_by_user_id=test_user.id,
    )
    db.add(person)
    await db.commit()
    return person


@pytest.fixture
async def test_page(db: AsyncSession, test_user: User, test_person: Person) -> MemorialPage:
    """Create a test memorial page."""
    page = MemorialPage(
        id=uuid.uuid4(),
        person_id=test_person.id,
        slug=f"test-page-{uuid.uuid4().hex[:8]}",
        title="Test Page",
        status=PageStatus.DRAFT,
        owner_user_id=test_user.id,
        created_by_user_id=test_user.id,
    )
    db.add(page)
    await db.commit()
    return page


@pytest.fixture
async def test_object(db: AsyncSession, test_user: User, test_page: MemorialPage) -> MemoryObject:
    """Create a test memory object."""
    obj = MemoryObject(
        id=uuid.uuid4(),
        page_id=test_page.id,
        type=ObjectType.TREE,
        lat=55.7558,
        lng=37.6173,
        status=ObjectStatus.DRAFT,
        visibility=ObjectVisibility.PUBLIC,
        owner_user_id=test_user.id,
        created_by_user_id=test_user.id,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(obj)
    await db.commit()
    return obj


class TestModerationTaskCreation:
    """Tests for moderation task creation."""

    async def test_create_task_for_page(self, db: AsyncSession, test_user: User):
        """Test creating moderation task for a page."""
        page_id = uuid.uuid4()

        task = await moderation_service.create_moderation_task(
            db=db,
            entity_type=EntityType.PAGE,
            entity_id=page_id,
            created_by_user_id=test_user.id,
        )
        await db.commit()

        assert task.id is not None
        assert task.entity_type == EntityType.PAGE
        assert task.entity_id == page_id
        assert task.status == TaskStatus.PENDING
        assert task.created_by_user_id == test_user.id

    async def test_create_task_with_org_id(self, db: AsyncSession, test_user: User):
        """Test creating moderation task with organization."""
        org_id = uuid.uuid4()
        entity_id = uuid.uuid4()

        task = await moderation_service.create_moderation_task(
            db=db,
            entity_type=EntityType.OBJECT,
            entity_id=entity_id,
            created_by_user_id=test_user.id,
            org_id=org_id,
            priority=5,
        )
        await db.commit()

        assert task.org_id == org_id
        assert task.priority == 5

    async def test_audit_event_created_on_task_creation(self, db: AsyncSession, test_user: User):
        """Test that audit event is created when task is created."""
        entity_id = uuid.uuid4()

        task = await moderation_service.create_moderation_task(
            db=db,
            entity_type=EntityType.PAGE,
            entity_id=entity_id,
            created_by_user_id=test_user.id,
        )
        await db.commit()

        result = await db.execute(
            select(AuditEvent).where(
                AuditEvent.event_type == "moderation.task_created",
                AuditEvent.entity_id == entity_id,
            )
        )
        audit_event = result.scalar_one_or_none()

        assert audit_event is not None
        assert audit_event.actor_user_id == test_user.id


class TestModerationApproval:
    """Tests for moderation approval."""

    async def test_approve_page_task(self, db: AsyncSession, test_page: MemorialPage, admin_user: User):
        """Test approving a page moderation task."""
        test_page.status = PageStatus.ON_MODERATION
        await db.commit()

        task = await moderation_service.create_moderation_task(
            db=db,
            entity_type=EntityType.PAGE,
            entity_id=test_page.id,
            created_by_user_id=test_page.created_by_user_id,
        )
        await db.commit()

        updated_task = await moderation_service.approve_task(
            db=db,
            task=task,
            moderator_user_id=admin_user.id,
        )
        await db.commit()

        assert updated_task.status == TaskStatus.APPROVED
        assert updated_task.moderator_user_id == admin_user.id
        assert updated_task.decided_at is not None

        await db.refresh(test_page)
        assert test_page.status == PageStatus.PUBLISHED

    async def test_approve_object_task(self, db: AsyncSession, test_object: MemoryObject, admin_user: User):
        """Test approving an object moderation task."""
        test_object.status = ObjectStatus.ON_MODERATION
        await db.commit()

        task = await moderation_service.create_moderation_task(
            db=db,
            entity_type=EntityType.OBJECT,
            entity_id=test_object.id,
            created_by_user_id=test_object.created_by_user_id,
        )
        await db.commit()

        updated_task = await moderation_service.approve_task(
            db=db,
            task=task,
            moderator_user_id=admin_user.id,
        )
        await db.commit()

        assert updated_task.status == TaskStatus.APPROVED

        await db.refresh(test_object)
        assert test_object.status == ObjectStatus.PUBLISHED


class TestModerationRejection:
    """Tests for moderation rejection."""

    async def test_reject_requires_reason(self, db: AsyncSession, test_page: MemorialPage, admin_user: User):
        """Test that rejection requires a reason."""
        task = await moderation_service.create_moderation_task(
            db=db,
            entity_type=EntityType.PAGE,
            entity_id=test_page.id,
        )
        await db.commit()

        updated_task = await moderation_service.reject_task(
            db=db,
            task=task,
            moderator_user_id=admin_user.id,
            reason="Content violates guidelines",
        )
        await db.commit()

        assert updated_task.status == TaskStatus.REJECTED
        assert updated_task.reason == "Content violates guidelines"

    async def test_reject_page_sets_rejected_status(self, db: AsyncSession, test_page: MemorialPage, admin_user: User):
        """Test that rejecting page task sets page status to rejected."""
        test_page.status = PageStatus.ON_MODERATION
        await db.commit()

        task = await moderation_service.create_moderation_task(
            db=db,
            entity_type=EntityType.PAGE,
            entity_id=test_page.id,
        )
        await db.commit()

        await moderation_service.reject_task(
            db=db,
            task=task,
            moderator_user_id=admin_user.id,
            reason="Inappropriate content",
        )
        await db.commit()

        await db.refresh(test_page)
        assert test_page.status == PageStatus.REJECTED


class TestPublishWithModeration:
    """Tests for publish flow with moderation."""

    async def test_publish_page_creates_moderation_task(self, db: AsyncSession, test_page: MemorialPage):
        """Test that publishing a page creates a moderation task."""
        await page_service.publish_page(db, test_page, require_moderation=True)
        await db.commit()

        assert test_page.status == PageStatus.ON_MODERATION

        task = await moderation_service.get_task_for_entity(
            db=db,
            entity_type=EntityType.PAGE,
            entity_id=test_page.id,
        )

        assert task is not None
        assert task.status == TaskStatus.PENDING

    async def test_publish_object_creates_moderation_task(self, db: AsyncSession, test_object: MemoryObject):
        """Test that publishing an object creates a moderation task."""
        await memory_object_service.publish_object(db, test_object, require_moderation=True)
        await db.commit()

        assert test_object.status == ObjectStatus.ON_MODERATION

        task = await moderation_service.get_task_for_entity(
            db=db,
            entity_type=EntityType.OBJECT,
            entity_id=test_object.id,
        )

        assert task is not None
        assert task.status == TaskStatus.PENDING

    async def test_publish_without_moderation(self, db: AsyncSession, test_page: MemorialPage):
        """Test publishing without moderation requirement."""
        await page_service.publish_page(db, test_page, require_moderation=False)
        await db.commit()

        assert test_page.status == PageStatus.PUBLISHED
        assert test_page.published_at is not None


class TestListTasks:
    """Tests for listing moderation tasks."""

    async def test_list_tasks_with_filters(self, db: AsyncSession, test_user: User):
        """Test listing tasks with various filters."""
        for i in range(3):
            await moderation_service.create_moderation_task(
                db=db,
                entity_type=EntityType.PAGE,
                entity_id=uuid.uuid4(),
                created_by_user_id=test_user.id,
            )

        for i in range(2):
            await moderation_service.create_moderation_task(
                db=db,
                entity_type=EntityType.OBJECT,
                entity_id=uuid.uuid4(),
                created_by_user_id=test_user.id,
            )
        await db.commit()

        page_tasks, page_total = await moderation_service.list_tasks(
            db=db,
            entity_type=EntityType.PAGE,
        )
        assert page_total >= 3

        pending_tasks, pending_total = await moderation_service.list_tasks(
            db=db,
            status=TaskStatus.PENDING,
        )
        assert pending_total >= 5

    async def test_list_tasks_by_org(self, db: AsyncSession, test_user: User):
        """Test listing tasks filtered by organization."""
        org_id = uuid.uuid4()

        await moderation_service.create_moderation_task(
            db=db,
            entity_type=EntityType.PAGE,
            entity_id=uuid.uuid4(),
            org_id=org_id,
        )
        await moderation_service.create_moderation_task(
            db=db,
            entity_type=EntityType.PAGE,
            entity_id=uuid.uuid4(),
            org_id=None,
        )
        await db.commit()

        org_tasks, org_total = await moderation_service.list_tasks(
            db=db,
            org_id=org_id,
        )
        assert org_total >= 1
        for task in org_tasks:
            assert task.org_id == org_id


class TestEntitySummary:
    """Tests for entity summary retrieval."""

    async def test_get_page_summary(self, db: AsyncSession, test_page: MemorialPage):
        """Test getting page entity summary."""
        task = await moderation_service.create_moderation_task(
            db=db,
            entity_type=EntityType.PAGE,
            entity_id=test_page.id,
        )
        await db.commit()

        summary = await moderation_service.get_entity_summary(db, task)

        assert summary["entity_type"] == "page"
        assert summary["slug"] == test_page.slug
        assert summary["status"] == test_page.status.value

    async def test_get_object_summary(self, db: AsyncSession, test_object: MemoryObject):
        """Test getting object entity summary."""
        task = await moderation_service.create_moderation_task(
            db=db,
            entity_type=EntityType.OBJECT,
            entity_id=test_object.id,
        )
        await db.commit()

        summary = await moderation_service.get_entity_summary(db, task)

        assert summary["entity_type"] == "object"
        assert summary["object_type"] == test_object.type.value
        assert summary["lat"] == test_object.lat
        assert summary["lng"] == test_object.lng
