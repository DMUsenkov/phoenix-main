from fastapi import APIRouter

from app.api.routes import admin, auth, health, pages, public, media, moderation, objects, map, qr, orgs, org_pages, org_objects, org_moderation, genealogy, analytics, org_reports, page_content

api_router = APIRouter()


api_router.include_router(health.router)


api_router.include_router(auth.router, prefix="/api")


api_router.include_router(admin.router, prefix="/api")


api_router.include_router(pages.router, prefix="/api")


api_router.include_router(public.router, prefix="/api")


api_router.include_router(media.router, prefix="/api")
api_router.include_router(media.pages_media_router, prefix="/api")


api_router.include_router(moderation.router, prefix="/api")


api_router.include_router(objects.router, prefix="/api")


api_router.include_router(map.public_router, prefix="/api")
api_router.include_router(map.private_router, prefix="/api")


api_router.include_router(qr.router, prefix="/api")
api_router.include_router(qr.public_router)


api_router.include_router(orgs.router, prefix="/api")
api_router.include_router(org_pages.router, prefix="/api")
api_router.include_router(org_objects.router, prefix="/api")
api_router.include_router(org_moderation.router, prefix="/api")


api_router.include_router(genealogy.router, prefix="/api")


api_router.include_router(analytics.public_router, prefix="/api")
api_router.include_router(org_reports.router, prefix="/api")


api_router.include_router(page_content.router, prefix="/api")
