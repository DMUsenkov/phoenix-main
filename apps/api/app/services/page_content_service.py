"""Service for extended page content - life events, achievements, etc."""

import uuid
from datetime import datetime

from sqlalchemy import select, delete, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    MemorialPage,
    LifeEvent,
    Achievement,
    Education,
    Career,
    PersonValue,
    ValueType,
    Quote,
    MemorialMessage,
)


async def get_page_or_404(db: AsyncSession, page_id: uuid.UUID) -> MemorialPage:
    """Get page by ID or raise 404."""
    result = await db.execute(select(MemorialPage).where(MemorialPage.id == page_id))
    page = result.scalar_one_or_none()
    if not page:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Page not found")
    return page


async def create_life_event(
    db: AsyncSession,
    page_id: uuid.UUID,
    data: dict
) -> LifeEvent:
    """Create a life event for a page."""

    result = await db.execute(
        select(func.coalesce(func.max(LifeEvent.sort_order), -1))
        .where(LifeEvent.page_id == page_id)
    )
    max_order = result.scalar() or -1

    event = LifeEvent(
        id=uuid.uuid4(),
        page_id=page_id,
        title=data["title"],
        description=data.get("description"),
        start_date=data.get("start_date"),
        end_date=data.get("end_date"),
        location=data.get("location"),
        sort_order=data.get("sort_order", max_order + 1),
    )
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return event


async def list_life_events(db: AsyncSession, page_id: uuid.UUID) -> list[LifeEvent]:
    """List all life events for a page."""
    result = await db.execute(
        select(LifeEvent)
        .where(LifeEvent.page_id == page_id)
        .order_by(LifeEvent.sort_order)
    )
    return list(result.scalars().all())


async def get_life_event(db: AsyncSession, event_id: uuid.UUID) -> LifeEvent | None:
    """Get a life event by ID."""
    result = await db.execute(select(LifeEvent).where(LifeEvent.id == event_id))
    return result.scalar_one_or_none()


async def update_life_event(
    db: AsyncSession,
    event: LifeEvent,
    data: dict
) -> LifeEvent:
    """Update a life event."""
    for key, value in data.items():
        if value is not None:
            setattr(event, key, value)
    event.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(event)
    return event


async def delete_life_event(db: AsyncSession, event_id: uuid.UUID) -> None:
    """Delete a life event."""
    await db.execute(delete(LifeEvent).where(LifeEvent.id == event_id))
    await db.commit()


async def create_achievement(
    db: AsyncSession,
    page_id: uuid.UUID,
    data: dict
) -> Achievement:
    """Create an achievement for a page."""
    result = await db.execute(
        select(func.coalesce(func.max(Achievement.sort_order), -1))
        .where(Achievement.page_id == page_id)
    )
    max_order = result.scalar() or -1

    achievement = Achievement(
        id=uuid.uuid4(),
        page_id=page_id,
        title=data["title"],
        description=data.get("description"),
        date=data.get("date"),
        category=data.get("category"),
        custom_category=data.get("custom_category"),
        sort_order=data.get("sort_order", max_order + 1),
    )
    db.add(achievement)
    await db.commit()
    await db.refresh(achievement)
    return achievement


async def list_achievements(db: AsyncSession, page_id: uuid.UUID) -> list[Achievement]:
    """List all achievements for a page."""
    result = await db.execute(
        select(Achievement)
        .where(Achievement.page_id == page_id)
        .order_by(Achievement.sort_order)
    )
    return list(result.scalars().all())


async def get_achievement(db: AsyncSession, achievement_id: uuid.UUID) -> Achievement | None:
    """Get an achievement by ID."""
    result = await db.execute(select(Achievement).where(Achievement.id == achievement_id))
    return result.scalar_one_or_none()


async def update_achievement(
    db: AsyncSession,
    achievement: Achievement,
    data: dict
) -> Achievement:
    """Update an achievement."""
    for key, value in data.items():
        if value is not None:
            setattr(achievement, key, value)
    achievement.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(achievement)
    return achievement


async def delete_achievement(db: AsyncSession, achievement_id: uuid.UUID) -> None:
    """Delete an achievement."""
    await db.execute(delete(Achievement).where(Achievement.id == achievement_id))
    await db.commit()


async def create_education(
    db: AsyncSession,
    page_id: uuid.UUID,
    data: dict
) -> Education:
    """Create an education record for a page."""
    result = await db.execute(
        select(func.coalesce(func.max(Education.sort_order), -1))
        .where(Education.page_id == page_id)
    )
    max_order = result.scalar() or -1

    education = Education(
        id=uuid.uuid4(),
        page_id=page_id,
        institution=data["institution"],
        degree=data.get("degree"),
        field_of_study=data.get("field_of_study"),
        start_year=data.get("start_year"),
        end_year=data.get("end_year"),
        description=data.get("description"),
        sort_order=data.get("sort_order", max_order + 1),
    )
    db.add(education)
    await db.commit()
    await db.refresh(education)
    return education


