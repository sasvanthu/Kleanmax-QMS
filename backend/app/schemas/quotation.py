from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from decimal import Decimal
from datetime import date, datetime
from backend.app.schemas.customer import CustomerResponse

class RateOverrideRequest(BaseModel):
    service_id: str
    original_catalogue_rate: Decimal
    overridden_rate: Decimal = Field(..., ge=0)
    override_reason: str = Field(..., min_length=3, description="Mandatory reason for audit log")

class QuotationSectionSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: Optional[str] = None
    section_name: str
    section_order: int = 1
    service_id: Optional[str] = None
    service_name: Optional[str] = 'Service Area'
    length: Decimal = Field(Decimal("1.0000"), ge=0)
    breadth: Decimal = Field(Decimal("1.0000"), ge=0)
    measurement_unit: str = "ft"  # ft, m, sq_ft, sq_m
    calculated_area: Decimal = Decimal("0.0000")
    repetitions: int = Field(1, ge=1)
    billable_area: Decimal = Decimal("0.0000")
    billable_uom: str = "sq_ft"
    rate_source: str = "catalogue"  # catalogue, manual_override
    original_catalogue_rate: Decimal = Decimal("0.0000")
    applied_rate: Decimal = Field(Decimal("0.0000"), ge=0)
    override_reason: Optional[str] = None
    discount_percent: Decimal = Field(Decimal("0.00"), ge=0, le=100)
    line_total: Decimal = Decimal("0.00")
    notes: Optional[str] = None

class QuotationItemSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: Optional[str] = None
    item_order: int = 1
    service_id: Optional[str] = None
    item_code: Optional[str] = None
    item_name: str
    description: Optional[str] = None
    hsn_sac: Optional[str] = None
    quotation_type: str = "item_based"
    quantity: Decimal = Field(Decimal("1.0000"), ge=0)
    uom: str = "nos"
    unit_price: Decimal = Field(Decimal("0.00"), ge=0)
    rate_source: str = "catalogue"
    original_catalogue_rate: Decimal = Decimal("0.0000")
    applied_rate: Decimal = Field(Decimal("0.00"), ge=0)
    override_reason: Optional[str] = None
    discount_type: str = "none"
    discount_value: Decimal = Decimal("0.00")
    taxable_value: Decimal = Decimal("0.00")
    tax_rate: Decimal = Decimal("18.00")
    cgst_amount: Decimal = Decimal("0.00")
    sgst_amount: Decimal = Decimal("0.00")
    igst_amount: Decimal = Decimal("0.00")
    line_total: Decimal = Decimal("0.00")
    notes: Optional[str] = None

class QuotationCreate(BaseModel):
    customer_id: str
    company_code: Optional[str] = "kleanmaxpro"
    quotation_number: Optional[str] = None
    quotation_type: str = "area_based"  # area_based, item_based, repair_service, rental, contract
    quotation_date: date = Field(default_factory=date.today)
    validity_date: Optional[date] = None
    customer_ref: Optional[str] = None
    job_description: Optional[str] = None
    payment_terms: Optional[str] = None
    delivery_terms: Optional[str] = None
    warranty_terms: Optional[str] = None
    terms_and_conditions: Optional[str] = None
    notes: Optional[str] = None
    
    sections: List[QuotationSectionSchema] = []
    items: List[QuotationItemSchema] = []
    
    discount_type: str = "none"
    discount_value: Decimal = Decimal("0.00")
    freight_charges: Decimal = Decimal("0.00")
    packing_charges: Decimal = Decimal("0.00")
    other_charges: Decimal = Decimal("0.00")
    tax_rate: Decimal = Decimal("18.00")
    rounding_policy: str = "HALF_UP"
    snapshot_json: Optional[Any] = None
    client_name: Optional[str] = None
    client_address: Optional[str] = None
    client_gstin: Optional[str] = None
    client_phone: Optional[str] = None
    attention_person: Optional[str] = None
    image_url: Optional[str] = None

class QuotationUpdate(BaseModel):
    company_code: Optional[str] = None
    customer_id: Optional[str] = None
    quotation_type: Optional[str] = None
    quotation_date: Optional[date] = None
    validity_date: Optional[date] = None
    customer_ref: Optional[str] = None
    job_description: Optional[str] = None
    payment_terms: Optional[str] = None
    delivery_terms: Optional[str] = None
    warranty_terms: Optional[str] = None
    terms_and_conditions: Optional[str] = None
    notes: Optional[str] = None
    
    sections: Optional[List[QuotationSectionSchema]] = None
    items: Optional[List[QuotationItemSchema]] = None
    
    discount_type: Optional[str] = None
    discount_value: Optional[Decimal] = None
    freight_charges: Optional[Decimal] = None
    packing_charges: Optional[Decimal] = None
    other_charges: Optional[Decimal] = None
    tax_rate: Optional[Decimal] = None
    rounding_policy: Optional[str] = None
    snapshot_json: Optional[Any] = None
    client_name: Optional[str] = None
    client_address: Optional[str] = None
    client_gstin: Optional[str] = None
    client_phone: Optional[str] = None
    attention_person: Optional[str] = None
    image_url: Optional[str] = None

class RevisionCreateRequest(BaseModel):
    revision_reason: str = Field(..., min_length=3, description="Explanation of why this revision was created")

class QuotationRevisionSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    revision_number: int
    revision_reason: str
    created_at: datetime
    revised_by_name: Optional[str] = None

class QuotationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    company_code: Optional[str] = "kleanmaxpro"
    quotation_number: str
    revision_number: int
    parent_quotation_id: Optional[str] = None
    customer_id: str
    quotation_type: str
    status: str
    quotation_date: date
    validity_date: date
    customer_ref: Optional[str] = None
    job_description: Optional[str] = None
    payment_terms: Optional[str] = None
    delivery_terms: Optional[str] = None
    warranty_terms: Optional[str] = None
    terms_and_conditions: Optional[str] = None
    notes: Optional[str] = None
    
    subtotal: Decimal
    discount_type: str
    discount_value: Decimal
    total_discount: Decimal
    freight_charges: Decimal
    packing_charges: Decimal
    other_charges: Decimal
    taxable_amount: Decimal
    is_interstate: bool
    cgst_rate: Decimal
    cgst_amount: Decimal
    sgst_rate: Decimal
    sgst_amount: Decimal
    igst_rate: Decimal
    igst_amount: Decimal
    total_tax: Decimal
    rounding_adjustment: Decimal
    final_amount: Decimal
    amount_in_words: Optional[str] = None
    image_url: Optional[str] = None
    
    prepared_by_id: Optional[str] = None
    prepared_by_name: Optional[str] = None
    approved_by_id: Optional[str] = None
    approved_by_name: Optional[str] = None
    approved_at: Optional[datetime] = None
    issued_at: Optional[datetime] = None
    
    customer: Optional[CustomerResponse] = None
    sections: List[QuotationSectionSchema] = []
    items: List[QuotationItemSchema] = []
    revisions: List[QuotationRevisionSchema] = []
    
    created_at: datetime
    updated_at: datetime
