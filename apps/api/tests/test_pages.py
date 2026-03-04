"""Tests for pages endpoints."""

import uuid
from datetime import datetime, timezone

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.auth.security import hash_password, create_access_token
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models import User, UserRole, Person, MemorialPage, PageStatus, PageVisibility, LifeStatus, Gender


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
        biography="A great person.",
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
async def published_page(test_session: AsyncSession, test_user: User):
    """Create a published test page."""
    person = Person(
        id=uuid.uuid4(),
        full_name="Jane Smith",
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
        slug="jane-smith-xyz789",
        title="Jane Smith Memorial",
        biography="A wonderful person.",
        visibility=PageVisibility.PUBLIC,
        status=PageStatus.PUBLISHED,
        owner_user_id=test_user.id,
        created_by_user_id=test_user.id,
        published_at=utc_now(),
        created_at=utc_now(),
        updated_at=utc_now(),
    )
    test_session.add(page)
    await test_session.commit()
    await test_session.refresh(page)
    return page


class TestCreatePage:
    """Tests for page creation."""

    async def test_create_page_success(self, client: AsyncClient, user_token: str):
        """Test successful page creation."""
        response = await client.post(
            "/api/pages",
            json={
                "person": {
                    "full_name": "Test Person",
                    "gender": "male",
                    "life_status": "deceased",
                },
                "title": "Test Memorial",
                "biography": "A test biography.",
                "visibility": "public",
            },
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Test Memorial"
        assert data["status"] == "draft"
        assert "slug" in data
        assert data["person"]["full_name"] == "Test Person"

    async def test_create_page_no_auth(self, client: AsyncClient):
        """Test page creation without auth fails."""
        response = await client.post(
            "/api/pages",
            json={
                "person": {"full_name": "Test Person"},
            },
        )

        assert response.status_code == 401


class TestListPages:
    """Tests for listing pages."""

    async def test_list_my_pages(
        self, client: AsyncClient, user_token: str, test_page: MemorialPage
    ):
        """Test listing user's pages."""
        response = await client.get(
            "/api/pages",
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1
        assert len(data["items"]) >= 1


class TestGetPage:
    """Tests for getting a page."""

    async def test_get_own_page(
        self, client: AsyncClient, user_token: str, test_page: MemorialPage
    ):
        """Test getting own page."""
        response = await client.get(
            f"/api/pages/{test_page.id}",
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["slug"] == test_page.slug

    async def test_get_other_user_page_forbidden(
        self, client: AsyncClient, other_user_token: str, test_page: MemorialPage
    ):
        """Test getting another user's page is forbidden."""
        response = await client.get(
            f"/api/pages/{test_page.id}",
            headers={"Authorization": f"Bearer {other_user_token}"},
        )

        assert response.status_code == 403

    async def test_admin_can_get_any_page(
        self, client: AsyncClient, admin_token: str, test_page: MemorialPage
    ):
        """Test admin can access any page."""
        response = await client.get(
            f"/api/pages/{test_page.id}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        assert response.status_code == 200


class TestUpdatePage:
    """Tests for updating a page."""

    async def test_update_own_page(
        self, client: AsyncClient, user_token: str, test_page: MemorialPage
    ):
        """Test updating own page."""
        response = await client.patch(
            f"/api/pages/{test_page.id}",
            json={"title": "Updated Title"},
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Title"

    async def test_update_other_user_page_forbidden(
        self, client: AsyncClient, other_user_token: str, test_page: MemorialPage
    ):
        """Test updating another user's page is forbidden."""
        response = await client.patch(
            f"/api/pages/{test_page.id}",
            json={"title": "Hacked Title"},
            headers={"Authorization": f"Bearer {other_user_token}"},
        )

        assert response.status_code == 403


class TestDeletePage:
    """Tests for deleting (archiving) a page."""

    async def test_delete_own_page(
        self, client: AsyncClient, user_token: str, test_page: MemorialPage
    ):
        """Test archiving own page."""
        response = await client.delete(
            f"/api/pages/{test_page.id}",
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Page archived successfully"


class TestPublishPage:
    """Tests for publishing a page."""

    async def test_publish_page(
        self, client: AsyncClient, user_token: str, test_page: MemorialPage
    ):
        """Test publishing a page."""
        response = await client.post(
            f"/api/pages/{test_page.id}/publish",
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "published"
        assert data["published_at"] is not None


class TestPublicPage:
    """Tests for public page access."""

    async def test_get_published_page_by_slug(
        self, client: AsyncClient, published_page: MemorialPage
    ):
        """Test getting a published page by slug (no auth)."""
        response = await client.get(f"/api/public/pages/{published_page.slug}")

        assert response.status_code == 200
        data = response.json()
        assert data["slug"] == published_page.slug
        assert data["person"]["full_name"] == "Jane Smith"

    async def test_get_draft_page_by_slug_not_found(
        self, client: AsyncClient, test_page: MemorialPage
    ):
        """Test getting a draft page by slug returns 404."""
        response = await client.get(f"/api/public/pages/{test_page.slug}")

        assert response.status_code == 404

    async def test_get_nonexistent_slug_not_found(self, client: AsyncClient):
        """Test getting a nonexistent slug returns 404."""
        response = await client.get("/api/public/pages/nonexistent-slug-12345")

        assert response.status_code == 404
