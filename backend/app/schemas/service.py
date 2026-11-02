from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from decimal import Decimal
from datetime import date, datetime

class ServiceRateBase(BaseModel):
    uom: str = "sq_ft"
    rate: Decimal = Field(..., ge=0)
    effective_from: date = Field(default_factory=date.today)
    effective_to: Optional[date] = None
    is_current: bool = True
    min_area: Optional[Decimal] = None
    max_area: Optional[Decimal] = None

class ServiceRateCreate(ServiceRateBase):
    pass

class ServiceRateResponse(ServiceRateBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    service_id: str
    created_at: datetime

class ServiceBase(BaseModel):
    service_code: str
    service_name: str
    category: str  # cleaning, painting, equipment_sales, spare_parts, repair_service, rental, amc
    quotation_type: str = "area_based"
    description: Optional[str] = None
    default_uom: str = "sq_ft"
    hsn_sac_code: Optional[str] = "998533"
    standard_rate: Decimal = Field(..., ge=0)
    tax_category: str = "taxable"
    default_tax_rate: Decimal = Field(Decimal("18.00"), ge=0, le=100)
    is_active: bool = True
    internal_notes: Optional[str] = None

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(BaseModel):
    service_name: Optional[str] = None
    category: Optional[str] = None
    quotation_type: Optional[str] = None
    description: Optional[str] = None
    default_uom: Optional[str] = None
    hsn_sac_code: Optional[str] = None
    standard_rate: Optional[Decimal] = None
    tax_category: Optional[str] = None
    default_tax_rate: Optional[Decimal] = None
    is_active: Optional[bool] = None
    internal_notes: Optional[str] = None

class ServiceResponse(ServiceBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    created_at: datetime
    updated_at: datetime
    rates: List[ServiceRateResponse] = []
