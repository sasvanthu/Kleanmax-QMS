import pytest
from decimal import Decimal
from pydantic import ValidationError
from backend.app.services.calculator import (
    calculate_section_area_and_price,
    calculate_item_price,
    calculate_quotation_totals,
    number_to_indian_currency_words,
    SectionCalculationInput,
    ItemCalculationInput,
    QuotationCalculationRequest,
    SQ_M_TO_SQ_FT,
)

# 1. Basic Rectangular Area Tests
def test_basic_rectangular_area():
    section = SectionCalculationInput(
        section_name="Warehouse Bay A",
        length=Decimal("50"),
        breadth=Decimal("20"),
        measurement_unit="ft",
        repetitions=1,
        rate_uom="sq_ft",
        applied_rate=Decimal("4.50"),
    )
    result = calculate_section_area_and_price(section)
    assert result.calculated_area == Decimal("1000.0000")
    assert result.billable_area == Decimal("1000.0000")
    assert result.line_total == Decimal("4500.00")


# 2. Repeated Areas (Number of identical areas)
def test_repeated_areas():
    section = SectionCalculationInput(
        section_name="Identical Office Cabins",
        length=Decimal("20"),
        breadth=Decimal("15"),
        measurement_unit="ft",
        repetitions=4,  # 4 identical cabins
        rate_uom="sq_ft",
        applied_rate=Decimal("5.00"),
    )
    result = calculate_section_area_and_price(section)
    # Single cabin = 300 sq ft, 4 cabins = 1200 sq ft
    assert result.calculated_area == Decimal("300.0000")
    assert result.billable_area == Decimal("1200.0000")
    assert result.line_total == Decimal("6000.00")


# 3. Square Feet to Square Metres Conversion
def test_sq_ft_to_sq_m_conversion():
    # Customer provides dimensions in feet (100 ft x 100 ft = 10,000 sq ft)
    # Rate is per sq m (e.g. ₹50/sq m)
    # 1 sq m = 10.7639104167 sq ft -> 10,000 sq ft / 10.7639104167 = 929.0304 sq m
    section = SectionCalculationInput(
        section_name="Export Facility Floor",
        length=Decimal("100"),
        breadth=Decimal("100"),
        measurement_unit="ft",
        repetitions=1,
        rate_uom="sq_m",
        applied_rate=Decimal("50.00"),
    )
    result = calculate_section_area_and_price(section)
    expected_sq_m = (Decimal("10000") / SQ_M_TO_SQ_FT).quantize(Decimal("0.0001"))
    assert result.billable_area == expected_sq_m
    assert result.line_total == (expected_sq_m * Decimal("50.00")).quantize(Decimal("0.01"))


# 4. Square Metres to Square Feet Conversion
def test_sq_m_to_sq_ft_conversion():
    # Customer gives dimensions in metres (10 m x 10 m = 100 sq m)
    # Rate is per sq ft (e.g. ₹4.50/sq ft)
    # 100 sq m * 10.7639104167 = 1076.3910 sq ft
    section = SectionCalculationInput(
        section_name="Cleanroom Section",
        length=Decimal("10"),
        breadth=Decimal("10"),
        measurement_unit="m",
        repetitions=1,
        rate_uom="sq_ft",
        applied_rate=Decimal("4.50"),
    )
    result = calculate_section_area_and_price(section)
    expected_sq_ft = (Decimal("100") * SQ_M_TO_SQ_FT).quantize(Decimal("0.0001"))
    assert result.billable_area == expected_sq_ft
    expected_total = (expected_sq_ft * Decimal("4.50")).quantize(Decimal("0.01"))
    assert result.line_total == expected_total


# 5. Invalid or Missing Dimensions Validation
def test_invalid_dimensions():
    # Negative length must fail validation
    with pytest.raises(ValidationError):
        SectionCalculationInput(
            section_name="Invalid Section",
            length=Decimal("-10"),
            breadth=Decimal("20"),
            measurement_unit="ft",
            applied_rate=Decimal("4.50"),
        )

    # Zero breadth must fail validation
    with pytest.raises(ValidationError):
        SectionCalculationInput(
            section_name="Zero Breadth",
            length=Decimal("10"),
            breadth=Decimal("0"),
            measurement_unit="ft",
            applied_rate=Decimal("4.50"),
        )

    # Invalid unit must fail validation
    with pytest.raises(ValidationError):
        SectionCalculationInput(
            section_name="Bad Unit",
            length=Decimal("10"),
            breadth=Decimal("20"),
            measurement_unit="yards",
            applied_rate=Decimal("4.50"),
        )


# 6. Multiple Sections Aggregation
def test_multiple_sections_aggregation():
    req = QuotationCalculationRequest(
        sections=[
            SectionCalculationInput(
                section_name="Zone 1 - Main Floor",
                length=Decimal("100"),
                breadth=Decimal("50"),
                measurement_unit="ft",
                repetitions=1,
                rate_uom="sq_ft",
                applied_rate=Decimal("4.00"),  # 5,000 sq ft * 4 = 20,000
            ),
            SectionCalculationInput(
                section_name="Zone 2 - Mezzanine Storage",
                length=Decimal("40"),
                breadth=Decimal("25"),
                measurement_unit="ft",
                repetitions=2,  # (1,000 * 2) = 2,000 sq ft * 3.50 = 7,000
                rate_uom="sq_ft",
                applied_rate=Decimal("3.50"),
            ),
        ],
        discount_type="none",
        discount_value=Decimal("0.00"),
        customer_state_code="33",  # Tamil Nadu Intrastate
        company_state_code="33",
        tax_rate=Decimal("18.00"),
        rounding_policy="HALF_UP",
    )
    result = calculate_quotation_totals(req)
    assert result.subtotal == Decimal("27000.00")
    assert result.taxable_amount == Decimal("27000.00")
    # CGST (9%) = 2,430.00, SGST (9%) = 2,430.00 -> Total Tax = 4,860.00
    assert result.cgst_amount == Decimal("2430.00")
    assert result.sgst_amount == Decimal("2430.00")
    assert result.igst_amount == Decimal("0.00")
    assert result.total_tax == Decimal("4860.00")
    assert result.final_amount == Decimal("31860.00")


