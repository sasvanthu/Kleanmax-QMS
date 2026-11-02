from pydantic import BaseModel, ConfigDict
from typing import Optional

class CompanySettingSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: Optional[str] = None
    company_name: str
    legal_name: str
    gstin: Optional[str] = None
    pan: Optional[str] = None
    cin: Optional[str] = None
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    state_code: str
    pincode: str
    phone1: Optional[str] = None
    phone2: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    bank_name: Optional[str] = None
    bank_account_no: Optional[str] = None
    bank_ifsc: Optional[str] = None
    bank_branch: Optional[str] = None
    logo_url: Optional[str] = None
    quotation_prefix: str = "KMP"
    default_validity_days: int = 30
    rounding_policy: str = "HALF_UP"
    default_payment_terms: Optional[str] = None
    default_delivery_terms: Optional[str] = None
    default_warranty_terms: Optional[str] = None
    terms_and_conditions: Optional[str] = None