async def list_education(db: AsyncSession, page_id: uuid.UUID) -> list[Education]:
    """List all education records for a page."""
    result = await db.execute(
        select(Education)
        .where(Education.page_id == page_id)
        .order_by(Education.sort_order)
    )
    return list(result.scalars().all())


async def get_education(db: AsyncSession, education_id: uuid.UUID) -> Education | None:
    """Get an education record by ID."""
    result = await db.execute(select(Education).where(Education.id == education_id))
    return result.scalar_one_or_none()


async def update_education(
    db: AsyncSession,
    education: Education,
    data: dict
) -> Education:
    """Update an education record."""
    for key, value in data.items():
        if value is not None:
            setattr(education, key, value)
    education.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(education)
    return education


async def delete_education(db: AsyncSession, education_id: uuid.UUID) -> None:
    """Delete an education record."""
    await db.execute(delete(Education).where(Education.id == education_id))
    await db.commit()


async def create_career(
    db: AsyncSession,
    page_id: uuid.UUID,
    data: dict
) -> Career:
    """Create a career record for a page."""
    result = await db.execute(
        select(func.coalesce(func.max(Career.sort_order), -1))
        .where(Career.page_id == page_id)
    )
    max_order = result.scalar() or -1

    career = Career(
        id=uuid.uuid4(),
        page_id=page_id,
        organization=data["organization"],
        role=data["role"],
        start_date=data.get("start_date"),
        end_date=data.get("end_date"),
        description=data.get("description"),
        sort_order=data.get("sort_order", max_order + 1),
    )
    db.add(career)
    await db.commit()
    await db.refresh(career)
    return career


async def list_career(db: AsyncSession, page_id: uuid.UUID) -> list[Career]:
    """List all career records for a page."""
    result = await db.execute(
        select(Career)
        .where(Career.page_id == page_id)
        .order_by(Career.sort_order)
    )
    return list(result.scalars().all())


async def get_career(db: AsyncSession, career_id: uuid.UUID) -> Career | None:
    """Get a career record by ID."""
    result = await db.execute(select(Career).where(Career.id == career_id))
    return result.scalar_one_or_none()


async def update_career(
    db: AsyncSession,
    career: Career,
    data: dict
) -> Career:
    """Update a career record."""
    for key, value in data.items():
        if value is not None:
            setattr(career, key, value)
    career.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(career)
    return career


async def delete_career(db: AsyncSession, career_id: uuid.UUID) -> None:
    """Delete a career record."""
    await db.execute(delete(Career).where(Career.id == career_id))
    await db.commit()


async def create_person_value(
    db: AsyncSession,
    page_id: uuid.UUID,
    data: dict
) -> PersonValue:
    """Create a person value (value/belief/principle) for a page."""
    result = await db.execute(
        select(func.coalesce(func.max(PersonValue.sort_order), -1))
        .where(PersonValue.page_id == page_id)
        .where(PersonValue.type == data["type"])
    )
    max_order = result.scalar() or -1

    value = PersonValue(
        id=uuid.uuid4(),
        page_id=page_id,
        type=data["type"],
        text=data["text"],
        sort_order=data.get("sort_order", max_order + 1),
    )
    db.add(value)
    await db.commit()
    await db.refresh(value)
    return value


async def list_person_values(db: AsyncSession, page_id: uuid.UUID) -> list[PersonValue]:
    """List all person values for a page."""
    result = await db.execute(
        select(PersonValue)
        .where(PersonValue.page_id == page_id)
        .order_by(PersonValue.type, PersonValue.sort_order)
    )
    return list(result.scalars().all())


async def list_person_values_grouped(
    db: AsyncSession,
    page_id: uuid.UUID
) -> dict[str, list[PersonValue]]:
    """List person values grouped by type."""
    values = await list_person_values(db, page_id)
    grouped = {
        "values": [],
        "beliefs": [],
        "principles": [],
    }
    for v in values:
        if v.type == ValueType.VALUE:
            grouped["values"].append(v)
        elif v.type == ValueType.BELIEF:
            grouped["beliefs"].append(v)
        elif v.type == ValueType.PRINCIPLE:
            grouped["principles"].append(v)
    return grouped


async def get_person_value(db: AsyncSession, value_id: uuid.UUID) -> PersonValue | None:
    """Get a person value by ID."""
    result = await db.execute(select(PersonValue).where(PersonValue.id == value_id))
    return result.scalar_one_or_none()


async def update_person_value(
    db: AsyncSession,
    value: PersonValue,
    data: dict
) -> PersonValue:
    """Update a person value."""
    for key, val in data.items():
        if val is not None:
            setattr(value, key, val)
    await db.commit()
    await db.refresh(value)
    return value


async def delete_person_value(db: AsyncSession, value_id: uuid.UUID) -> None:
    """Delete a person value."""
    await db.execute(delete(PersonValue).where(PersonValue.id == value_id))
    await db.commit()


