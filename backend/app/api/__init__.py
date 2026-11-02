from fastapi import APIRouter
from backend.app.api.auth import router as auth_router
from backend.app.api.company import router as company_router
from backend.app.api.customers import router as customers_router
from backend.app.api.services import router as services_router
from backend.app.api.quotations import router as quotations_router
from backend.app.api.audit import router as audit_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(company_router)
api_router.include_router(customers_router)
api_router.include_router(services_router)
api_router.include_router(quotations_router)
api_router.include_router(audit_router)
