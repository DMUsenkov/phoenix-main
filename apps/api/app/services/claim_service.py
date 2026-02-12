"""Service for Person Claim Invite operations."""

import secrets
import uuid
from datetime import datetime, timezone, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    PersonClaimInvite,
    ClaimInviteStatus,
    Person,
    MemorialPage,
)


CLAIM_INVITE_EXPIRY_DAYS = 7


async def create_claim_invite(
    db: AsyncSession,
    person_id: uuid.UUID,
    email: str,
    created_by_user_id: uuid.UUID,
    expiry_days: int = CLAIM_INVITE_EXPIRY_DAYS,
) -> PersonClaimInvite:
    """Create a claim invite for a person."""
    invite = PersonClaimInvite(
        id=uuid.uuid4(),
        person_id=person_id,
        email=email.lower().strip(),
        token=secrets.token_urlsafe(32),
        status=ClaimInviteStatus.PENDING,
        expires_at=datetime.now(timezone.utc) + timedelta(days=expiry_days),
        created_by_user_id=created_by_user_id,
        created_at=datetime.now(timezone.utc),
    )
    db.add(invite)
    await db.flush()
    await db.refresh(invite)
    return invite


async def get_invite_by_token(
    db: AsyncSession,
    token: str,
) -> PersonClaimInvite | None:
    """Get claim invite by token."""
    result = await db.execute(
        select(PersonClaimInvite).where(PersonClaimInvite.token == token)
    )
    return result.scalar_one_or_none()


async def get_invite_by_id(
    db: AsyncSession,
    invite_id: uuid.UUID,
) -> PersonClaimInvite | None:
    """Get claim invite by ID."""
    result = await db.execute(
        select(PersonClaimInvite).where(PersonClaimInvite.id == invite_id)
    )
    return result.scalar_one_or_none()


async def accept_claim_invite(
    db: AsyncSession,
    invite: PersonClaimInvite,
    user_id: uuid.UUID,
    transfer_page_ownership: bool = True,
) -> PersonClaimInvite:
    """Accept a claim invite and link person to user."""
    now = datetime.now(timezone.utc)

    if invite.status != ClaimInviteStatus.PENDING:
        raise ValueError(f"Invite already {invite.status.value}")

    if invite.expires_at < now:
        invite.status = ClaimInviteStatus.EXPIRED
        await db.flush()
        raise ValueError("Invite has expired")

    person_result = await db.execute(
        select(Person).where(Person.id == invite.person_id)
    )
    person = person_result.scalar_one_or_none()

    if not person:
        raise ValueError("Person not found")

    if person.linked_user_id is not None:
        raise ValueError("Person already linked to another user")

    person.linked_user_id = user_id

    if transfer_page_ownership:
        page_result = await db.execute(
            select(MemorialPage).where(MemorialPage.person_id == person.id)
        )
        page = page_result.scalar_one_or_none()
        if page:
            page.owner_user_id = user_id

    invite.status = ClaimInviteStatus.ACCEPTED
    invite.accepted_by_user_id = user_id
    invite.accepted_at = now

    await db.flush()
    await db.refresh(invite)
    return invite


async def revoke_claim_invite(
    db: AsyncSession,
    invite: PersonClaimInvite,
) -> PersonClaimInvite:
    """Revoke a pending claim invite."""
    if invite.status != ClaimInviteStatus.PENDING:
        raise ValueError(f"Cannot revoke invite with status {invite.status.value}")

    invite.status = ClaimInviteStatus.REVOKED
    await db.flush()
    await db.refresh(invite)
    return invite


async def list_person_invites(
    db: AsyncSession,
    person_id: uuid.UUID,
) -> list[PersonClaimInvite]:
    """List all claim invites for a person."""
    result = await db.execute(
        select(PersonClaimInvite)
        .where(PersonClaimInvite.person_id == person_id)
        .order_by(PersonClaimInvite.created_at.desc())
    )
    return list(result.scalars().all())


async def get_pending_invite_for_email(
    db: AsyncSession,
    person_id: uuid.UUID,
    email: str,
) -> PersonClaimInvite | None:
    """Get pending invite for specific email and person."""
    result = await db.execute(
        select(PersonClaimInvite).where(
            PersonClaimInvite.person_id == person_id,
            PersonClaimInvite.email == email.lower().strip(),
            PersonClaimInvite.status == ClaimInviteStatus.PENDING,
        )
    )
    return result.scalar_one_or_none()