# 7. Percentage and Fixed Discounts
def test_discounts():
    # Percentage discount (10%)
    req_pct = QuotationCalculationRequest(
        sections=[
            SectionCalculationInput(
                section_name="Section 1",
                length=Decimal("100"),
                breadth=Decimal("100"),
                applied_rate=Decimal("10.00"),  # 100,000
            )
        ],
        discount_type="percentage",
        discount_value=Decimal("10.00"),
        customer_state_code="33",
        company_state_code="33",
        tax_rate=Decimal("18.00"),
    )
    res_pct = calculate_quotation_totals(req_pct)
    assert res_pct.subtotal == Decimal("100000.00")
    assert res_pct.total_discount == Decimal("10000.00")
    assert res_pct.taxable_amount == Decimal("90000.00")

    # Fixed discount (₹5,000)
    req_fixed = QuotationCalculationRequest(
        sections=[
            SectionCalculationInput(
                section_name="Section 1",
                length=Decimal("100"),
                breadth=Decimal("100"),
                applied_rate=Decimal("10.00"),  # 100,000
            )
        ],
        discount_type="fixed",
        discount_value=Decimal("5000.00"),
        customer_state_code="33",
        company_state_code="33",
        tax_rate=Decimal("18.00"),
    )
    res_fixed = calculate_quotation_totals(req_fixed)
    assert res_fixed.subtotal == Decimal("100000.00")
    assert res_fixed.total_discount == Decimal("5000.00")
    assert res_fixed.taxable_amount == Decimal("95000.00")


# 8. Additional Charges (Freight, Packing, Other)
def test_additional_charges():
    req = QuotationCalculationRequest(
        sections=[
            SectionCalculationInput(
                section_name="Section 1",
                length=Decimal("50"),
                breadth=Decimal("20"),
                applied_rate=Decimal("10.00"),  # 10,000
            )
        ],
        freight_charges=Decimal("1200.00"),
        packing_charges=Decimal("300.00"),
        other_charges=Decimal("500.00"),
        customer_state_code="33",
        company_state_code="33",
        tax_rate=Decimal("18.00"),
    )
    res = calculate_quotation_totals(req)
    assert res.subtotal == Decimal("10000.00")
    assert res.taxable_amount == Decimal("12000.00")  # 10,000 + 1,200 + 300 + 500
    assert res.total_tax == Decimal("2160.00")  # 18% of 12,000
    assert res.final_amount == Decimal("14160.00")


# 9. Interstate vs Intrastate GST (CGST+SGST vs IGST)
def test_interstate_tax_calculation():
    # Customer in Karnataka (state_code '29'), Klean Max Pro in Tamil Nadu (state_code '33')
    req = QuotationCalculationRequest(
        sections=[
            SectionCalculationInput(
                section_name="Interstate Factory Floor",
                length=Decimal("100"),
                breadth=Decimal("100"),
                applied_rate=Decimal("5.00"),  # 50,000
            )
        ],
        customer_state_code="29",  # Karnataka
        company_state_code="33",  # Tamil Nadu
        tax_rate=Decimal("18.00"),
    )
    res = calculate_quotation_totals(req)
    assert res.is_interstate is True
    assert res.cgst_amount == Decimal("0.00")
    assert res.sgst_amount == Decimal("0.00")
    assert res.igst_rate == Decimal("18.00")
    assert res.igst_amount == Decimal("9000.00")
    assert res.total_tax == Decimal("9000.00")
    assert res.final_amount == Decimal("59000.00")


# 10. Rounding Policy
def test_rounding_policy():
    # Amount with paise that rounds up
    req = QuotationCalculationRequest(
        sections=[
            SectionCalculationInput(
                section_name="Sample",
                length=Decimal("33.33"),
                breadth=Decimal("10.00"),
                applied_rate=Decimal("3.14"),
            )
        ],
        customer_state_code="33",
        company_state_code="33",
        tax_rate=Decimal("18.00"),
        rounding_policy="HALF_UP",
    )
    res = calculate_quotation_totals(req)
    # Check that final amount is quantized to integer Rupee
    assert res.final_amount == res.final_amount.quantize(Decimal("1"))
    assert res.final_amount == (res.taxable_amount + res.total_tax + res.rounding_adjustment)


# 11. Indian Currency Amount in Words
def test_amount_in_words():
    # ₹1,45,250.00
    w1 = number_to_indian_currency_words(Decimal("145250.00"))
    assert "One Lakh Forty-Five Thousand Two Hundred Fifty Only" in w1

    # ₹47,200.50
    w2 = number_to_indian_currency_words(Decimal("47200.50"))
    assert "Forty-Seven Thousand Two Hundred and Paise Fifty Only" in w2

    # Zero
    w0 = number_to_indian_currency_words(Decimal("0.00"))
    assert w0 == "Rupees Zero Only"

    # ₹1 Crore 25 Lakhs
    w_cr = number_to_indian_currency_words(Decimal("12500000.00"))
    assert "One Crore Twenty-Five Lakh Only" in w_cr
