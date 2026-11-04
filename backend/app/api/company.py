from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.core.database import get_db
from backend.app.core.security import get_current_user, require_roles
from backend.app.models.all_models import CompanySetting, Profile
from backend.app.schemas.company import CompanySettingSchema

router = APIRouter(prefix="/company", tags=["Company Settings"])


@router.get("/all", response_model=List[CompanySettingSchema])
def get_all_companies(db: Session = Depends(get_db)):
    """Fetch all 4 companies for Unified Admin."""
    companies = db.query(CompanySetting).all()
    return companies


@router.get("", response_model=CompanySettingSchema)
def get_company_settings(
    code: Optional[str] = Query(None, description="Optional company_code e.g. kleanmaxpro, kleanmax, uniquepainters, cleantech"),
    db: Session = Depends(get_db)
):
    if code:
        company = db.query(CompanySetting).filter(CompanySetting.company_code == code).first()
        if company:
            return company

    company = db.query(CompanySetting).first()
    if not company:
        company = CompanySetting()
        db.add(company)
        db.commit()
        db.refresh(company)
    return company


@router.get("/{identifier}", response_model=CompanySettingSchema)
def get_company_by_id_or_code(identifier: str, db: Session = Depends(get_db)):
    company = db.query(CompanySetting).filter(
        (CompanySetting.id == identifier) | (CompanySetting.company_code == identifier)
    ).first()
    if not company:
        raise HTTPException(status_code=404, detail=f"Company '{identifier}' not found")
    return company


@router.put("/{identifier}", response_model=CompanySettingSchema)
def update_company_by_identifier(
    identifier: str,
    data: CompanySettingSchema,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(require_roles(["admin"]))
):
    company = db.query(CompanySetting).filter(
        (CompanySetting.id == identifier) | (CompanySetting.company_code == identifier)
    ).first()
    if not company:
        raise HTTPException(status_code=404, detail=f"Company '{identifier}' not found")

    for field, val in data.model_dump(exclude_unset=True).items():
        if field != "id" and hasattr(company, field):
            setattr(company, field, val)

    db.commit()
    db.refresh(company)
    return company


@router.put("", response_model=CompanySettingSchema)
def update_company_settings(
    data: CompanySettingSchema,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(require_roles(["admin"]))
):
    # If company_code is provided in payload, match that company
    target_code = data.company_code
    if target_code:
        company = db.query(CompanySetting).filter(CompanySetting.company_code == target_code).first()
    else:
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
