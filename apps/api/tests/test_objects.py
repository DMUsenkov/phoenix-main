"""Tests for memory objects endpoints."""

import uuid
from datetime import datetime, timezone

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
    MemoryObject,
    ObjectType,
    ObjectStatus,
    ObjectVisibility,
)


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
async def published_page(test_session: AsyncSession, test_user: User):
    """Create a published test page."""
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
async def draft_page(test_session: AsyncSession, test_user: User):
    """Create a draft test page."""
    person = Person(
        id=uuid.uuid4(),
        full_name="Jane Doe",
        gender=Gender.FEMALE,
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
        slug="jane-doe-xyz789",
        title="Jane Doe Memorial",
        visibility=PageVisibility.PUBLIC,
        status=PageStatus.DRAFT,
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
async def test_object(test_session: AsyncSession, published_page: MemorialPage, test_user: User):
    """Create a test memory object."""
    obj = MemoryObject(
        id=uuid.uuid4(),
        page_id=published_page.id,
        type=ObjectType.TREE,
        title="Memorial Tree",
        lat=55.7558,
        lng=37.6173,
        status=ObjectStatus.DRAFT,
        visibility=ObjectVisibility.PUBLIC,
        owner_user_id=test_user.id,
        created_by_user_id=test_user.id,
        created_at=utc_now(),
        updated_at=utc_now(),
    )
    test_session.add(obj)
    await test_session.commit()
    await test_session.refresh(obj)
    return obj


class TestCreateObject:
    """Tests for object creation."""

    async def test_create_object_success(
        self,
        client: AsyncClient,
        user_token: str,
        published_page: MemorialPage,
    ):
        """Test owner can create object for their page."""
        response = await client.post(
            "/api/objects",
            json={
                "page_id": str(published_page.id),
                "type": "tree",
                "lat": 55.7558,
                "lng": 37.6173,
                "title": "Memorial Tree",
            },
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 201
        data = response.json()
        assert data["page_id"] == str(published_page.id)
        assert data["type"] == "tree"
        assert data["lat"] == 55.7558
        assert data["lng"] == 37.6173
        assert data["status"] == "draft"

    async def test_create_object_forbidden_for_non_owner(
        self,
        client: AsyncClient,
        other_user_token: str,
        published_page: MemorialPage,
    ):
        """Test non-owner cannot create object for someone else's page."""
        response = await client.post(
            "/api/objects",
            json={
                "page_id": str(published_page.id),
                "type": "tree",
                "lat": 55.7558,
                "lng": 37.6173,
            },
            headers={"Authorization": f"Bearer {other_user_token}"},
        )

        assert response.status_code == 403

    async def test_admin_can_create_object_for_any_page(
        self,
        client: AsyncClient,
        admin_token: str,
        published_page: MemorialPage,
    ):
        """Test admin can create object for any page."""
        response = await client.post(
            "/api/objects",
            json={
                "page_id": str(published_page.id),
                "type": "plaque",
                "lat": 55.7558,
                "lng": 37.6173,
            },
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        assert response.status_code == 201

    async def test_create_object_page_not_found(
        self,
        client: AsyncClient,
        user_token: str,
    ):
        """Test creating object for nonexistent page."""
        response = await client.post(
            "/api/objects",
            json={
                "page_id": str(uuid.uuid4()),
                "type": "tree",
                "lat": 55.7558,
                "lng": 37.6173,
            },
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 404


class TestLatLngValidation:
    """Tests for lat/lng validation."""

    async def test_invalid_lat_too_high(
        self,
        client: AsyncClient,
        user_token: str,
        published_page: MemorialPage,
    ):
        """Test lat > 90 is rejected."""
        response = await client.post(
            "/api/objects",
            json={
                "page_id": str(published_page.id),
                "type": "tree",
                "lat": 91.0,
                "lng": 37.6173,
            },
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 422

    async def test_invalid_lat_too_low(
        self,
        client: AsyncClient,
        user_token: str,
        published_page: MemorialPage,
    ):
        """Test lat < -90 is rejected."""
        response = await client.post(
            "/api/objects",
            json={
                "page_id": str(published_page.id),
                "type": "tree",
                "lat": -91.0,
                "lng": 37.6173,
            },
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 422

    async def test_invalid_lng_too_high(
        self,
        client: AsyncClient,
        user_token: str,
        published_page: MemorialPage,
    ):
        """Test lng > 180 is rejected."""
        response = await client.post(
            "/api/objects",
            json={
                "page_id": str(published_page.id),
                "type": "tree",
                "lat": 55.7558,
                "lng": 181.0,
            },
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 422

    async def test_invalid_lng_too_low(
        self,
        client: AsyncClient,
        user_token: str,
        published_page: MemorialPage,
    ):
        """Test lng < -180 is rejected."""
        response = await client.post(
            "/api/objects",
            json={
                "page_id": str(published_page.id),
                "type": "tree",
                "lat": 55.7558,
                "lng": -181.0,
            },
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 422


class TestListObjects:
    """Tests for listing objects."""

    async def test_list_my_objects(
        self,
        client: AsyncClient,
        user_token: str,
        test_object: MemoryObject,
    ):
        """Test listing user's own objects."""
        response = await client.get(
            "/api/objects",
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1
        assert len(data["items"]) >= 1

    async def test_list_objects_with_status_filter(
        self,
        client: AsyncClient,
        user_token: str,
        test_object: MemoryObject,
    ):
        """Test filtering objects by status."""
        response = await client.get(
            "/api/objects?status=draft",
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        for item in data["items"]:
            assert item["status"] == "draft"


class TestGetObject:
    """Tests for getting single object."""

    async def test_get_own_object(
        self,
        client: AsyncClient,
        user_token: str,
        test_object: MemoryObject,
    ):
        """Test getting own object."""
        response = await client.get(
            f"/api/objects/{test_object.id}",
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(test_object.id)

    async def test_get_other_user_object_forbidden(
        self,
        client: AsyncClient,
        other_user_token: str,
        test_object: MemoryObject,
    ):
        """Test getting other user's object is forbidden."""
        response = await client.get(
            f"/api/objects/{test_object.id}",
            headers={"Authorization": f"Bearer {other_user_token}"},
        )

        assert response.status_code == 403


class TestUpdateObject:
    """Tests for updating objects."""

    async def test_update_own_object(
        self,
        client: AsyncClient,
        user_token: str,
        test_object: MemoryObject,
    ):
        """Test updating own object."""
        response = await client.patch(
            f"/api/objects/{test_object.id}",
            json={"title": "Updated Title", "lat": 56.0},
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Title"
        assert data["lat"] == 56.0

    async def test_update_other_user_object_forbidden(
        self,
        client: AsyncClient,
        other_user_token: str,
        test_object: MemoryObject,
    ):
        """Test updating other user's object is forbidden."""
        response = await client.patch(
            f"/api/objects/{test_object.id}",
            json={"title": "Hacked"},
            headers={"Authorization": f"Bearer {other_user_token}"},
        )

        assert response.status_code == 403


class TestDeleteObject:
    """Tests for deleting objects."""

    async def test_delete_own_object(
        self,
        client: AsyncClient,
        user_token: str,
        test_object: MemoryObject,
    ):
        """Test soft deleting own object."""
        response = await client.delete(
            f"/api/objects/{test_object.id}",
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 200
        assert "archived" in response.json()["message"].lower()


class TestPublishObject:
    """Tests for publishing objects."""

    async def test_publish_object_with_published_page(
        self,
        client: AsyncClient,
        user_token: str,
        test_object: MemoryObject,
    ):
        """Test publishing object when page is published."""
        response = await client.post(
            f"/api/objects/{test_object.id}/publish",
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "published"

    async def test_publish_object_with_draft_page_fails(
        self,
        client: AsyncClient,
        user_token: str,
        draft_page: MemorialPage,
        test_session: AsyncSession,
        test_user: User,
    ):
        """Test publishing object when page is draft returns 409."""
        obj = MemoryObject(
            id=uuid.uuid4(),
            page_id=draft_page.id,
            type=ObjectType.TREE,
            lat=55.7558,
            lng=37.6173,
            status=ObjectStatus.DRAFT,
            visibility=ObjectVisibility.PUBLIC,
            owner_user_id=test_user.id,
            created_by_user_id=test_user.id,
            created_at=utc_now(),
            updated_at=utc_now(),
        )
        test_session.add(obj)
        await test_session.commit()

        response = await client.post(
            f"/api/objects/{obj.id}/publish",
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 409
        assert "not published" in response.json()["detail"].lower()

    async def test_publish_already_published_object_fails(
        self,
        client: AsyncClient,
        user_token: str,
        test_object: MemoryObject,
    ):
        """Test publishing already published object returns 400."""
        await client.post(
            f"/api/objects/{test_object.id}/publish",
            headers={"Authorization": f"Bearer {user_token}"},
        )

        response = await client.post(
            f"/api/objects/{test_object.id}/publish",
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 400
        assert "already published" in response.json()["detail"].lower()
