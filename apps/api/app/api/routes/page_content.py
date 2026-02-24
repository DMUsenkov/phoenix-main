"""API routes for extended page content - life events, achievements, etc."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import CurrentUser, require_active_user
from app.db.session import get_db
from app.models import (
    MemorialPage,
    LifeEvent,
    Achievement,
    Education,
    Career,
    PersonValue,
    Quote,
    MemorialMessage,
)
from app.api.schemas.page_content import (
    LifeEventCreate,
    LifeEventUpdate,
    LifeEventResponse,
    AchievementCreate,
    AchievementUpdate,
    AchievementResponse,
    EducationCreate,
    EducationUpdate,
    EducationResponse,
    CareerCreate,
    CareerUpdate,
    CareerResponse,
    PersonValueCreate,
    PersonValueUpdate,
    PersonValueResponse,
    PersonValuesGrouped,
    QuoteCreate,
    QuoteUpdate,
    QuoteResponse,
    MemorialMessageCreate,
    MemorialMessageResponse,
    MemorialMessagePublicResponse,
    ReorderItemsRequest,
    PageContentResponse,
)
from app.services import page_content_service
from app.services.page_service import get_page_by_id

router = APIRouter(tags=["page-content"])

DbSession = Annotated[AsyncSession, Depends(get_db)]
ActiveUser = Annotated[CurrentUser, Depends(require_active_user)]


async def get_page_with_access(
    db: DbSession,
    page_id: uuid.UUID,
    user: ActiveUser,
    require_write: bool = True,
) -> MemorialPage:
    """Get page and verify user has access."""
    from sqlalchemy import select
    from app.models import OrganizationMember

    page = await get_page_by_id(db, page_id)
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")


    is_owner = page.owner_user_id == user.id
    is_admin = user.role.value == "admin"


    is_org_member = False
    if page.owner_org_id:
        result = await db.execute(
            select(OrganizationMember.id).where(
                OrganizationMember.org_id == page.owner_org_id,
                OrganizationMember.user_id == user.id,
                OrganizationMember.role.in_(["owner", "admin", "editor", "org_admin", "org_editor"]),
            )
        )
        is_org_member = result.scalar_one_or_none() is not None

    if not is_owner and not is_admin and not is_org_member:
        raise HTTPException(status_code=403, detail="Access denied")

    return page


@router.post("/pages/{page_id}/life-events", response_model=LifeEventResponse)
async def create_life_event(
    page_id: uuid.UUID,
    data: LifeEventCreate,
    db: DbSession,
    user: ActiveUser,
):
    """Create a life event for a page."""
    await get_page_with_access(db, page_id, user)
    event = await page_content_service.create_life_event(db, page_id, data.model_dump())
    return event


@router.get("/pages/{page_id}/life-events", response_model=list[LifeEventResponse])
async def list_life_events(
    page_id: uuid.UUID,
    db: DbSession,
    user: ActiveUser,
):
    """List all life events for a page."""
    await get_page_with_access(db, page_id, user, require_write=False)
    return await page_content_service.list_life_events(db, page_id)


@router.patch("/life-events/{event_id}", response_model=LifeEventResponse)
async def update_life_event(
    event_id: uuid.UUID,
    data: LifeEventUpdate,
    db: DbSession,
    user: ActiveUser,
):
    """Update a life event."""
    event = await page_content_service.get_life_event(db, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Life event not found")
    await get_page_with_access(db, event.page_id, user)
    return await page_content_service.update_life_event(
        db, event, data.model_dump(exclude_unset=True)
    )


@router.delete("/life-events/{event_id}")
async def delete_life_event(
    event_id: uuid.UUID,
    db: DbSession,
    user: ActiveUser,
):
    """Delete a life event."""
    event = await page_content_service.get_life_event(db, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Life event not found")
    await get_page_with_access(db, event.page_id, user)
    await page_content_service.delete_life_event(db, event_id)
    return {"message": "Life event deleted"}


@router.post("/pages/{page_id}/life-events/reorder")
async def reorder_life_events(
    page_id: uuid.UUID,
    data: ReorderItemsRequest,
    db: DbSession,
    user: ActiveUser,
):
    """Reorder life events."""
    await get_page_with_access(db, page_id, user)
    await page_content_service.reorder_items(db, LifeEvent, page_id, data.item_ids)
    return {"message": "Life events reordered"}


@router.post("/pages/{page_id}/achievements", response_model=AchievementResponse)
async def create_achievement(
    page_id: uuid.UUID,
    data: AchievementCreate,
    db: DbSession,
    user: ActiveUser,
):
    """Create an achievement for a page."""
    await get_page_with_access(db, page_id, user)
    achievement = await page_content_service.create_achievement(db, page_id, data.model_dump())
    return achievement


@router.get("/pages/{page_id}/achievements", response_model=list[AchievementResponse])
async def list_achievements(
    page_id: uuid.UUID,
    db: DbSession,
    user: ActiveUser,
):
    """List all achievements for a page."""
    await get_page_with_access(db, page_id, user, require_write=False)
    return await page_content_service.list_achievements(db, page_id)


@router.patch("/achievements/{achievement_id}", response_model=AchievementResponse)
async def update_achievement(
    achievement_id: uuid.UUID,
    data: AchievementUpdate,
    db: DbSession,
    user: ActiveUser,
):
    """Update an achievement."""
    achievement = await page_content_service.get_achievement(db, achievement_id)
    if not achievement:
        raise HTTPException(status_code=404, detail="Achievement not found")
    await get_page_with_access(db, achievement.page_id, user)
    return await page_content_service.update_achievement(
        db, achievement, data.model_dump(exclude_unset=True)
    )


@router.delete("/achievements/{achievement_id}")
async def delete_achievement(
    achievement_id: uuid.UUID,
    db: DbSession,
    user: ActiveUser,
):
    """Delete an achievement."""
    achievement = await page_content_service.get_achievement(db, achievement_id)
    if not achievement:
        raise HTTPException(status_code=404, detail="Achievement not found")
    await get_page_with_access(db, achievement.page_id, user)
    await page_content_service.delete_achievement(db, achievement_id)
    return {"message": "Achievement deleted"}


@router.post("/pages/{page_id}/achievements/reorder")
async def reorder_achievements(
    page_id: uuid.UUID,
    data: ReorderItemsRequest,
    db: DbSession,
    user: ActiveUser,
):
    """Reorder achievements."""
    await get_page_with_access(db, page_id, user)
    await page_content_service.reorder_items(db, Achievement, page_id, data.item_ids)
    return {"message": "Achievements reordered"}


@router.post("/pages/{page_id}/education", response_model=EducationResponse)
async def create_education(
    page_id: uuid.UUID,
    data: EducationCreate,
    db: DbSession,
    user: ActiveUser,
):
    """Create an education record for a page."""
    await get_page_with_access(db, page_id, user)
    education = await page_content_service.create_education(db, page_id, data.model_dump())
    return education


@router.get("/pages/{page_id}/education", response_model=list[EducationResponse])
async def list_education(
    page_id: uuid.UUID,
    db: DbSession,
    user: ActiveUser,
):
    """List all education records for a page."""
    await get_page_with_access(db, page_id, user, require_write=False)
    return await page_content_service.list_education(db, page_id)


@router.patch("/education/{education_id}", response_model=EducationResponse)
async def update_education(
    education_id: uuid.UUID,
    data: EducationUpdate,
    db: DbSession,
    user: ActiveUser,
):
    """Update an education record."""
    education = await page_content_service.get_education(db, education_id)
    if not education:
        raise HTTPException(status_code=404, detail="Education record not found")
    await get_page_with_access(db, education.page_id, user)
    return await page_content_service.update_education(
        db, education, data.model_dump(exclude_unset=True)
    )


@router.delete("/education/{education_id}")
async def delete_education(
    education_id: uuid.UUID,
    db: DbSession,
    user: ActiveUser,
):
    """Delete an education record."""
    education = await page_content_service.get_education(db, education_id)
    if not education:
        raise HTTPException(status_code=404, detail="Education record not found")
    await get_page_with_access(db, education.page_id, user)
    await page_content_service.delete_education(db, education_id)
    return {"message": "Education record deleted"}


@router.post("/pages/{page_id}/education/reorder")
async def reorder_education(
    page_id: uuid.UUID,
    data: ReorderItemsRequest,
    db: DbSession,
    user: ActiveUser,
):
    """Reorder education records."""
    await get_page_with_access(db, page_id, user)
    await page_content_service.reorder_items(db, Education, page_id, data.item_ids)
    return {"message": "Education records reordered"}


@router.post("/pages/{page_id}/career", response_model=CareerResponse)
async def create_career(
    page_id: uuid.UUID,
    data: CareerCreate,
    db: DbSession,
    user: ActiveUser,
):
    """Create a career record for a page."""
    await get_page_with_access(db, page_id, user)
    career = await page_content_service.create_career(db, page_id, data.model_dump())
    return career


@router.get("/pages/{page_id}/career", response_model=list[CareerResponse])
async def list_career(
    page_id: uuid.UUID,
    db: DbSession,
    user: ActiveUser,
):
    """List all career records for a page."""
    await get_page_with_access(db, page_id, user, require_write=False)
    return await page_content_service.list_career(db, page_id)


@router.patch("/career/{career_id}", response_model=CareerResponse)
async def update_career(
    career_id: uuid.UUID,
    data: CareerUpdate,
    db: DbSession,
    user: ActiveUser,
):
    """Update a career record."""
    career = await page_content_service.get_career(db, career_id)
    if not career:
        raise HTTPException(status_code=404, detail="Career record not found")
    await get_page_with_access(db, career.page_id, user)
    return await page_content_service.update_career(
        db, career, data.model_dump(exclude_unset=True)
    )


@router.delete("/career/{career_id}")
async def delete_career(
    career_id: uuid.UUID,
    db: DbSession,
    user: ActiveUser,
):
    """Delete a career record."""
    career = await page_content_service.get_career(db, career_id)
    if not career:
        raise HTTPException(status_code=404, detail="Career record not found")
    await get_page_with_access(db, career.page_id, user)
    await page_content_service.delete_career(db, career_id)
    return {"message": "Career record deleted"}


@router.post("/pages/{page_id}/career/reorder")
async def reorder_career(
    page_id: uuid.UUID,
    data: ReorderItemsRequest,
    db: DbSession,
    user: ActiveUser,
):
    """Reorder career records."""
    await get_page_with_access(db, page_id, user)
    await page_content_service.reorder_items(db, Career, page_id, data.item_ids)
    return {"message": "Career records reordered"}


@router.post("/pages/{page_id}/values", response_model=PersonValueResponse)
async def create_person_value(
    page_id: uuid.UUID,
    data: PersonValueCreate,
    db: DbSession,
    user: ActiveUser,
):
    """Create a value/belief/principle for a page."""
    await get_page_with_access(db, page_id, user)
    value = await page_content_service.create_person_value(db, page_id, data.model_dump())
    return value


@router.get("/pages/{page_id}/values", response_model=list[PersonValueResponse])
async def list_person_values(
    page_id: uuid.UUID,
    db: DbSession,
    user: ActiveUser,
):
    """List all values/beliefs/principles for a page."""
    await get_page_with_access(db, page_id, user, require_write=False)
    return await page_content_service.list_person_values(db, page_id)


@router.get("/pages/{page_id}/values/grouped", response_model=PersonValuesGrouped)
async def list_person_values_grouped(
    page_id: uuid.UUID,
    db: DbSession,
    user: ActiveUser,
):
    """List values/beliefs/principles grouped by type."""
    await get_page_with_access(db, page_id, user, require_write=False)
    grouped = await page_content_service.list_person_values_grouped(db, page_id)
    return PersonValuesGrouped(
        values=[PersonValueResponse.model_validate(v) for v in grouped["values"]],
        beliefs=[PersonValueResponse.model_validate(v) for v in grouped["beliefs"]],
        principles=[PersonValueResponse.model_validate(v) for v in grouped["principles"]],
    )


@router.patch("/values/{value_id}", response_model=PersonValueResponse)
async def update_person_value(
    value_id: uuid.UUID,
    data: PersonValueUpdate,
    db: DbSession,
    user: ActiveUser,
):
    """Update a value/belief/principle."""
    value = await page_content_service.get_person_value(db, value_id)
    if not value:
        raise HTTPException(status_code=404, detail="Value not found")
    await get_page_with_access(db, value.page_id, user)
    return await page_content_service.update_person_value(
        db, value, data.model_dump(exclude_unset=True)
    )


@router.delete("/values/{value_id}")
async def delete_person_value(
    value_id: uuid.UUID,
    db: DbSession,
    user: ActiveUser,
):
    """Delete a value/belief/principle."""
    value = await page_content_service.get_person_value(db, value_id)
    if not value:
        raise HTTPException(status_code=404, detail="Value not found")
    await get_page_with_access(db, value.page_id, user)
    await page_content_service.delete_person_value(db, value_id)
    return {"message": "Value deleted"}


@router.post("/pages/{page_id}/quotes", response_model=QuoteResponse)
async def create_quote(
    page_id: uuid.UUID,
    data: QuoteCreate,
    db: DbSession,
    user: ActiveUser,
):
    """Create a quote for a page."""
    await get_page_with_access(db, page_id, user)
    quote = await page_content_service.create_quote(db, page_id, data.model_dump())
    return quote


@router.get("/pages/{page_id}/quotes", response_model=list[QuoteResponse])
async def list_quotes(
    page_id: uuid.UUID,
    db: DbSession,
    user: ActiveUser,
):
    """List all quotes for a page."""
    await get_page_with_access(db, page_id, user, require_write=False)
    return await page_content_service.list_quotes(db, page_id)


@router.patch("/quotes/{quote_id}", response_model=QuoteResponse)
async def update_quote(
    quote_id: uuid.UUID,
    data: QuoteUpdate,
    db: DbSession,
    user: ActiveUser,
):
    """Update a quote."""
    quote = await page_content_service.get_quote(db, quote_id)
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    await get_page_with_access(db, quote.page_id, user)
    return await page_content_service.update_quote(
        db, quote, data.model_dump(exclude_unset=True)
    )


@router.delete("/quotes/{quote_id}")
async def delete_quote(
    quote_id: uuid.UUID,
    db: DbSession,
    user: ActiveUser,
):
    """Delete a quote."""
    quote = await page_content_service.get_quote(db, quote_id)
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    await get_page_with_access(db, quote.page_id, user)
    await page_content_service.delete_quote(db, quote_id)
    return {"message": "Quote deleted"}


@router.post("/pages/{page_id}/quotes/reorder")
async def reorder_quotes(
    page_id: uuid.UUID,
    data: ReorderItemsRequest,
    db: DbSession,
    user: ActiveUser,
):
    """Reorder quotes."""
    await get_page_with_access(db, page_id, user)
    await page_content_service.reorder_items(db, Quote, page_id, data.item_ids)
    return {"message": "Quotes reordered"}


@router.post("/pages/{page_id}/messages", response_model=MemorialMessageResponse)
async def create_memorial_message(
    page_id: uuid.UUID,
    data: MemorialMessageCreate,
    db: DbSession,
    user: ActiveUser,
):
    """Create a memorial message (guestbook entry). Requires approval."""

    page = await get_page_by_id(db, page_id)
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    message = await page_content_service.create_memorial_message(
        db, page_id, data.model_dump(), author_user_id=user.id
    )
    return message


@router.get("/pages/{page_id}/messages", response_model=list[MemorialMessageResponse])
async def list_memorial_messages(
    page_id: uuid.UUID,
    db: DbSession,
    user: ActiveUser,
    include_pending: bool = False,
):
    """List memorial messages. Owner/admin can see pending messages."""
    page = await get_page_by_id(db, page_id)
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")


    is_owner = page.owner_user_id == user.id
    is_admin = user.role.value == "admin"
    only_approved = not (include_pending and (is_owner or is_admin))

    return await page_content_service.list_memorial_messages(db, page_id, only_approved)


@router.post("/messages/{message_id}/approve", response_model=MemorialMessageResponse)
async def approve_memorial_message(
    message_id: uuid.UUID,
    db: DbSession,
    user: ActiveUser,
):
    """Approve a memorial message. Only page owner or admin."""
    message = await page_content_service.get_memorial_message(db, message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    await get_page_with_access(db, message.page_id, user)
    return await page_content_service.approve_memorial_message(db, message, user.id)


@router.post("/messages/{message_id}/reject", response_model=MemorialMessageResponse)
async def reject_memorial_message(
    message_id: uuid.UUID,
    db: DbSession,
    user: ActiveUser,
):
    """Reject (unapprove) a memorial message. Only page owner or admin."""
    message = await page_content_service.get_memorial_message(db, message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    await get_page_with_access(db, message.page_id, user)
    return await page_content_service.reject_memorial_message(db, message)


@router.delete("/messages/{message_id}")
async def delete_memorial_message(
    message_id: uuid.UUID,
    db: DbSession,
    user: ActiveUser,
):
    """Delete a memorial message. Only page owner or admin."""
    message = await page_content_service.get_memorial_message(db, message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    await get_page_with_access(db, message.page_id, user)
    await page_content_service.delete_memorial_message(db, message_id)
    return {"message": "Memorial message deleted"}


@router.get("/pages/{page_id}/content", response_model=PageContentResponse)
async def get_page_content(
    page_id: uuid.UUID,
    db: DbSession,
    user: ActiveUser,
):
    """Get all extended content for a page."""
    page = await get_page_with_access(db, page_id, user, require_write=False)
    is_owner = page.owner_user_id == user.id
    is_admin = user.role.value == "admin"

    content = await page_content_service.get_full_page_content(
        db, page_id, include_unapproved_messages=(is_owner or is_admin)
    )


    grouped_values = content["values"]
    return PageContentResponse(
        life_events=[LifeEventResponse.model_validate(e) for e in content["life_events"]],
        achievements=[AchievementResponse.model_validate(a) for a in content["achievements"]],
        education=[EducationResponse.model_validate(e) for e in content["education"]],
        career=[CareerResponse.model_validate(c) for c in content["career"]],
        values=PersonValuesGrouped(
            values=[PersonValueResponse.model_validate(v) for v in grouped_values["values"]],
            beliefs=[PersonValueResponse.model_validate(v) for v in grouped_values["beliefs"]],
            principles=[PersonValueResponse.model_validate(v) for v in grouped_values["principles"]],
        ),
        quotes=[QuoteResponse.model_validate(q) for q in content["quotes"]],
        memorial_messages=[MemorialMessagePublicResponse.model_validate(m) for m in content["memorial_messages"]],
    )
