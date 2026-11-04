from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from backend.app.core.database import get_db
from backend.app.core.security import get_current_user, require_roles
from backend.app.models.all_models import Service, ServiceRate, Profile, AuditLog
from backend.app.schemas.service import (
    ServiceCreate, ServiceUpdate, ServiceResponse,
    ServiceRateCreate, ServiceRateResponse
)

router = APIRouter(prefix="/services", tags=["Service Catalogue & Rates"])


@router.get("", response_model=List[ServiceResponse])
def get_services(
    category: Optional[str] = Query(None),
    company_code: Optional[str] = Query(None, description="Filter by company: kleanmaxpro, kleanmax, uniquepainters, cleantech"),
    search: Optional[str] = Query(None, description="Search service name, code, description"),
    is_active: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    query = db.query(Service)
    if company_code:
        # Match exact company_code or general services if None
        query = query.filter(or_(Service.company_code == company_code, Service.company_code.is_(None)))
    if category:
        query = query.filter(Service.category == category)
    if is_active is not None:
        query = query.filter(Service.is_active == is_active)
    if search:
        pat = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Service.service_name.ilike(pat),
                Service.service_code.ilike(pat),
                Service.description.ilike(pat)
            )
        )
    return query.order_by(Service.service_name).all()


@router.post("", response_model=ServiceResponse)
def create_service(
    data: ServiceCreate,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(require_roles(["admin", "manager"]))
):
    existing = db.query(Service).filter(Service.service_code == data.service_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Service code already exists")

    service = Service(**data.model_dump())
    db.add(service)
    db.flush()

    # Create initial rate record
    rate = ServiceRate(
        service_id=service.id,
        uom=service.default_uom,
        rate=service.standard_rate,
        is_current=True,
        created_by_id=current_user.id
    )
    db.add(rate)

    audit = AuditLog(
        entity_type="service",
        entity_id=str(service.id),
        action="create_service",
        performed_by_id=current_user.id,
        changes_json={"service_code": service.service_code, "rate": str(service.standard_rate), "company_code": service.company_code}
    )
    db.add(audit)

    db.commit()
    db.refresh(service)
    return service


@router.get("/{id}", response_model=ServiceResponse)
def get_service(
    id: str,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    service = db.query(Service).filter(Service.id == id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service


@router.patch("/{id}", response_model=ServiceResponse)
def update_service(
    id: str,
    data: ServiceUpdate,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(require_roles(["admin", "manager"]))
):
    service = db.query(Service).filter(Service.id == id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    for field, val in data.model_dump(exclude_unset=True).items():
        if hasattr(service, field):
            setattr(service, field, val)

    db.commit()
    db.refresh(service)
    return service


@router.delete("/{id}")
def delete_service(
    id: str,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(require_roles(["admin"]))
):
    service = db.query(Service).filter(Service.id == id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    db.delete(service)
    db.commit()
    return {"message": "Service successfully deleted"}


@router.get("/{id}/rates", response_model=List[ServiceRateResponse])
def get_service_rates(
    id: str,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    rates = db.query(ServiceRate).filter(ServiceRate.service_id == id).order_by(ServiceRate.created_at.desc()).all()
    return rates


@router.post("/{id}/rates", response_model=ServiceRateResponse)
def add_service_rate(
    id: str,
    data: ServiceRateCreate,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(require_roles(["admin", "manager"]))
):
    service = db.query(Service).filter(Service.id == id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    # Mark existing current rates as non-current if applicable
    if data.is_current:
        db.query(ServiceRate).filter(ServiceRate.service_id == id, ServiceRate.uom == data.uom).update({"is_current": False})
        service.standard_rate = data.rate

    rate = ServiceRate(
        service_id=id,
        uom=data.uom,
        rate=data.rate,
        effective_from=data.effective_from,
        effective_to=data.effective_to,
        is_current=data.is_current,
        min_area=data.min_area,
        max_area=data.max_area,
        created_by_id=current_user.id
    )
    db.add(rate)

    audit = AuditLog(
        entity_type="service_rate",
        entity_id=str(service.id),
        action="add_rate",
        performed_by_id=current_user.id,
        changes_json={"rate": str(data.rate), "uom": data.uom}
    )
    db.add(audit)

    db.commit()
    db.refresh(rate)
    return rate
