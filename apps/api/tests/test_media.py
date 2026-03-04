"""Tests for media endpoints."""

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
async def other_user(test_session: AsyncSession):
    """Create another test user."""
    user = User(
        id=uuid.uuid4(),
        email="otheruser@example.com",
        password_hash=hash_password("otherpassword123"),
        display_name="Other User",
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
def other_user_token(other_user: User) -> str:
    """Create access token for other user."""
    return create_access_token(data={"sub": str(other_user.id)})


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


class TestPresign:
    """Tests for presign endpoint."""

    async def test_presign_success(
        self,
        client: AsyncClient,
        user_token: str,
        test_page: MemorialPage,
        mock_storage,
    ):
        """Test successful presign request."""
        with patch("app.api.routes.media.get_storage", return_value=mock_storage):
            response = await client.post(
                "/api/media/presign",
                json={
                    "page_id": str(test_page.id),
                    "filename": "photo.jpg",
                    "mime_type": "image/jpeg",
                    "size_bytes": 1024 * 1024,
                    "type": "image",
                },
                headers={"Authorization": f"Bearer {user_token}"},
            )

        assert response.status_code == 200
        data = response.json()
        assert "upload_url" in data
        assert "object_key" in data
        assert "expires_in" in data

    async def test_presign_forbidden_for_non_owner(
        self,
        client: AsyncClient,
        other_user_token: str,
        test_page: MemorialPage,
        mock_storage,
    ):
        """Test presign fails for non-owner."""
        with patch("app.api.routes.media.get_storage", return_value=mock_storage):
            response = await client.post(
                "/api/media/presign",
                json={
                    "page_id": str(test_page.id),
                    "filename": "photo.jpg",
                    "mime_type": "image/jpeg",
                    "size_bytes": 1024 * 1024,
                    "type": "image",
                },
                headers={"Authorization": f"Bearer {other_user_token}"},
            )

        assert response.status_code == 403

    async def test_presign_invalid_mime_type(
        self,
        client: AsyncClient,
        user_token: str,
        test_page: MemorialPage,
        mock_storage,
    ):
        """Test presign fails for invalid mime type."""
        with patch("app.api.routes.media.get_storage", return_value=mock_storage):
            response = await client.post(
                "/api/media/presign",
                json={
                    "page_id": str(test_page.id),
                    "filename": "file.exe",
                    "mime_type": "application/x-executable",
                    "size_bytes": 1024,
                    "type": "image",
                },
                headers={"Authorization": f"Bearer {user_token}"},
            )

        assert response.status_code == 400
        assert "Invalid mime type" in response.json()["detail"]


class TestConfirm:
    """Tests for confirm endpoint."""

    async def test_confirm_success(
        self,
        client: AsyncClient,
        user_token: str,
        test_page: MemorialPage,
        mock_storage,
    ):
        """Test successful confirm."""
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
        assert data["page_id"] == str(test_page.id)
        assert data["mime_type"] == "image/jpeg"
        assert data["size_bytes"] == 1024 * 1024

    async def test_confirm_object_not_found(
        self,
        client: AsyncClient,
        user_token: str,
        test_page: MemorialPage,
        mock_storage,
    ):
        """Test confirm fails when object not in storage."""
        mock_storage.head_object.return_value = None

        with patch("app.api.routes.media.get_storage", return_value=mock_storage):
            response = await client.post(
                "/api/media/confirm",
                json={
                    "page_id": str(test_page.id),
                    "object_key": "nonexistent/key.jpg",
                },
                headers={"Authorization": f"Bearer {user_token}"},
            )

        assert response.status_code == 400
        assert "not found" in response.json()["detail"].lower()


class TestQuota:
    """Tests for quota enforcement."""

    async def test_presign_fails_when_quota_exceeded(
        self,
        client: AsyncClient,
        user_token: str,
        test_page: MemorialPage,
        test_session: AsyncSession,
        mock_storage,
    ):
        """Test presign fails when quota would be exceeded."""
        existing_media = Media(
            id=uuid.uuid4(),
            page_id=test_page.id,
            type=MediaType.IMAGE,
            object_key=f"pages/{test_page.id}/existing.jpg",
            mime_type="image/jpeg",
            size_bytes=99 * 1024 * 1024,
            uploaded_by_user_id=test_page.owner_user_id,
            moderation_status=ModerationStatus.PENDING,
            created_at=utc_now(),
        )
        test_session.add(existing_media)
        await test_session.commit()

        with patch("app.api.routes.media.get_storage", return_value=mock_storage):
            response = await client.post(
                "/api/media/presign",
                json={
                    "page_id": str(test_page.id),
                    "filename": "big_photo.jpg",
                    "mime_type": "image/jpeg",
                    "size_bytes": 5 * 1024 * 1024,
                    "type": "image",
                },
                headers={"Authorization": f"Bearer {user_token}"},
            )

        assert response.status_code == 400
        assert "quota" in response.json()["detail"].lower()


class TestListMedia:
    """Tests for list media endpoint."""

    async def test_list_page_media(
        self,
        client: AsyncClient,
        user_token: str,
        test_page: MemorialPage,
        test_session: AsyncSession,
    ):
        """Test listing media for a page."""
        media = Media(
            id=uuid.uuid4(),
            page_id=test_page.id,
            type=MediaType.IMAGE,
            object_key=f"pages/{test_page.id}/photo.jpg",
            original_url="https://example.com/photo.jpg",
            mime_type="image/jpeg",
            size_bytes=1024 * 1024,
            uploaded_by_user_id=test_page.owner_user_id,
            moderation_status=ModerationStatus.PENDING,
            created_at=utc_now(),
        )
        test_session.add(media)
        await test_session.commit()

        response = await client.get(
            f"/api/pages/{test_page.id}/media",
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert len(data["items"]) == 1


class TestDeleteMedia:
    """Tests for delete media endpoint."""

    async def test_delete_media_success(
        self,
        client: AsyncClient,
        user_token: str,
        test_page: MemorialPage,
        test_session: AsyncSession,
        mock_storage,
    ):
        """Test successful media deletion."""
        media = Media(
            id=uuid.uuid4(),
            page_id=test_page.id,
            type=MediaType.IMAGE,
            object_key=f"pages/{test_page.id}/photo.jpg",
            mime_type="image/jpeg",
            size_bytes=1024 * 1024,
            uploaded_by_user_id=test_page.owner_user_id,
            moderation_status=ModerationStatus.PENDING,
            created_at=utc_now(),
        )
        test_session.add(media)
        await test_session.commit()

        with patch("app.api.routes.media.get_storage", return_value=mock_storage):
            response = await client.delete(
                f"/api/media/{media.id}",
                headers={"Authorization": f"Bearer {user_token}"},
            )

        assert response.status_code == 200
        assert mock_storage.delete_object.called

    async def test_delete_media_forbidden_for_non_owner(
        self,
        client: AsyncClient,
        other_user_token: str,
        test_page: MemorialPage,
        test_session: AsyncSession,
        mock_storage,
    ):
        """Test delete fails for non-owner."""
        media = Media(
            id=uuid.uuid4(),
            page_id=test_page.id,
            type=MediaType.IMAGE,
            object_key=f"pages/{test_page.id}/photo.jpg",
            mime_type="image/jpeg",
            size_bytes=1024 * 1024,
            uploaded_by_user_id=test_page.owner_user_id,
            moderation_status=ModerationStatus.PENDING,
            created_at=utc_now(),
        )
        test_session.add(media)
        await test_session.commit()

        with patch("app.api.routes.media.get_storage", return_value=mock_storage):
            response = await client.delete(
                f"/api/media/{media.id}",
                headers={"Authorization": f"Bearer {other_user_token}"},
            )

        assert response.status_code == 403
