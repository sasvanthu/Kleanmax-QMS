from pydantic import BaseModel, ConfigDict
from typing import Optional

class CompanySettingSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: Optional[str] = None
    company_code: Optional[str] = "kleanmaxpro"
    company_name: Optional[str] = "Klean Max Pro"
    legal_name: Optional[str] = None
    gstin: Optional[str] = None
    pan: Optional[str] = None
    cin: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    state_code: Optional[str] = None
    pincode: Optional[str] = None
    phone1: Optional[str] = None
    phone2: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    bank_name: Optional[str] = None
    bank_account_name: Optional[str] = None
    bank_account_no: Optional[str] = None
    bank_ifsc: Optional[str] = None
    bank_branch: Optional[str] = None
    logo_url: Optional[str] = None
    quotation_prefix: Optional[str] = "KMP"
    default_validity_days: Optional[int] = 30
    rounding_policy: Optional[str] = "HALF_UP"
    tagline: Optional[str] = None
    brand_color: Optional[str] = "#FED10C"
    signatory_name: Optional[str] = "Mr. Manikandan Balamurugan"
    signatory_designation: Optional[str] = "Sales and Service Head"
    default_payment_terms: Optional[str] = None
    default_delivery_terms: Optional[str] = None
    default_warranty_terms: Optional[str] = None
    terms_and_conditions: Optional[str] = None
    about_us: Optional[str] = None
