"""Tests for organization endpoints."""

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
    User, UserRole, Organization, OrganizationMember, OrganizationInvite,
    OrgProject, OrgRole, MemberStatus, InviteStatus, ProjectStatus,
    Person, MemorialPage, PageStatus, PageVisibility, Gender, LifeStatus,
)


TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


@pytest.fixture
async def test_engine():
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest.fixture
async def test_session(test_engine):
    session_factory = async_sessionmaker(
        test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    async with session_factory() as session:
        yield session


@pytest.fixture
async def override_get_db(test_engine):
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
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
async def test_user(test_session: AsyncSession):
    user = User(
        id=uuid.uuid4(),
        email="orgowner@example.com",
        password_hash=hash_password("password123"),
        display_name="Org Owner",
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
    user = User(
        id=uuid.uuid4(),
        email="otheruser@example.com",
        password_hash=hash_password("password123"),
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
    user = User(
        id=uuid.uuid4(),
        email="admin@example.com",
        password_hash=hash_password("password123"),
        display_name="Admin",
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
    return create_access_token(data={"sub": str(test_user.id)})


@pytest.fixture
def other_user_token(other_user: User) -> str:
    return create_access_token(data={"sub": str(other_user.id)})


@pytest.fixture
def admin_token(admin_user: User) -> str:
    return create_access_token(data={"sub": str(admin_user.id)})


@pytest.fixture
async def test_org(test_session: AsyncSession, test_user: User):
    org = Organization(
        id=uuid.uuid4(),
        name="Test Organization",
        slug="test-org-abc123",
        type="government",
        is_active=True,
        created_by_user_id=test_user.id,
        created_at=utc_now(),
        updated_at=utc_now(),
    )
    test_session.add(org)
    await test_session.flush()

    member = OrganizationMember(
        id=uuid.uuid4(),
        org_id=org.id,
        user_id=test_user.id,
        role=OrgRole.ORG_ADMIN,
        status=MemberStatus.ACTIVE,
        created_at=utc_now(),
        updated_at=utc_now(),
    )
    test_session.add(member)
    await test_session.commit()
    await test_session.refresh(org)
    return org


@pytest.fixture
async def org_editor_member(test_session: AsyncSession, test_org: Organization, other_user: User):
    member = OrganizationMember(
        id=uuid.uuid4(),
        org_id=test_org.id,
        user_id=other_user.id,
        role=OrgRole.ORG_EDITOR,
        status=MemberStatus.ACTIVE,
        created_at=utc_now(),
        updated_at=utc_now(),
    )
    test_session.add(member)
    await test_session.commit()
    await test_session.refresh(member)
    return member


class TestCreateOrganization:
    async def test_create_org_success(self, client: AsyncClient, user_token: str):
        response = await client.post(
            "/api/orgs",
            json={"name": "My New Org", "type": "ngo"},
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "My New Org"
        assert data["type"] == "ngo"
        assert "slug" in data
        assert data["is_active"] is True

    async def test_create_org_creator_becomes_admin(
        self, client: AsyncClient, user_token: str, test_session: AsyncSession, test_user: User
    ):
        response = await client.post(
            "/api/orgs",
            json={"name": "Admin Test Org"},
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 200
        org_id = response.json()["id"]

        result = await test_session.execute(
            select(OrganizationMember).where(
                OrganizationMember.org_id == uuid.UUID(org_id),
                OrganizationMember.user_id == test_user.id,
            )
        )
        member = result.scalar_one_or_none()
        assert member is not None
        assert member.role == OrgRole.ORG_ADMIN


class TestGetOrganization:
    async def test_get_org_member_success(
        self, client: AsyncClient, user_token: str, test_org: Organization
    ):
        response = await client.get(
            f"/api/orgs/{test_org.id}",
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 200
        assert response.json()["name"] == test_org.name

    async def test_get_org_non_member_forbidden(
        self, client: AsyncClient, other_user_token: str, test_org: Organization
    ):
        response = await client.get(
            f"/api/orgs/{test_org.id}",
            headers={"Authorization": f"Bearer {other_user_token}"},
        )

        assert response.status_code == 403


class TestListOrganizations:
    async def test_list_my_orgs(
        self, client: AsyncClient, user_token: str, test_org: Organization
    ):
        response = await client.get(
            "/api/orgs",
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1
        org_ids = [o["id"] for o in data["items"]]
        assert str(test_org.id) in org_ids


class TestUpdateOrganization:
    async def test_update_org_admin_success(
        self, client: AsyncClient, user_token: str, test_org: Organization
    ):
        response = await client.patch(
            f"/api/orgs/{test_org.id}",
            json={"name": "Updated Name"},
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 200
        assert response.json()["name"] == "Updated Name"

    async def test_update_org_editor_forbidden(
        self, client: AsyncClient, other_user_token: str, test_org: Organization, org_editor_member
    ):
        response = await client.patch(
            f"/api/orgs/{test_org.id}",
            json={"name": "Hacked Name"},
            headers={"Authorization": f"Bearer {other_user_token}"},
        )

        assert response.status_code == 403


class TestInvites:
    async def test_create_invite_admin_success(
        self, client: AsyncClient, user_token: str, test_org: Organization
    ):
        response = await client.post(
            f"/api/orgs/{test_org.id}/invites",
            json={"email": "newmember@example.com", "role": "org_editor"},
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "newmember@example.com"
        assert data["role"] == "org_editor"
        assert "token" in data

    async def test_accept_invite_success(
        self,
        client: AsyncClient,
        other_user_token: str,
        test_session: AsyncSession,
        test_org: Organization,
        test_user: User,
    ):
        from datetime import timedelta
        invite = OrganizationInvite(
            id=uuid.uuid4(),
            org_id=test_org.id,
            email="otheruser@example.com",
            role=OrgRole.ORG_VIEWER,
            token="test-invite-token-123",
            status=InviteStatus.PENDING,
            expires_at=utc_now() + timedelta(days=7),
            created_by_user_id=test_user.id,
            created_at=utc_now(),
        )
        test_session.add(invite)
        await test_session.commit()

        response = await client.post(
            "/api/orgs/invites/test-invite-token-123/accept",
            headers={"Authorization": f"Bearer {other_user_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["role"] == "org_viewer"
        assert str(test_org.id) == str(data["org_id"])


class TestProjects:
    async def test_create_project_editor_success(
        self, client: AsyncClient, other_user_token: str, test_org: Organization, org_editor_member
    ):
        response = await client.post(
            f"/api/orgs/{test_org.id}/projects",
            json={"name": "Heroes Park", "description": "A memorial park"},
            headers={"Authorization": f"Bearer {other_user_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Heroes Park"
        assert data["status"] == "active"

    async def test_list_projects(
        self, client: AsyncClient, user_token: str, test_org: Organization, test_session: AsyncSession
    ):
        project = OrgProject(
            id=uuid.uuid4(),
            org_id=test_org.id,
            name="Test Project",
            status=ProjectStatus.ACTIVE,
            created_at=utc_now(),
            updated_at=utc_now(),
        )
        test_session.add(project)
        await test_session.commit()

        response = await client.get(
            f"/api/orgs/{test_org.id}/projects",
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 200
        assert response.json()["total"] >= 1


class TestOrgPages:
    async def test_create_org_page_editor_success(
        self, client: AsyncClient, other_user_token: str, test_org: Organization, org_editor_member
    ):
        response = await client.post(
            f"/api/orgs/{test_org.id}/pages",
            json={
                "person": {"full_name": "Hero Person"},
                "title": "Hero Memorial",
            },
            headers={"Authorization": f"Bearer {other_user_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["person"]["full_name"] == "Hero Person"

    async def test_create_org_page_viewer_forbidden(
        self, client: AsyncClient, test_session: AsyncSession, test_org: Organization, other_user: User
    ):
        viewer_member = OrganizationMember(
            id=uuid.uuid4(),
            org_id=test_org.id,
            user_id=other_user.id,
            role=OrgRole.ORG_VIEWER,
            status=MemberStatus.ACTIVE,
            created_at=utc_now(),
            updated_at=utc_now(),
        )
        test_session.add(viewer_member)
        await test_session.commit()

        viewer_token = create_access_token(data={"sub": str(other_user.id)})

        response = await client.post(
            f"/api/orgs/{test_org.id}/pages",
            json={
                "person": {"full_name": "Should Fail"},
            },
            headers={"Authorization": f"Bearer {viewer_token}"},
        )

        assert response.status_code == 403

    async def test_non_member_forbidden(
        self, client: AsyncClient, other_user_token: str, test_org: Organization
    ):
        response = await client.get(
            f"/api/orgs/{test_org.id}/pages",
            headers={"Authorization": f"Bearer {other_user_token}"},
        )

        assert response.status_code == 403
