import re
import uuid

import pytest
from pydantic import ValidationError
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.ext.compiler import compiles

from app.api.schemas.media import PresignRequest
from app.api.schemas.page import PageCreate, PersonCreate
from app.auth import security
from app.db.base import Base
from app.models import Gender, LifeStatus, PageStatus, PageVisibility, User, UserRole
from app.services import media_service, page_service, qr_service


@compiles(JSONB, "sqlite")
def compile_jsonb_sqlite(_type, _compiler, **_kw):
    return "JSON"


@pytest.fixture
async def db_session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    async with session_factory() as session:
        yield session

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


async def create_user(session: AsyncSession) -> User:
    user = User(
        id=uuid.uuid4(),
        email=f"{uuid.uuid4()}@example.com",
        password_hash=security.hash_password("password123"),
        display_name="Test User",
        role=UserRole.USER,
        is_active=True,
    )
    session.add(user)
    await session.flush()
    return user


async def create_page(session: AsyncSession, user_id: uuid.UUID):
    data = PageCreate(
        person=PersonCreate(
            full_name="Ada Lovelace",
            gender=Gender.FEMALE,
            life_status=LifeStatus.DECEASED,
            birth_place="London",
            birth_place_lat=51.5072,
            birth_place_lng=-0.1276,
            burial_place="St. Mary Magdalene",
            burial_place_lat=52.9865,
            burial_place_lng=-1.1976,
        ),
        title="Ada Lovelace Memorial",
        biography="First programmer",
        short_description="Mathematician and computing pioneer",
        visibility=PageVisibility.PUBLIC,
    )
    return await page_service.create_page(session, data, user_id)


def test_password_hash_and_verify_roundtrip():
    password_hash = security.hash_password("strong-password")

    assert password_hash != "strong-password"
    assert security.verify_password("strong-password", password_hash)
    assert not security.verify_password("wrong-password", password_hash)
    assert not security.verify_password("strong-password", "not-a-valid-hash")


def test_access_and_refresh_tokens_have_expected_payloads():
    user_id = str(uuid.uuid4())
    access_token = security.create_access_token({"sub": user_id})
    refresh_token = security.create_refresh_token({"sub": user_id})

    access_payload = security.decode_token(access_token)
    refresh_payload = security.decode_token(refresh_token)

    assert access_payload is not None
    assert refresh_payload is not None
    assert access_payload["sub"] == user_id
    assert refresh_payload["sub"] == user_id
    assert access_payload["type"] == "access"
    assert refresh_payload["type"] == "refresh"
    assert security.decode_token("broken-token") is None


def test_refresh_token_hash_is_stable_and_verifiable():
    token = "refresh-token"
    token_hash = security.hash_refresh_token(token)

    assert token_hash == security.hash_refresh_token(token)
    assert security.verify_refresh_token(token, token_hash)
    assert not security.verify_refresh_token("other-token", token_hash)


def test_person_create_rejects_death_date_for_living_person():
    with pytest.raises(ValidationError):
        PersonCreate(
            full_name="Living Person",
            life_status=LifeStatus.ALIVE,
            death_date="2024-01-01",
        )


def test_person_create_rejects_death_before_birth():
    with pytest.raises(ValidationError):
        PersonCreate(
            full_name="Invalid Dates",
            life_status=LifeStatus.DECEASED,
            birth_date="2024-01-02",
            death_date="2024-01-01",
        )


def test_generate_slug_is_url_safe_and_unique_shaped():
    slug = page_service.generate_slug(" Ada Lovelace! ")

    assert re.match(r"^ada-lovelace-[a-f0-9]{8}$", slug)


async def test_page_service_create_update_and_publish_without_moderation(
    db_session: AsyncSession,
):
    user = await create_user(db_session)
    page = await create_page(db_session, user.id)

    assert page.status == PageStatus.DRAFT
    assert page.person.full_name == "Ada Lovelace"
    assert page.slug.startswith("ada-lovelace-")
    assert page.person.birth_place_lat == 51.5072

    published = await page_service.publish_page(
        db_session, page, require_moderation=False
    )

    assert published.status == PageStatus.PUBLISHED
    assert published.published_at is not None


