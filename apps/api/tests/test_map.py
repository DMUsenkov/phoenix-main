"""Tests for map API endpoints."""

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
async def other_user_page(test_session: AsyncSession, other_user: User):
    """Create a published page for other user."""
    person = Person(
        id=uuid.uuid4(),
        full_name="Jane Smith",
        gender=Gender.FEMALE,
        life_status=LifeStatus.ALIVE,
        created_by_user_id=other_user.id,
        created_at=utc_now(),
        updated_at=utc_now(),
    )
    test_session.add(person)
    await test_session.flush()

    page = MemorialPage(
        id=uuid.uuid4(),
        person_id=person.id,
        slug="jane-smith-xyz789",
        title="Jane Smith Memorial",
        visibility=PageVisibility.PUBLIC,
        status=PageStatus.PUBLISHED,
        owner_user_id=other_user.id,
        created_by_user_id=other_user.id,
        created_at=utc_now(),
        updated_at=utc_now(),
    )
    test_session.add(page)
    await test_session.commit()
    await test_session.refresh(page)
    return page


@pytest.fixture
async def published_public_object(
    test_session: AsyncSession,
    published_page: MemorialPage,
    test_user: User,
):
    """Create a published+public object."""
    obj = MemoryObject(
        id=uuid.uuid4(),
        page_id=published_page.id,
        type=ObjectType.TREE,
        title="Public Tree",
        lat=55.7558,
        lng=37.6173,
        status=ObjectStatus.PUBLISHED,
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


@pytest.fixture
async def draft_object(
    test_session: AsyncSession,
    published_page: MemorialPage,
    test_user: User,
):
    """Create a draft object (not visible on public map)."""
    obj = MemoryObject(
        id=uuid.uuid4(),
        page_id=published_page.id,
        type=ObjectType.PLAQUE,
        title="Draft Plaque",
        lat=55.7600,
        lng=37.6200,
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


@pytest.fixture
async def private_object(
    test_session: AsyncSession,
    published_page: MemorialPage,
    test_user: User,
):
    """Create a published but private object (not visible on public map)."""
    obj = MemoryObject(
        id=uuid.uuid4(),
        page_id=published_page.id,
        type=ObjectType.PLACE,
        title="Private Place",
        lat=55.7650,
        lng=37.6250,
        status=ObjectStatus.PUBLISHED,
        visibility=ObjectVisibility.PRIVATE,
        owner_user_id=test_user.id,
        created_by_user_id=test_user.id,
        created_at=utc_now(),
        updated_at=utc_now(),
    )
    test_session.add(obj)
    await test_session.commit()
    await test_session.refresh(obj)
    return obj


@pytest.fixture
async def other_user_object(
    test_session: AsyncSession,
    other_user_page: MemorialPage,
    other_user: User,
):
    """Create a published+public object for other user."""
    obj = MemoryObject(
        id=uuid.uuid4(),
        page_id=other_user_page.id,
        type=ObjectType.TREE,
        title="Other User Tree",
        lat=55.7700,
        lng=37.6300,
        status=ObjectStatus.PUBLISHED,
        visibility=ObjectVisibility.PUBLIC,
        owner_user_id=other_user.id,
        created_by_user_id=other_user.id,
        created_at=utc_now(),
        updated_at=utc_now(),
    )
    test_session.add(obj)
    await test_session.commit()
    await test_session.refresh(obj)
    return obj


class TestPublicMapObjects:
    """Tests for public map endpoint."""

    async def test_public_map_returns_published_public_only(
        self,
        client: AsyncClient,
        published_public_object: MemoryObject,
        draft_object: MemoryObject,
        private_object: MemoryObject,
    ):
        """Test public map returns only published+public objects."""
        response = await client.get(
            "/api/public/map/objects",
            params={
                "minLat": 55.0,
                "minLng": 37.0,
                "maxLat": 56.0,
                "maxLng": 38.0,
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert len(data["items"]) == 1
        assert data["items"][0]["id"] == str(published_public_object.id)

    async def test_public_map_returns_page_slug(
        self,
        client: AsyncClient,
        published_public_object: MemoryObject,
        published_page: MemorialPage,
    ):
        """Test public map returns page_slug for navigation."""
        response = await client.get(
            "/api/public/map/objects",
            params={
                "minLat": 55.0,
                "minLng": 37.0,
                "maxLat": 56.0,
                "maxLng": 38.0,
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["items"][0]["page_slug"] == published_page.slug

    async def test_public_map_filter_by_type(
        self,
        client: AsyncClient,
        published_public_object: MemoryObject,
        other_user_object: MemoryObject,
    ):
        """Test filtering by object type."""
        response = await client.get(
            "/api/public/map/objects",
            params={
                "minLat": 55.0,
                "minLng": 37.0,
                "maxLat": 56.0,
                "maxLng": 38.0,
                "types": "tree",
            },
        )

        assert response.status_code == 200
        data = response.json()
        for item in data["items"]:
            assert item["type"] == "tree"

    async def test_public_map_respects_bbox(
        self,
        client: AsyncClient,
        published_public_object: MemoryObject,
    ):
        """Test objects outside bbox are not returned."""
        response = await client.get(
            "/api/public/map/objects",
            params={
                "minLat": 40.0,
                "minLng": 30.0,
                "maxLat": 41.0,
                "maxLng": 31.0,
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0


class TestBBoxValidation:
    """Tests for bbox validation."""

    async def test_invalid_bbox_min_greater_than_max_lat(
        self,
        client: AsyncClient,
    ):
        """Test minLat >= maxLat is rejected."""
        response = await client.get(
            "/api/public/map/objects",
            params={
                "minLat": 56.0,
                "minLng": 37.0,
                "maxLat": 55.0,
                "maxLng": 38.0,
            },
        )

        assert response.status_code == 400
        assert "minlat" in response.json()["detail"].lower()

    async def test_invalid_bbox_min_greater_than_max_lng(
        self,
        client: AsyncClient,
    ):
        """Test minLng >= maxLng is rejected."""
        response = await client.get(
            "/api/public/map/objects",
            params={
                "minLat": 55.0,
                "minLng": 38.0,
                "maxLat": 56.0,
                "maxLng": 37.0,
            },
        )

        assert response.status_code == 400
        assert "minlng" in response.json()["detail"].lower()

    async def test_bbox_too_large_lat(
        self,
        client: AsyncClient,
    ):
        """Test bbox latitude range > 10 degrees is rejected."""
        response = await client.get(
            "/api/public/map/objects",
            params={
                "minLat": 40.0,
                "minLng": 37.0,
                "maxLat": 55.0,
                "maxLng": 38.0,
            },
        )

        assert response.status_code == 400
        assert "too large" in response.json()["detail"].lower()

    async def test_bbox_too_large_lng(
        self,
        client: AsyncClient,
    ):
        """Test bbox longitude range > 10 degrees is rejected."""
        response = await client.get(
            "/api/public/map/objects",
            params={
                "minLat": 55.0,
                "minLng": 30.0,
                "maxLat": 56.0,
                "maxLng": 45.0,
            },
        )

        assert response.status_code == 400
        assert "too large" in response.json()["detail"].lower()


class TestLimitEnforcement:
    """Tests for limit enforcement."""

    async def test_limit_is_respected(
        self,
        client: AsyncClient,
        published_public_object: MemoryObject,
        other_user_object: MemoryObject,
    ):
        """Test limit parameter is respected."""
        response = await client.get(
            "/api/public/map/objects",
            params={
                "minLat": 55.0,
                "minLng": 37.0,
                "maxLat": 56.0,
                "maxLng": 38.0,
                "limit": 1,
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) <= 1
        assert data["limit"] == 1

    async def test_limit_max_enforced(
        self,
        client: AsyncClient,
    ):
        """Test limit > 1000 is rejected."""
        response = await client.get(
            "/api/public/map/objects",
            params={
                "minLat": 55.0,
                "minLng": 37.0,
                "maxLat": 56.0,
                "maxLng": 38.0,
                "limit": 1001,
            },
        )

        assert response.status_code == 422


class TestPrivateMapObjects:
    """Tests for private map endpoint."""

    async def test_private_map_requires_auth(
        self,
        client: AsyncClient,
    ):
        """Test private map requires authentication."""
        response = await client.get(
            "/api/map/objects",
            params={
                "minLat": 55.0,
                "minLng": 37.0,
                "maxLat": 56.0,
                "maxLng": 38.0,
            },
        )

        assert response.status_code == 401

    async def test_private_map_returns_only_own_objects(
        self,
        client: AsyncClient,
        user_token: str,
        published_public_object: MemoryObject,
        draft_object: MemoryObject,
        other_user_object: MemoryObject,
    ):
        """Test owner sees only their own objects."""
        response = await client.get(
            "/api/map/objects",
            params={
                "minLat": 55.0,
                "minLng": 37.0,
                "maxLat": 56.0,
                "maxLng": 38.0,
            },
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 2
        ids = [item["id"] for item in data["items"]]
        assert str(published_public_object.id) in ids
        assert str(draft_object.id) in ids
        assert str(other_user_object.id) not in ids

    async def test_private_map_includes_status_visibility(
        self,
        client: AsyncClient,
        user_token: str,
        draft_object: MemoryObject,
    ):
        """Test private map includes status and visibility fields."""
        response = await client.get(
            "/api/map/objects",
            params={
                "minLat": 55.0,
                "minLng": 37.0,
                "maxLat": 56.0,
                "maxLng": 38.0,
            },
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        for item in data["items"]:
            assert "status" in item
            assert "visibility" in item

    async def test_admin_scope_all_sees_all_objects(
        self,
        client: AsyncClient,
        admin_token: str,
        published_public_object: MemoryObject,
        other_user_object: MemoryObject,
    ):
        """Test admin with scope=all sees all objects."""
        response = await client.get(
            "/api/map/objects",
            params={
                "minLat": 55.0,
                "minLng": 37.0,
                "maxLat": 56.0,
                "maxLng": 38.0,
                "scope": "all",
            },
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        ids = [item["id"] for item in data["items"]]
        assert str(published_public_object.id) in ids
        assert str(other_user_object.id) in ids

    async def test_non_admin_scope_all_ignored(
        self,
        client: AsyncClient,
        user_token: str,
        published_public_object: MemoryObject,
        other_user_object: MemoryObject,
    ):
        """Test non-admin with scope=all still sees only own objects."""
        response = await client.get(
            "/api/map/objects",
            params={
                "minLat": 55.0,
                "minLng": 37.0,
                "maxLat": 56.0,
                "maxLng": 38.0,
                "scope": "all",
            },
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        ids = [item["id"] for item in data["items"]]
        assert str(published_public_object.id) in ids
        assert str(other_user_object.id) not in ids
