"""Database initialization with default admin user."""

import asyncio

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.security import hash_password
from app.db.session import get_session_factory
from app.models.user import User, UserRole


ADMIN_EMAIL = "admin@phoenix.memorial"
ADMIN_PASSWORD = "PhoenixAdmin2024!"
ADMIN_DISPLAY_NAME = "System Administrator"


async def create_admin_user(session: AsyncSession) -> User | None:
    """Create default admin user if not exists."""
    result = await session.execute(
        select(User).where(User.email == ADMIN_EMAIL)
    )
    existing_user = result.scalar_one_or_none()

    if existing_user:
        print(f"Admin user already exists: {ADMIN_EMAIL}")
        return None

    admin_user = User(
        email=ADMIN_EMAIL,
        password_hash=hash_password(ADMIN_PASSWORD),
        display_name=ADMIN_DISPLAY_NAME,
        role=UserRole.ADMIN,
        is_active=True,
    )

    session.add(admin_user)
    await session.commit()
    await session.refresh(admin_user)

    print(f"Created admin user: {ADMIN_EMAIL}")
    return admin_user


async def init_db() -> None:
    """Initialize database with default data."""
    session_factory = get_session_factory()
    async with session_factory() as session:
        await create_admin_user(session)


if __name__ == "__main__":
    asyncio.run(init_db())
