from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from backend.app.core.database import get_db
from backend.app.core.security import get_current_user
from backend.app.models.all_models import Customer, Profile
from backend.app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.get("", response_model=List[CustomerResponse])
def get_customers(
    search: Optional[str] = Query(None, description="Search by name, contact, phone, email, GSTIN"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    query = db.query(Customer)
    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Customer.company_name.ilike(search_pattern),
                Customer.contact_person.ilike(search_pattern),
                Customer.phone.ilike(search_pattern),
                Customer.email.ilike(search_pattern),
                Customer.gstin.ilike(search_pattern),
                Customer.customer_code.ilike(search_pattern),
            )
        )
    return query.order_by(Customer.company_name).offset(offset).limit(limit).all()


@router.post("", response_model=CustomerResponse)
def create_customer(
    data: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    # Check if duplicate company name or code
    if data.customer_code:
        existing = db.query(Customer).filter(Customer.customer_code == data.customer_code).first()
        if existing:
            raise HTTPException(status_code=400, detail="Customer code already exists")

    customer = Customer(
        **data.model_dump(),
        created_by_id=current_user.id
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@router.get("/{id}", response_model=CustomerResponse)
def get_customer(
    id: str,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    customer = db.query(Customer).filter(Customer.id == id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.patch("/{id}", response_model=CustomerResponse)
def update_customer(
    id: str,
    data: CustomerUpdate,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    customer = db.query(Customer).filter(Customer.id == id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    for field, val in data.model_dump(exclude_unset=True).items():
        if hasattr(customer, field):
            setattr(customer, field, val)

    db.commit()
    db.refresh(customer)
    return customer
