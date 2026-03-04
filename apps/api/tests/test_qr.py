"""Tests for QR code endpoints."""

import uuid
from datetime import datetime, timezone

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.auth.security import hash_password, create_access_token
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models import (
    User, UserRole, Person, MemorialPage, PageStatus, PageVisibility,
    LifeStatus, Gender, QRCode, QRCodeScanEvent
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


@pytest.fixture
async def test_qr(test_session: AsyncSession, test_page: MemorialPage, test_user: User):
    """Create a test QR code."""
    qr = QRCode(
        id=uuid.uuid4(),
        page_id=test_page.id,
        code="ABC12345",
        is_active=True,
        created_by_user_id=test_user.id,
        created_at=utc_now(),
        updated_at=utc_now(),
    )
    test_session.add(qr)
    await test_session.commit()
    await test_session.refresh(qr)
    return qr


@pytest.fixture
async def inactive_qr(test_session: AsyncSession, published_page: MemorialPage, test_user: User):
    """Create an inactive QR code."""
    qr = QRCode(
        id=uuid.uuid4(),
        page_id=published_page.id,
        code="INACTIVE1",
        is_active=False,
        created_by_user_id=test_user.id,
        created_at=utc_now(),
        updated_at=utc_now(),
    )
    test_session.add(qr)
    await test_session.commit()
    await test_session.refresh(qr)
    return qr


class TestCreateQR:
    """Tests for QR code creation."""

    async def test_create_qr_owner_success(
        self, client: AsyncClient, user_token: str, test_page: MemorialPage
    ):
        """Test owner can create QR code for their page."""
        response = await client.post(
            f"/api/pages/{test_page.id}/qr",
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["page_id"] == str(test_page.id)
        assert data["is_active"] is True
        assert "code" in data
        assert len(data["code"]) == 8
        assert "short_url" in data
        assert "target_url" in data
        assert data["target_url"] == f"/p/{test_page.slug}"

    async def test_create_qr_idempotent(
        self, client: AsyncClient, user_token: str, test_page: MemorialPage
    ):
        """Test creating QR twice returns the same QR."""
        response1 = await client.post(
            f"/api/pages/{test_page.id}/qr",
            headers={"Authorization": f"Bearer {user_token}"},
        )
        response2 = await client.post(
            f"/api/pages/{test_page.id}/qr",
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response1.status_code == 200
        assert response2.status_code == 200
        assert response1.json()["code"] == response2.json()["code"]

    async def test_create_qr_non_owner_forbidden(
        self, client: AsyncClient, other_user_token: str, test_page: MemorialPage
    ):
        """Test non-owner cannot create QR code."""
        response = await client.post(
            f"/api/pages/{test_page.id}/qr",
            headers={"Authorization": f"Bearer {other_user_token}"},
        )

        assert response.status_code == 403

    async def test_create_qr_admin_success(
        self, client: AsyncClient, admin_token: str, test_page: MemorialPage
    ):
        """Test admin can create QR code for any page."""
        response = await client.post(
            f"/api/pages/{test_page.id}/qr",
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        assert response.status_code == 200

    async def test_create_qr_page_not_found(
        self, client: AsyncClient, user_token: str
    ):
        """Test creating QR for nonexistent page returns 404."""
        fake_id = uuid.uuid4()
        response = await client.post(
            f"/api/pages/{fake_id}/qr",
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 404


class TestGetQR:
    """Tests for getting QR code."""

    async def test_get_qr_owner_success(
        self, client: AsyncClient, user_token: str, test_qr: QRCode, test_page: MemorialPage
    ):
        """Test owner can get QR code."""
        response = await client.get(
            f"/api/pages/{test_page.id}/qr",
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["code"] == test_qr.code

    async def test_get_qr_non_owner_forbidden(
        self, client: AsyncClient, other_user_token: str, test_qr: QRCode, test_page: MemorialPage
    ):
        """Test non-owner cannot get QR code."""
        response = await client.get(
            f"/api/pages/{test_page.id}/qr",
            headers={"Authorization": f"Bearer {other_user_token}"},
        )

        assert response.status_code == 403

    async def test_get_qr_not_found(
        self, client: AsyncClient, user_token: str, test_page: MemorialPage
    ):
        """Test getting nonexistent QR returns 404."""
        response = await client.get(
            f"/api/pages/{test_page.id}/qr",
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 404


class TestQRImage:
    """Tests for QR image generation."""

    async def test_get_qr_image_svg(
        self, client: AsyncClient, user_token: str, test_qr: QRCode
    ):
        """Test getting QR image as SVG."""
        response = await client.get(
            f"/api/qr/{test_qr.code}/image?format=svg",
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 200
        assert response.headers["content-type"] == "image/svg+xml"
        assert "<svg" in response.text

    async def test_get_qr_image_png(
        self, client: AsyncClient, user_token: str, test_qr: QRCode
    ):
        """Test getting QR image as PNG."""
        response = await client.get(
            f"/api/qr/{test_qr.code}/image?format=png",
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 200
        assert response.headers["content-type"] == "image/png"
        assert response.content[:8] == b"\x89PNG\r\n\x1a\n"

    async def test_get_qr_image_non_owner_forbidden(
        self, client: AsyncClient, other_user_token: str, test_qr: QRCode
    ):
        """Test non-owner cannot get QR image."""
        response = await client.get(
            f"/api/qr/{test_qr.code}/image",
            headers={"Authorization": f"Bearer {other_user_token}"},
        )

        assert response.status_code == 403

    async def test_get_qr_image_not_found(
        self, client: AsyncClient, user_token: str
    ):
        """Test getting image for nonexistent QR returns 404."""
        response = await client.get(
            "/api/qr/NONEXIST/image",
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 404


class TestQRRedirect:
    """Tests for QR redirect endpoint."""

    async def test_redirect_success(
        self, client: AsyncClient, test_qr: QRCode, test_page: MemorialPage
    ):
        """Test redirect returns correct Location header."""
        response = await client.get(
            f"/q/{test_qr.code}",
            follow_redirects=False,
        )

        assert response.status_code == 302
        assert response.headers["location"] == f"/p/{test_page.slug}"

    async def test_redirect_inactive_not_found(
        self, client: AsyncClient, inactive_qr: QRCode
    ):
        """Test inactive QR code returns 404."""
        response = await client.get(
            f"/q/{inactive_qr.code}",
            follow_redirects=False,
        )

        assert response.status_code == 404

    async def test_redirect_nonexistent_not_found(self, client: AsyncClient):
        """Test nonexistent QR code returns 404."""
        response = await client.get(
            "/q/NONEXIST",
            follow_redirects=False,
        )

        assert response.status_code == 404


class TestScanEvent:
    """Tests for scan event creation."""

    async def test_scan_event_created_on_redirect(
        self,
        client: AsyncClient,
        test_qr: QRCode,
        test_session: AsyncSession,
        override_get_db,
    ):
        """Test scan event is created when QR is scanned."""
        response = await client.get(
            f"/q/{test_qr.code}",
            headers={
                "User-Agent": "TestBrowser/1.0",
                "Referer": "https://example.com",
            },
            follow_redirects=False,
        )

        assert response.status_code == 302

        result = await test_session.execute(
            select(QRCodeScanEvent).where(QRCodeScanEvent.qr_code_id == test_qr.id)
        )
        events = list(result.scalars().all())

        assert len(events) >= 1
        event = events[-1]
        assert event.user_agent == "TestBrowser/1.0"
        assert event.referer == "https://example.com"
