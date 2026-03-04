"""Tests for authentication endpoints."""

import uuid
from datetime import datetime, timezone

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.auth.security import hash_password
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.user import User, UserRole


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
        email="test@example.com",
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


class TestRegister:
    """Tests for user registration."""

    async def test_register_success(self, client: AsyncClient):
        """Test successful user registration."""
        response = await client.post(
            "/api/auth/register",
            json={
                "email": "newuser@example.com",
                "password": "securepassword123",
                "display_name": "New User",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    async def test_register_duplicate_email(self, client: AsyncClient, test_user: User):
        """Test registration with existing email fails."""
        response = await client.post(
            "/api/auth/register",
            json={
                "email": test_user.email,
                "password": "anotherpassword123",
            },
        )
        assert response.status_code == 409
        assert "already registered" in response.json()["detail"]

    async def test_register_invalid_email(self, client: AsyncClient):
        """Test registration with invalid email fails."""
        response = await client.post(
            "/api/auth/register",
            json={
                "email": "not-an-email",
                "password": "securepassword123",
            },
        )
        assert response.status_code == 422

    async def test_register_short_password(self, client: AsyncClient):
        """Test registration with short password fails."""
        response = await client.post(
            "/api/auth/register",
            json={
                "email": "user@example.com",
                "password": "short",
            },
        )
        assert response.status_code == 422


class TestLogin:
    """Tests for user login."""

    async def test_login_success(self, client: AsyncClient, test_user: User):
        """Test successful login."""
        response = await client.post(
            "/api/auth/login",
            json={
                "email": test_user.email,
                "password": "testpassword123",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    async def test_login_wrong_password(self, client: AsyncClient, test_user: User):
        """Test login with wrong password fails."""
        response = await client.post(
            "/api/auth/login",
            json={
                "email": test_user.email,
                "password": "wrongpassword",
            },
        )
        assert response.status_code == 401
        assert "Invalid email or password" in response.json()["detail"]

    async def test_login_nonexistent_user(self, client: AsyncClient):
        """Test login with non-existent user fails."""
        response = await client.post(
            "/api/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "somepassword123",
            },
        )
        assert response.status_code == 401


class TestMe:
    """Tests for current user endpoint."""

    async def test_me_success(self, client: AsyncClient, test_user: User):
        """Test getting current user profile."""
        login_response = await client.post(
            "/api/auth/login",
            json={
                "email": test_user.email,
                "password": "testpassword123",
            },
        )
        token = login_response.json()["access_token"]

        response = await client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user.email
        assert data["display_name"] == test_user.display_name
        assert data["role"] == "user"

    async def test_me_no_token(self, client: AsyncClient):
        """Test getting current user without token fails."""
        response = await client.get("/api/auth/me")
        assert response.status_code == 401

    async def test_me_invalid_token(self, client: AsyncClient):
        """Test getting current user with invalid token fails."""
        response = await client.get(
            "/api/auth/me",
            headers={"Authorization": "Bearer invalid-token"},
        )
        assert response.status_code == 401


class TestRefresh:
    """Tests for token refresh."""

    async def test_refresh_success(self, client: AsyncClient, test_user: User):
        """Test successful token refresh."""
        login_response = await client.post(
            "/api/auth/login",
            json={
                "email": test_user.email,
                "password": "testpassword123",
            },
        )
        refresh_token = login_response.json()["refresh_token"]

        response = await client.post(
            "/api/auth/refresh",
            json={"refresh_token": refresh_token},
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data

    async def test_refresh_invalid_token(self, client: AsyncClient):
        """Test refresh with invalid token fails."""
        response = await client.post(
            "/api/auth/refresh",
            json={"refresh_token": "invalid-token"},
        )
        assert response.status_code == 401


class TestLogout:
    """Tests for user logout."""

    async def test_logout_success(self, client: AsyncClient, test_user: User):
        """Test successful logout."""
        login_response = await client.post(
            "/api/auth/login",
            json={
                "email": test_user.email,
                "password": "testpassword123",
            },
        )
        token = login_response.json()["access_token"]

        response = await client.post(
            "/api/auth/logout",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        assert "logged out" in response.json()["message"].lower()


class TestAdminRBAC:
    """Tests for admin RBAC."""

    async def test_admin_ping_as_admin(self, client: AsyncClient, admin_user: User):
        """Test admin endpoint access for admin user."""
        login_response = await client.post(
            "/api/auth/login",
            json={
                "email": admin_user.email,
                "password": "adminpassword123",
            },
        )
        token = login_response.json()["access_token"]

        response = await client.get(
            "/api/admin/ping",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "pong"
        assert data["admin_email"] == admin_user.email

    async def test_admin_ping_as_user(self, client: AsyncClient, test_user: User):
        """Test admin endpoint access denied for regular user."""
        login_response = await client.post(
            "/api/auth/login",
            json={
                "email": test_user.email,
                "password": "testpassword123",
            },
        )
        token = login_response.json()["access_token"]

        response = await client.get(
            "/api/admin/ping",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 403
        assert "Insufficient permissions" in response.json()["detail"]

    async def test_admin_ping_no_token(self, client: AsyncClient):
        """Test admin endpoint access denied without token."""
        response = await client.get("/api/admin/ping")
        assert response.status_code == 401
