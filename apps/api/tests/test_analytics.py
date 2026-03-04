"""Tests for Analytics module - tracking, aggregation, reports."""

import uuid
from datetime import datetime, date, timezone, timedelta

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    User,
    UserRole,
    Organization,
    OrganizationMember,
    OrgRole,
    MemberStatus,
    MemorialPage,
    Person,
    Gender,
    LifeStatus,
    PageStatus,
    PageVisibility,
    AnalyticsEvent,
    EventType,
)
from app.services import analytics_service


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
async def test_org(db: AsyncSession, test_user: User) -> Organization:
    """Create a test organization."""
    org = Organization(
        id=uuid.uuid4(),
        name="Test Org",
        slug=f"test-org-{uuid.uuid4().hex[:8]}",
    )
    db.add(org)
    await db.flush()

    member = OrganizationMember(
        id=uuid.uuid4(),
        organization_id=org.id,
        user_id=test_user.id,
        role=OrgRole.ADMIN,
        status=MemberStatus.ACTIVE,
    )
    db.add(member)
    await db.commit()
    return org


@pytest.fixture
async def test_person(db: AsyncSession, test_user: User) -> Person:
    """Create a test person."""
    person = Person(
        id=uuid.uuid4(),
        full_name="Test Person",
        gender=Gender.MALE,
        life_status=LifeStatus.DECEASED,
        created_by_user_id=test_user.id,
    )
    db.add(person)
    await db.commit()
    return person


@pytest.fixture
async def test_page(db: AsyncSession, test_user: User, test_org: Organization, test_person: Person) -> MemorialPage:
    """Create a test memorial page."""
    page = MemorialPage(
        id=uuid.uuid4(),
        slug=f"test-page-{uuid.uuid4().hex[:8]}",
        person_id=test_person.id,
        owner_user_id=test_user.id,
        owner_org_id=test_org.id,
        status=PageStatus.PUBLISHED,
        visibility=PageVisibility.PUBLIC,
    )
    db.add(page)
    await db.commit()
    return page


class TestEventTracking:
    """Tests for event tracking."""

    async def test_track_page_view(self, db: AsyncSession, test_page: MemorialPage, test_org: Organization):
        """Track a page view event."""
        event = await analytics_service.track_page_view(
            db=db,
            page_id=test_page.id,
            org_id=test_org.id,
            ip="192.168.1.1",
            user_agent="Mozilla/5.0",
            referer="https://google.com",
        )
        await db.commit()

        assert event.event_type == EventType.PAGE_VIEW.value
        assert event.page_id == test_page.id
        assert event.org_id == test_org.id
        assert event.ip_hash is not None
        assert event.ip_hash != "192.168.1.1"

    async def test_track_qr_scan(self, db: AsyncSession, test_page: MemorialPage, test_org: Organization):
        """Track a QR scan event."""
        qr_code_id = uuid.uuid4()
        event = await analytics_service.track_qr_scan(
            db=db,
            qr_code_id=qr_code_id,
            page_id=test_page.id,
            org_id=test_org.id,
            ip="10.0.0.1",
        )
        await db.commit()

        assert event.event_type == EventType.QR_SCAN.value
        assert event.qr_code_id == qr_code_id
        assert event.page_id == test_page.id

    async def test_track_generic_event(self, db: AsyncSession):
        """Track a generic event."""
        event = await analytics_service.track_event(
            db=db,
            event_type=EventType.MAP_OPEN.value,
            anon_id="anon-123",
            session_id="session-456",
            properties={"zoom": 10},
        )
        await db.commit()

        assert event.event_type == EventType.MAP_OPEN.value
        assert event.anon_id == "anon-123"
        assert event.properties == {"zoom": 10}

    async def test_ip_hashing(self, db: AsyncSession):
        """IP addresses are hashed, not stored raw."""
        event = await analytics_service.track_event(
            db=db,
            event_type=EventType.PAGE_VIEW.value,
            ip="203.0.113.42",
        )
        await db.commit()

        assert event.ip_hash is not None
        assert "203.0.113.42" not in (event.ip_hash or "")


class TestEventTypeAllowlist:
    """Tests for event type allowlist."""

    def test_allowed_event_types(self):
        """Check allowed event types."""
        assert analytics_service.is_event_type_allowed(EventType.PAGE_VIEW.value)
        assert analytics_service.is_event_type_allowed(EventType.QR_SCAN.value)
        assert analytics_service.is_event_type_allowed(EventType.MAP_OPEN.value)
        assert analytics_service.is_event_type_allowed(EventType.SHARE_CLICK.value)

    def test_disallowed_event_types(self):
        """Check disallowed event types."""
        assert not analytics_service.is_event_type_allowed("malicious.event")
        assert not analytics_service.is_event_type_allowed("user.password_change")
        assert not analytics_service.is_event_type_allowed("")


class TestOrgSummary:
    """Tests for organization summary reports."""

    async def test_get_org_summary_empty(self, db: AsyncSession, test_org: Organization):
        """Get summary for org with no events."""
        summary = await analytics_service.get_org_summary(
            db=db,
            org_id=test_org.id,
            from_date=date.today() - timedelta(days=7),
            to_date=date.today(),
        )

        assert summary["totals"]["views"] == 0
        assert summary["totals"]["qr_scans"] == 0
        assert len(summary["timeseries"]) == 0
        assert len(summary["top_pages"]) == 0

    async def test_get_org_summary_with_events(
        self, db: AsyncSession, test_org: Organization, test_page: MemorialPage
    ):
        """Get summary for org with events."""
        for _ in range(5):
            await analytics_service.track_page_view(
                db=db,
                page_id=test_page.id,
                org_id=test_org.id,
            )
        for _ in range(3):
            await analytics_service.track_event(
                db=db,
                event_type=EventType.QR_SCAN.value,
                org_id=test_org.id,
                page_id=test_page.id,
            )
        await db.commit()

        summary = await analytics_service.get_org_summary(
            db=db,
            org_id=test_org.id,
            from_date=date.today() - timedelta(days=1),
            to_date=date.today(),
        )

        assert summary["totals"]["views"] == 5
        assert summary["totals"]["qr_scans"] == 3
        assert len(summary["top_pages"]) >= 1
        assert summary["top_pages"][0]["page_id"] == str(test_page.id)


class TestDailyAggregation:
    """Tests for daily aggregation."""

    async def test_compute_daily_aggregates(
        self, db: AsyncSession, test_org: Organization, test_page: MemorialPage
    ):
        """Compute daily aggregates."""
        for _ in range(10):
            await analytics_service.track_page_view(
                db=db,
                page_id=test_page.id,
                org_id=test_org.id,
                anon_id=f"anon-{uuid.uuid4().hex[:8]}",
            )
        await db.commit()

        await analytics_service.compute_daily_aggregates(
            db=db,
            target_date=date.today(),
            org_id=test_org.id,
        )
        await db.commit()

        result = await db.execute(
            select(AnalyticsEvent).where(
                AnalyticsEvent.org_id == test_org.id,
                AnalyticsEvent.event_type == EventType.PAGE_VIEW.value,
            )
        )
        events = result.scalars().all()
        assert len(events) == 10
