from decimal import Decimal, ROUND_HALF_UP, ROUND_UP, ROUND_DOWN
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator

# Exact conversion specified in requirements: 1 square metre = 10.7639104167 square feet
SQ_M_TO_SQ_FT = Decimal("10.7639104167")
SQ_FT_TO_SQ_M = Decimal("1") / SQ_M_TO_SQ_FT

TWO_PLACES = Decimal("0.01")
FOUR_PLACES = Decimal("0.0001")


def quantize_2(val: Decimal, rounding=ROUND_HALF_UP) -> Decimal:
    """Quantize to 2 decimal places."""
    return val.quantize(TWO_PLACES, rounding=rounding)


def quantize_4(val: Decimal, rounding=ROUND_HALF_UP) -> Decimal:
    """Quantize to 4 decimal places."""
    return val.quantize(FOUR_PLACES, rounding=rounding)


class SectionCalculationInput(BaseModel):
    section_name: str = "Area Section"
    length: Decimal = Field(..., gt=0, description="Length must be greater than 0")
    breadth: Decimal = Field(..., gt=0, description="Breadth must be greater than 0")
    measurement_unit: str = Field("ft", description="'ft', 'm', 'sq_ft', 'sq_m'")
    repetitions: int = Field(1, ge=1, description="Number of identical areas")
    rate_uom: str = Field("sq_ft", description="Target rate unit: 'sq_ft' or 'sq_m'")
    applied_rate: Decimal = Field(..., ge=0, description="Rate per billable UOM")
    discount_percent: Decimal = Field(Decimal("0.00"), ge=0, le=100)
    service_id: Optional[str] = None
    service_name: Optional[str] = None
    rate_source: str = "catalogue"
    original_catalogue_rate: Decimal = Decimal("0.0000")
    override_reason: Optional[str] = None

    @field_validator("measurement_unit")
    @classmethod
    def validate_unit(cls, v: str) -> str:
        valid_units = {"ft", "m", "sq_ft", "sq_m"}
        if v.lower() not in valid_units:
            raise ValueError(f"Invalid measurement unit: {v}. Must be one of {valid_units}")
        return v.lower()

    @field_validator("rate_uom")
    @classmethod
    def validate_rate_uom(cls, v: str) -> str:
        valid = {"sq_ft", "sq_m"}
        if v.lower() not in valid:
            raise ValueError(f"Rate UOM must be 'sq_ft' or 'sq_m', got {v}")
        return v.lower()


class SectionCalculationResult(BaseModel):
    section_name: str
    length: Decimal
    breadth: Decimal
    measurement_unit: str
    calculated_area: Decimal
    repetitions: int
    billable_area: Decimal
    billable_uom: str
    applied_rate: Decimal
    rate_source: str
    original_catalogue_rate: Decimal
    override_reason: Optional[str]
    discount_percent: Decimal
    line_total: Decimal


class ItemCalculationInput(BaseModel):
    item_name: str
    quantity: Decimal = Field(Decimal("1.0000"), ge=0)
    uom: str = "nos"
    unit_price: Decimal = Field(..., ge=0)
    discount_percent: Decimal = Field(Decimal("0.00"), ge=0, le=100)
    tax_rate: Decimal = Field(Decimal("18.00"), ge=0, le=100)
    service_id: Optional[str] = None
    item_code: Optional[str] = None
    description: Optional[str] = None
    hsn_sac: Optional[str] = None
    rate_source: str = "catalogue"
    original_catalogue_rate: Decimal = Decimal("0.0000")
    override_reason: Optional[str] = None


class ItemCalculationResult(BaseModel):
    item_name: str
    quantity: Decimal
    uom: str
    unit_price: Decimal
    discount_percent: Decimal
    line_total: Decimal
    tax_rate: Decimal
    taxable_value: Decimal


class QuotationCalculationRequest(BaseModel):
    sections: List[SectionCalculationInput] = []
    items: List[ItemCalculationInput] = []
    discount_type: str = Field("none", description="'none', 'percentage', 'fixed'")
    discount_value: Decimal = Field(Decimal("0.00"), ge=0)
    freight_charges: Decimal = Field(Decimal("0.00"), ge=0)
    packing_charges: Decimal = Field(Decimal("0.00"), ge=0)
    other_charges: Decimal = Field(Decimal("0.00"), ge=0)
    customer_state_code: str = Field("33", description="GST State code of customer, e.g. '33' for TN")
    company_state_code: str = Field("33", description="GST State code of Klean Max Pro ('33')")
    tax_rate: Decimal = Field(Decimal("18.00"), ge=0, le=100)
    rounding_policy: str = Field("HALF_UP", description="'HALF_UP', 'ROUND_UP', 'ROUND_DOWN', 'NONE'")