async def create_quote(
    db: AsyncSession,
    page_id: uuid.UUID,
    data: dict
) -> Quote:
    """Create a quote for a page."""
    result = await db.execute(
        select(func.coalesce(func.max(Quote.sort_order), -1))
        .where(Quote.page_id == page_id)
    )
    max_order = result.scalar() or -1

    quote = Quote(
        id=uuid.uuid4(),
        page_id=page_id,
        text=data["text"],
        source=data.get("source"),
        sort_order=data.get("sort_order", max_order + 1),
    )
    db.add(quote)
    await db.commit()
    await db.refresh(quote)
    return quote


async def list_quotes(db: AsyncSession, page_id: uuid.UUID) -> list[Quote]:
    """List all quotes for a page."""
    result = await db.execute(
        select(Quote)
        .where(Quote.page_id == page_id)
        .order_by(Quote.sort_order)
    )
    return list(result.scalars().all())


async def get_quote(db: AsyncSession, quote_id: uuid.UUID) -> Quote | None:
    """Get a quote by ID."""
    result = await db.execute(select(Quote).where(Quote.id == quote_id))
    return result.scalar_one_or_none()


async def update_quote(
    db: AsyncSession,
    quote: Quote,
    data: dict
) -> Quote:
    """Update a quote."""
    for key, value in data.items():
        if value is not None:
            setattr(quote, key, value)
    await db.commit()
    await db.refresh(quote)
    return quote


async def delete_quote(db: AsyncSession, quote_id: uuid.UUID) -> None:
    """Delete a quote."""
    await db.execute(delete(Quote).where(Quote.id == quote_id))
    await db.commit()


async def create_memorial_message(
    db: AsyncSession,
    page_id: uuid.UUID,
    data: dict,
    author_user_id: uuid.UUID | None = None,
) -> MemorialMessage:
    """Create a memorial message (guestbook entry)."""
    message = MemorialMessage(
        id=uuid.uuid4(),
        page_id=page_id,
        author_name=data["author_name"],
        author_user_id=author_user_id,
        text=data["text"],
        is_approved=False,
    )
    db.add(message)
    await db.commit()
    await db.refresh(message)
    return message


async def list_memorial_messages(
    db: AsyncSession,
    page_id: uuid.UUID,
    only_approved: bool = True
) -> list[MemorialMessage]:
    """List memorial messages for a page."""
    query = select(MemorialMessage).where(MemorialMessage.page_id == page_id)
    if only_approved:
        query = query.where(MemorialMessage.is_approved == True)
    query = query.order_by(MemorialMessage.created_at.desc())
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_memorial_message(db: AsyncSession, message_id: uuid.UUID) -> MemorialMessage | None:
    """Get a memorial message by ID."""
    result = await db.execute(select(MemorialMessage).where(MemorialMessage.id == message_id))
    return result.scalar_one_or_none()


async def approve_memorial_message(
    db: AsyncSession,
    message: MemorialMessage,
    approved_by_user_id: uuid.UUID
) -> MemorialMessage:
    """Approve a memorial message."""
    message.is_approved = True
    message.approved_by_user_id = approved_by_user_id
    message.approved_at = datetime.utcnow()
    await db.commit()
    await db.refresh(message)
    return message


async def reject_memorial_message(
    db: AsyncSession,
    message: MemorialMessage
) -> MemorialMessage:
    """Reject (unapprove) a memorial message."""
    message.is_approved = False
    message.approved_by_user_id = None
    message.approved_at = None
    await db.commit()
    await db.refresh(message)
    return message


async def delete_memorial_message(db: AsyncSession, message_id: uuid.UUID) -> None:
    """Delete a memorial message."""
    await db.execute(delete(MemorialMessage).where(MemorialMessage.id == message_id))
    await db.commit()


async def get_full_page_content(
    db: AsyncSession,
    page_id: uuid.UUID,
    include_unapproved_messages: bool = False,
) -> dict:
    """Get all extended content for a page."""
    return {
        "life_events": await list_life_events(db, page_id),
        "achievements": await list_achievements(db, page_id),
        "education": await list_education(db, page_id),
        "career": await list_career(db, page_id),
        "values": await list_person_values_grouped(db, page_id),
        "quotes": await list_quotes(db, page_id),
        "memorial_messages": await list_memorial_messages(
            db, page_id, only_approved=not include_unapproved_messages
        ),
    }


async def reorder_items(
    db: AsyncSession,
    model_class,
    page_id: uuid.UUID,
    item_ids: list[uuid.UUID],
) -> None:
    """Reorder items by setting sort_order based on position in item_ids list."""
    for idx, item_id in enumerate(item_ids):
        result = await db.execute(
            select(model_class)
            .where(model_class.id == item_id)
            .where(model_class.page_id == page_id)
        )
        item = result.scalar_one_or_none()
        if item:
            item.sort_order = idx
    await db.commit()