async def test_qr_service_is_idempotent_and_regenerates_code(
    db_session: AsyncSession,
    monkeypatch: pytest.MonkeyPatch,
):
    codes = iter(["AAAA1111", "BBBB2222"])
    monkeypatch.setattr(
        qr_service, "generate_base62_code", lambda _length=8: next(codes)
    )
    user = await create_user(db_session)
    page = await create_page(db_session, user.id)

    first = await qr_service.create_qr_for_page(db_session, page.id, user.id)
    second = await qr_service.create_qr_for_page(db_session, page.id, user.id)
    regenerated = await qr_service.regenerate_qr_for_page(db_session, page.id, user.id)

    assert first.id == second.id
    assert second.code == "BBBB2222"
    assert regenerated.id == first.id
    assert regenerated.is_active


async def test_qr_service_records_scan_event(
    db_session: AsyncSession, monkeypatch: pytest.MonkeyPatch
):
    monkeypatch.setattr(
        qr_service, "generate_base62_code", lambda _length=8: "SCAN1234"
    )
    user = await create_user(db_session)
    page = await create_page(db_session, user.id)
    qr = await qr_service.create_qr_for_page(db_session, page.id, user.id)

    event = await qr_service.create_scan_event(
        db_session,
        qr.id,
        ip="127.0.0.1",
        user_agent="pytest",
        referer="http://test",
    )

    assert event.qr_code_id == qr.id
    assert event.ip == "127.0.0.1"
    assert event.user_agent == "pytest"
    assert event.referer == "http://test"


def test_qr_url_builders_and_code_generation():
    code = qr_service.generate_base62_code()

    assert len(code) == qr_service.CODE_LENGTH
    assert set(code).issubset(set(qr_service.BASE62_ALPHABET))
    assert (
        qr_service.build_short_url("ABC123", "https://phoenix.test/")
        == "https://phoenix.test/q/ABC123"
    )
    assert qr_service.build_target_url("ada-lovelace") == "/p/ada-lovelace"


def test_media_filename_and_object_key_generation():
    page_id = uuid.uuid4()
    filename = media_service.sanitize_filename(" bad file @#$ name.png ")
    object_key = media_service.generate_object_key(page_id, "portrait.png")

    assert filename == "_bad_file_name.png_"
    assert object_key.startswith(f"pages/{page_id}/")
    assert object_key.endswith("_portrait.png")


def test_media_mime_validation_matches_declared_type():
    assert media_service.validate_mime_type("image/png", media_service.MediaType.IMAGE)
    assert media_service.validate_mime_type("video/mp4", media_service.MediaType.VIDEO)
    assert not media_service.validate_mime_type(
        "video/mp4", media_service.MediaType.IMAGE
    )
    assert not media_service.validate_mime_type(
        "image/png", media_service.MediaType.VIDEO
    )
    assert not media_service.validate_mime_type(
        "application/pdf", media_service.MediaType.IMAGE
    )


async def test_media_presign_rejects_quota_overflow(
    db_session: AsyncSession,
    monkeypatch: pytest.MonkeyPatch,
):
    async def fake_check_quota(_db, _page_id, _additional_bytes):
        return False, 100, 100

    monkeypatch.setattr(media_service, "check_quota", fake_check_quota)
    request = PresignRequest(
        page_id=uuid.uuid4(),
        filename="photo.png",
        mime_type="image/png",
        size_bytes=1000,
        type=media_service.MediaType.IMAGE,
    )

    with pytest.raises(ValueError, match="Quota exceeded"):
        await media_service.create_presign(
            db_session,
            storage=object(),
            data=request,
            user_id=uuid.uuid4(),
        )