class QuotationCalculationResult(BaseModel):
    sections: List[SectionCalculationResult]
    items: List[ItemCalculationResult]
    subtotal: Decimal
    discount_type: str
    discount_value: Decimal
    total_discount: Decimal
    freight_charges: Decimal
    packing_charges: Decimal
    other_charges: Decimal
    taxable_amount: Decimal
    is_interstate: bool
    tax_rate: Decimal
    cgst_rate: Decimal
    cgst_amount: Decimal
    sgst_rate: Decimal
    sgst_amount: Decimal
    igst_rate: Decimal
    igst_amount: Decimal
    total_tax: Decimal
    rounding_adjustment: Decimal
    final_amount: Decimal
    amount_in_words: str


def calculate_section_area_and_price(s: SectionCalculationInput) -> SectionCalculationResult:
    """Authoritative area and pricing calculation for a rectangular section."""
    length = quantize_4(s.length)
    breadth = quantize_4(s.breadth)
    reps = s.repetitions
    unit = s.measurement_unit.lower()
    rate_uom = s.rate_uom.lower()

    # Raw area in input unit
    raw_area = quantize_4(length * breadth)

    # Convert area to rate UOM if they differ
    # Supported inputs: 'ft' (yields sq_ft), 'm' (yields sq_m), 'sq_ft', 'sq_m'
    if unit in ("ft", "sq_ft"):
        input_area_sq_ft = raw_area
        if rate_uom == "sq_m":
            billable_single_area = quantize_4(input_area_sq_ft / SQ_M_TO_SQ_FT)
        else:
            billable_single_area = input_area_sq_ft
    elif unit in ("m", "sq_m"):
        input_area_sq_m = raw_area
        if rate_uom == "sq_ft":
            billable_single_area = quantize_4(input_area_sq_m * SQ_M_TO_SQ_FT)
        else:
            billable_single_area = input_area_sq_m
    else:
        raise ValueError(f"Unsupported measurement unit: {unit}")

    # Total billable area across identical repetitions
    total_billable_area = quantize_4(billable_single_area * Decimal(reps))

    # Base line amount
    base_line = total_billable_area * s.applied_rate

    # Section-level discount if any
    disc_val = Decimal("0.00")
    if s.discount_percent > 0:
        disc_val = base_line * (s.discount_percent / Decimal("100"))

    line_total = quantize_2(base_line - disc_val)

    return SectionCalculationResult(
        section_name=s.section_name,
        length=length,
        breadth=breadth,
        measurement_unit=s.measurement_unit,
        calculated_area=raw_area,
        repetitions=reps,
        billable_area=total_billable_area,
        billable_uom=rate_uom,
        applied_rate=s.applied_rate,
        rate_source=s.rate_source,
        original_catalogue_rate=s.original_catalogue_rate,
        override_reason=s.override_reason,
        discount_percent=s.discount_percent,
        line_total=line_total,
    )


def calculate_item_price(item: ItemCalculationInput) -> ItemCalculationResult:
    """Authoritative calculation for item-based products, spare parts, rentals."""
    qty = quantize_4(item.quantity)
    price = quantize_2(item.unit_price)
    base = quantize_2(qty * price)

    disc_val = Decimal("0.00")
    if item.discount_percent > 0:
        disc_val = quantize_2(base * (item.discount_percent / Decimal("100")))

    taxable = max(Decimal("0.00"), base - disc_val)
    line_total = taxable

    return ItemCalculationResult(
        item_name=item.item_name,
        quantity=qty,
        uom=item.uom,
        unit_price=price,
        discount_percent=item.discount_percent,
        taxable_value=taxable,
        line_total=line_total,
        tax_rate=item.tax_rate,
    )


