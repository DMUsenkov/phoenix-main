"""Tests for moderation endpoints."""

import uuid
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.auth.security import hash_password, create_access_token
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models import (
    User,
    UserRole,
    Person,
    MemorialPage,
    PageStatus,
    PageVisibility,
    LifeStatus,
    Gender,
    Media,
    MediaType,
    ModerationStatus,
    ModerationTask,
    EntityType,
    TaskStatus,
)
from app.storage.s3 import ObjectInfo


TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


def utc_now() -> datetime:
    """Get current UTC datetime."""
    return datetime.now(timezone.utc)


@pytest.fixture
async def test_engine():
    """Create test database engine."""
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest.fixture
async def test_session(test_engine):
    """Create test database session."""
    session_factory = async_sessionmaker(
        test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    async with session_factory() as session:
        yield session


@pytest.fixture
async def override_get_db(test_engine):
    """Override database dependency for tests."""
    session_factory = async_sessionmaker(
        test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    async def _get_db():
        async with session_factory() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise

    app.dependency_overrides[get_db] = _get_db
    yield
    app.dependency_overrides.clear()


@pytest.fixture
async def client(override_get_db):
    """Async test client with database override."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
async def test_user(test_session: AsyncSession):
    """Create a test user."""
    user = User(
        id=uuid.uuid4(),
        email="testuser@example.com",
        password_hash=hash_password("testpassword123"),
        display_name="Test User",
        role=UserRole.USER,
        is_active=True,
        created_at=utc_now(),
        updated_at=utc_now(),
    )
    test_session.add(user)
    await test_session.commit()
    await test_session.refresh(user)
    return user


@pytest.fixture
async def admin_user(test_session: AsyncSession):
    """Create an admin user."""
    user = User(
        id=uuid.uuid4(),
        email="admin@example.com",
        password_hash=hash_password("adminpassword123"),
        display_name="Admin User",
        role=UserRole.ADMIN,
        is_active=True,
        created_at=utc_now(),
        updated_at=utc_now(),
    )
    test_session.add(user)
    await test_session.commit()
    await test_session.refresh(user)
    return user


@pytest.fixture
def user_token(test_user: User) -> str:
    """Create access token for test user."""
    return create_access_token(data={"sub": str(test_user.id)})


@pytest.fixture
def admin_token(admin_user: User) -> str:
    """Create access token for admin user."""
    return create_access_token(data={"sub": str(admin_user.id)})


@pytest.fixture
async def test_page(test_session: AsyncSession, test_user: User):
    """Create a test page with person."""
    person = Person(
        id=uuid.uuid4(),
        full_name="John Doe",
        gender=Gender.MALE,
        life_status=LifeStatus.DECEASED,
        created_by_user_id=test_user.id,
        created_at=utc_now(),
        updated_at=utc_now(),
    )
    test_session.add(person)
    await test_session.flush()

    page = MemorialPage(
        id=uuid.uuid4(),
        person_id=person.id,
        slug="john-doe-abc123",
        title="John Doe Memorial",
        visibility=PageVisibility.PUBLIC,
        status=PageStatus.PUBLISHED,
        owner_user_id=test_user.id,
        created_by_user_id=test_user.id,
        created_at=utc_now(),
        updated_at=utc_now(),
    )
    test_session.add(page)
    await test_session.commit()
    await test_session.refresh(page)
    return page


@pytest.fixture
async def test_media_with_task(
    test_session: AsyncSession,
    test_page: MemorialPage,
    test_user: User,
):
    """Create test media with pending moderation task."""
    media = Media(
        id=uuid.uuid4(),
        page_id=test_page.id,
        type=MediaType.IMAGE,
        object_key=f"pages/{test_page.id}/photo.jpg",
        original_url="https://example.com/photo.jpg",
        mime_type="image/jpeg",
        size_bytes=1024 * 1024,
        uploaded_by_user_id=test_user.id,
        moderation_status=ModerationStatus.PENDING,
        created_at=utc_now(),
    )
    test_session.add(media)
    await test_session.flush()

    task = ModerationTask(
        id=uuid.uuid4(),
        entity_type=EntityType.MEDIA,
        entity_id=media.id,
        status=TaskStatus.PENDING,
        created_by_user_id=test_user.id,
        created_at=utc_now(),
    )
    test_session.add(task)
    await test_session.commit()
    await test_session.refresh(media)
    await test_session.refresh(task)
    return media, task


@pytest.fixture
def mock_storage():
    """Mock S3 storage."""
    storage = MagicMock()
    storage.generate_presigned_put_url.return_value = "https://s3.example.com/presigned-url"
    storage.head_object.return_value = ObjectInfo(
        size_bytes=1024 * 1024,
        content_type="image/jpeg",
        etag='"abc123"',
    )
    storage.get_public_url.return_value = "https://s3.example.com/public-url"
    storage.delete_object.return_value = True
    return storage


class TestConfirmCreatesTask:
    """Tests for moderation task creation on media confirm."""

    async def test_confirm_creates_moderation_task(
        self,
        client: AsyncClient,
        user_token: str,
        test_page: MemorialPage,
        test_session: AsyncSession,
        mock_storage,
    ):
        """Test that confirming upload creates a pending moderation task."""
        with patch("app.api.routes.media.get_storage", return_value=mock_storage):
            response = await client.post(
                "/api/media/confirm",
                json={
                    "page_id": str(test_page.id),
                    "object_key": f"pages/{test_page.id}/abc123_photo.jpg",
                },
                headers={"Authorization": f"Bearer {user_token}"},
            )

        assert response.status_code == 201
        data = response.json()
        media_id = data["id"]

        from sqlalchemy import select
        result = await test_session.execute(
            select(ModerationTask).where(
                ModerationTask.entity_type == EntityType.MEDIA,
                ModerationTask.entity_id == uuid.UUID(media_id),
            )
        )
        task = result.scalar_one_or_none()

        assert task is not None
        assert task.status == TaskStatus.PENDING
        assert task.entity_type == EntityType.MEDIA


class TestListTasks:
    """Tests for listing moderation tasks."""

    async def test_admin_can_list_tasks(
        self,
        client: AsyncClient,
        admin_token: str,
        test_media_with_task,
    ):
        """Test admin can list moderation tasks."""
        media, task = test_media_with_task

        response = await client.get(
            "/api/admin/moderation/tasks",
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1
        assert len(data["items"]) >= 1

    async def test_admin_can_filter_by_entity_type(
        self,
        client: AsyncClient,
        admin_token: str,
        test_media_with_task,
    ):
        """Test admin can filter tasks by entity type."""
        response = await client.get(
            "/api/admin/moderation/tasks?entity_type=media",
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        for item in data["items"]:
            assert item["entity_type"] == "media"

    async def test_admin_can_filter_by_status(
        self,
        client: AsyncClient,
        admin_token: str,
        test_media_with_task,
    ):
        """Test admin can filter tasks by status."""
        response = await client.get(
            "/api/admin/moderation/tasks?status=pending",
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        for item in data["items"]:
            assert item["status"] == "pending"

    async def test_non_admin_cannot_list_tasks(
        self,
        client: AsyncClient,
        user_token: str,
        test_media_with_task,
    ):
        """Test non-admin cannot list moderation tasks."""
        response = await client.get(
            "/api/admin/moderation/tasks",
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 403


class TestApproveTask:
    """Tests for approving moderation tasks."""

    async def test_admin_can_approve_task(
        self,
        client: AsyncClient,
        admin_token: str,
        admin_user: User,
        test_media_with_task,
    ):
        """Test admin can approve a moderation task."""
        media, task = test_media_with_task

        response = await client.post(
            f"/api/admin/moderation/tasks/{task.id}/approve",
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Task approved successfully"
        assert data["task"]["status"] == "approved"
        assert data["task"]["moderator_user_id"] == str(admin_user.id)

    async def test_non_admin_cannot_approve_task(
        self,
        client: AsyncClient,
        user_token: str,
        test_media_with_task,
    ):
        """Test non-admin cannot approve a moderation task."""
        media, task = test_media_with_task

        response = await client.post(
            f"/api/admin/moderation/tasks/{task.id}/approve",
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 403

    async def test_approve_nonexistent_task(
        self,
        client: AsyncClient,
        admin_token: str,
    ):
        """Test approving nonexistent task returns 404."""
        fake_id = uuid.uuid4()
        response = await client.post(
            f"/api/admin/moderation/tasks/{fake_id}/approve",
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        assert response.status_code == 404

    async def test_cannot_approve_already_approved_task(
        self,
        client: AsyncClient,
        admin_token: str,
        test_media_with_task,
    ):
        """Test cannot approve an already approved task."""
        media, task = test_media_with_task

        await client.post(
            f"/api/admin/moderation/tasks/{task.id}/approve",
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        response = await client.post(
            f"/api/admin/moderation/tasks/{task.id}/approve",
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        assert response.status_code == 400
        assert "already" in response.json()["detail"].lower()


class TestRejectTask:
    """Tests for rejecting moderation tasks."""

    async def test_admin_can_reject_task_with_reason(
        self,
        client: AsyncClient,
        admin_token: str,
        admin_user: User,
        test_media_with_task,
    ):
        """Test admin can reject a moderation task with reason."""
        media, task = test_media_with_task

        response = await client.post(
            f"/api/admin/moderation/tasks/{task.id}/reject",
            json={"reason": "Inappropriate content"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Task rejected successfully"
        assert data["task"]["status"] == "rejected"
        assert data["task"]["reason"] == "Inappropriate content"
        assert data["task"]["moderator_user_id"] == str(admin_user.id)

    async def test_reject_without_reason_fails(
        self,
        client: AsyncClient,
        admin_token: str,
        test_media_with_task,
    ):
        """Test reject without reason returns validation error."""
        media, task = test_media_with_task

        response = await client.post(
            f"/api/admin/moderation/tasks/{task.id}/reject",
            json={},
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        assert response.status_code == 422

    async def test_reject_with_empty_reason_fails(
        self,
        client: AsyncClient,
        admin_token: str,
        test_media_with_task,
    ):
        """Test reject with empty reason returns validation error."""
        media, task = test_media_with_task

        response = await client.post(
            f"/api/admin/moderation/tasks/{task.id}/reject",
            json={"reason": ""},
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        assert response.status_code == 422

    async def test_non_admin_cannot_reject_task(
        self,
        client: AsyncClient,
        user_token: str,
        test_media_with_task,
    ):
        """Test non-admin cannot reject a moderation task."""
        media, task = test_media_with_task

        response = await client.post(
            f"/api/admin/moderation/tasks/{task.id}/reject",
            json={"reason": "Some reason"},
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 403
