from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class CustomerBase(BaseModel):
    customer_code: Optional[str] = None
    company_name: str
    contact_person: Optional[str] = None
    phone: str
    email: Optional[str] = None
    gstin: Optional[str] = None
    pan: Optional[str] = None
    billing_address_line1: str
    billing_address_line2: Optional[str] = None
    billing_city: str = "Chennai"
    billing_state: str = "Tamil Nadu"
    billing_state_code: str = "33"
    billing_pincode: str
    delivery_address_line1: Optional[str] = None
    delivery_address_line2: Optional[str] = None
    delivery_city: Optional[str] = None
    delivery_state: Optional[str] = None
    delivery_state_code: Optional[str] = None
    delivery_pincode: Optional[str] = None
    is_active: bool = True
    notes: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    customer_code: Optional[str] = None
    company_name: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    gstin: Optional[str] = None
    pan: Optional[str] = None
    billing_address_line1: Optional[str] = None
    billing_address_line2: Optional[str] = None
    billing_city: Optional[str] = None
    billing_state: Optional[str] = None
    billing_state_code: Optional[str] = None
    billing_pincode: Optional[str] = None
    delivery_address_line1: Optional[str] = None
    delivery_address_line2: Optional[str] = None
    delivery_city: Optional[str] = None
    delivery_state: Optional[str] = None
    delivery_state_code: Optional[str] = None
    delivery_pincode: Optional[str] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None

class CustomerResponse(CustomerBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    created_at: datetime
    updated_at: datetime
