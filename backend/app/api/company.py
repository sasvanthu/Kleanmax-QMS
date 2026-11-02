from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.security import get_current_user, require_roles
from backend.app.models.all_models import CompanySetting, Profile
from backend.app.schemas.company import CompanySettingSchema

router = APIRouter(prefix="/company", tags=["Company Settings"])


@router.get("", response_model=CompanySettingSchema)
def get_company_settings(db: Session = Depends(get_db)):
    company = db.query(CompanySetting).first()
    if not company:
        # Create default
        company = CompanySetting()
        db.add(company)
        db.commit()
        db.refresh(company)
    return company


@router.put("", response_model=CompanySettingSchema)
def update_company_settings(
    data: CompanySettingSchema,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(require_roles(["admin"]))
):
    company = db.query(CompanySetting).first()
    if not company:
        company = CompanySetting()
        db.add(company)

    for field, val in data.model_dump(exclude_unset=True).items():
        if field != "id" and hasattr(company, field):
            setattr(company, field, val)

    db.commit()
    db.refresh(company)
    return company