def calculate_quotation_totals(req: QuotationCalculationRequest) -> QuotationCalculationResult:
    """Complete authoritative quotation financial calculation engine."""
    calculated_sections: List[SectionCalculationResult] = []
    calculated_items: List[ItemCalculationResult] = []

    subtotal = Decimal("0.00")

    for s in req.sections:
        res = calculate_section_area_and_price(s)
        calculated_sections.append(res)
        subtotal += res.line_total

    for item in req.items:
        res_item = calculate_item_price(item)
        calculated_items.append(res_item)
        subtotal += res_item.line_total

    subtotal = quantize_2(subtotal)

    # Discounts
    total_discount = Decimal("0.00")
    if req.discount_type == "percentage":
        if req.discount_value > 100:
            raise ValueError("Discount percentage cannot exceed 100%")
        total_discount = quantize_2(subtotal * (req.discount_value / Decimal("100")))
    elif req.discount_type == "fixed":
        total_discount = quantize_2(min(req.discount_value, subtotal))

    # Additional charges
    freight = quantize_2(req.freight_charges)
    packing = quantize_2(req.packing_charges)
    other = quantize_2(req.other_charges)

    taxable_amount = quantize_2(subtotal - total_discount + freight + packing + other)
    taxable_amount = max(Decimal("0.00"), taxable_amount)

    # Taxes (Interstate vs Intrastate)
    # Klean Max Pro default state code is "33" (Tamil Nadu)
    c_state = (req.customer_state_code or "").strip().zfill(2)
    k_state = (req.company_state_code or "33").strip().zfill(2)
    is_interstate = (c_state != k_state) and bool(c_state)

    tax_rate = quantize_2(req.tax_rate)
    if is_interstate:
        cgst_rate = Decimal("0.00")
        cgst_amount = Decimal("0.00")
        sgst_rate = Decimal("0.00")
        sgst_amount = Decimal("0.00")
        igst_rate = tax_rate
        igst_amount = quantize_2(taxable_amount * (igst_rate / Decimal("100")))
        total_tax = igst_amount
    else:
        cgst_rate = quantize_2(tax_rate / Decimal("2"))
        sgst_rate = quantize_2(tax_rate / Decimal("2"))
        cgst_amount = quantize_2(taxable_amount * (cgst_rate / Decimal("100")))
        sgst_amount = quantize_2(taxable_amount * (sgst_rate / Decimal("100")))
        igst_rate = Decimal("0.00")
        igst_amount = Decimal("0.00")
        total_tax = quantize_2(cgst_amount + sgst_amount)

    raw_final = taxable_amount + total_tax

    # Rounding
    if req.rounding_policy == "HALF_UP":
        final_amount = quantize_2(raw_final.quantize(Decimal("1"), rounding=ROUND_HALF_UP))
        rounding_adjustment = quantize_2(final_amount - raw_final)
    elif req.rounding_policy == "ROUND_UP":
        final_amount = quantize_2(raw_final.quantize(Decimal("1"), rounding=ROUND_UP))
        rounding_adjustment = quantize_2(final_amount - raw_final)
    elif req.rounding_policy == "ROUND_DOWN":
        final_amount = quantize_2(raw_final.quantize(Decimal("1"), rounding=ROUND_DOWN))
        rounding_adjustment = quantize_2(final_amount - raw_final)
    else:
        final_amount = quantize_2(raw_final)
        rounding_adjustment = Decimal("0.00")

    words = number_to_indian_currency_words(final_amount)

    return QuotationCalculationResult(
        sections=calculated_sections,
        items=calculated_items,
        subtotal=subtotal,
        discount_type=req.discount_type,
        discount_value=req.discount_value,
        total_discount=total_discount,
        freight_charges=freight,
        packing_charges=packing,
        other_charges=other,
        taxable_amount=taxable_amount,
        is_interstate=is_interstate,
        tax_rate=tax_rate,
        cgst_rate=cgst_rate,
        cgst_amount=cgst_amount,
        sgst_rate=sgst_rate,
        sgst_amount=sgst_amount,
        igst_rate=igst_rate,
        igst_amount=igst_amount,
        total_tax=total_tax,
        rounding_adjustment=rounding_adjustment,
        final_amount=final_amount,
        amount_in_words=words,
    )


ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
        "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
        "Seventeen", "Eighteen", "Nineteen"]

TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]


def _two_digits_to_words(n: int) -> str:
    if n < 20:
        return ONES[n]
    tens = TENS[n // 10]
    ones = ONES[n % 10]
    if ones:
        return f"{tens}-{ones}"
    return tens


def _three_digits_to_words(n: int) -> str:
    if n == 0:
        return ""
    words = []
    hundreds = n // 100
    remainder = n % 100
    if hundreds > 0:
        words.append(f"{ONES[hundreds]} Hundred")
    if remainder > 0:
        words.append(_two_digits_to_words(remainder))
    return " ".join(words)


def number_to_indian_currency_words(amount: Decimal) -> str:
    """Converts a Decimal monetary amount to Indian Currency Words
    e.g. 145250.50 -> 'Rupees One Lakh Forty-Five Thousand Two Hundred Fifty and Paise Fifty Only'
    """
    if amount == 0:
        return "Rupees Zero Only"

    rupees = int(amount)
    paise = int(round((amount - Decimal(rupees)) * 100))

    if rupees == 0 and paise > 0:
        return f"Paise {_two_digits_to_words(paise)} Only"

    parts = []

    # Indian Numbering Hierarchy: Crores (10^7), Lakhs (10^5), Thousands (10^3), Hundreds (10^2)
    crores = rupees // 10000000
    remainder = rupees % 10000000

    lakhs = remainder // 100000
    remainder = remainder % 100000

    thousands = remainder // 1000
    remainder = remainder % 1000

    if crores > 0:
        parts.append(f"{_two_digits_to_words(crores)} Crore")
    if lakhs > 0:
        parts.append(f"{_two_digits_to_words(lakhs)} Lakh")
    if thousands > 0:
        parts.append(f"{_two_digits_to_words(thousands)} Thousand")
    if remainder > 0:
        parts.append(_three_digits_to_words(remainder))

    words = "Rupees " + " ".join(parts).strip()
    if paise > 0:
        words += f" and Paise {_two_digits_to_words(paise)}"
    words += " Only"

    # Clean redundant double spaces
    return " ".join(words.split())
