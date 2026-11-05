import json
from datetime import datetime, date, timedelta
from decimal import Decimal
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from backend.app.models.all_models import (
    Quotation, QuotationSection, QuotationItem, QuotationRevision,
    Customer, Service, Profile, CompanySetting, AuditLog
)
from backend.app.schemas.quotation import (
    QuotationCreate, QuotationUpdate, RevisionCreateRequest
)
from backend.app.services.calculator import (
    calculate_quotation_totals, SectionCalculationInput, ItemCalculationInput,
    QuotationCalculationRequest
)
from backend.app.services.numbering import generate_next_quotation_number
from backend.app.core.security import check_override_permission


def _serialize_for_snapshot(obj: Any) -> Any:
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    if isinstance(obj, Decimal):
        return str(obj)
    if isinstance(obj, list):
        return [_serialize_for_snapshot(i) for i in obj]
    if isinstance(obj, dict):
        return {k: _serialize_for_snapshot(v) for k, v in obj.items()}
    return obj


def create_quotation(
    db: Session,
    data: QuotationCreate,
    current_user: Profile
) -> Quotation:
    customer = db.query(Customer).filter(Customer.id == data.customer_id).first()
    if not customer:
        customer = db.query(Customer).filter(Customer.company_name.ilike(data.customer_id.strip())).first()
    if not customer:
        client_name = getattr(data, 'client_name', None) or (data.customer_id if len(data.customer_id) < 60 and '-' not in data.customer_id else "Client")
        customer = Customer(
            company_name=client_name,
            billing_address_line1=getattr(data, 'client_address', None) or "Perungudi Industrial Estate",
            billing_city="Chennai",
            billing_state="Tamil Nadu",
            billing_state_code="33",
            billing_pincode="600096",
            phone=getattr(data, 'client_phone', None) or "+91 98840 12345",
            gstin=getattr(data, 'client_gstin', None),
            contact_person=getattr(data, 'attention_person', None),
            is_active=True,
            created_by_id=current_user.id if current_user else None
        )
        db.add(customer)
        db.flush()

    company = None
    if getattr(data, 'company_code', None):
        company = db.query(CompanySetting).filter(CompanySetting.company_code == data.company_code).first()
    if not company:
        company = db.query(CompanySetting).first()

    company_state = company.state_code if company else "33"
    validity_days = company.default_validity_days if company else 30

    validity_date = data.validity_date or (data.quotation_date + timedelta(days=validity_days))

    # Verify manual rate overrides
    has_overrides = False
    for sec in data.sections:
        if sec.rate_source == "manual_override":
            has_overrides = True
            if not check_override_permission(current_user):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"User {current_user.email} is not authorized to override catalogue rates. Manager or Admin required."
                )
            if not sec.override_reason or len(sec.override_reason.strip()) < 3:
                raise HTTPException(
                    status_code=400,
                    detail="A valid explanation reason is mandatory for manual rate overrides."
                )

    # Prepare calculation request
    calc_sections = [
        SectionCalculationInput(
            section_name=s.section_name,
            length=s.length,
            breadth=s.breadth,
            measurement_unit=s.measurement_unit,
            repetitions=s.repetitions,
            rate_uom=s.billable_uom,
            applied_rate=s.applied_rate,
            discount_percent=s.discount_percent,
            service_id=s.service_id,
            service_name=s.service_name,
            rate_source=s.rate_source,
            original_catalogue_rate=s.original_catalogue_rate,
            override_reason=s.override_reason,
        )
        for s in data.sections
    ]

    calc_items = [
        ItemCalculationInput(
            item_name=i.item_name,
            quantity=i.quantity,
            uom=i.uom,
            unit_price=i.unit_price,
            discount_percent=Decimal("0.00"),
            tax_rate=i.tax_rate,
            service_id=i.service_id,
            item_code=i.item_code,
            description=i.description,
            hsn_sac=i.hsn_sac,
            rate_source=i.rate_source,
            original_catalogue_rate=i.original_catalogue_rate,
            override_reason=i.override_reason,
        )
        for i in data.items
    ]

    calc_req = QuotationCalculationRequest(
        sections=calc_sections,
        items=calc_items,
        discount_type=data.discount_type,
        discount_value=data.discount_value,
        freight_charges=data.freight_charges,
        packing_charges=data.packing_charges,
        other_charges=data.other_charges,
        customer_state_code=customer.billing_state_code or "33",
        company_state_code=company_state,
        tax_rate=data.tax_rate,
        rounding_policy=data.rounding_policy,
    )

    calc_res = calculate_quotation_totals(calc_req)

    # Generate sequential number safely or use custom specified number
    if getattr(data, 'quotation_number', None) and data.quotation_number.strip():
        quotation_number = data.quotation_number.strip()
        existing = db.query(Quotation).filter(
            Quotation.quotation_number == quotation_number,
            Quotation.revision_number == 0
        ).first()
        if existing and existing.status not in ("cancelled", "revised"):
            # Update existing record seamlessly without UniqueConstraint collision
            existing.customer_id = customer.id
            existing.company_code = data.company_code or existing.company_code
            existing.quotation_type = data.quotation_type or existing.quotation_type
            existing.quotation_date = data.quotation_date
            existing.validity_date = validity_date
            existing.job_description = data.job_description
            existing.notes = data.notes
            existing.terms_and_conditions = data.terms_and_conditions or existing.terms_and_conditions
            existing.subtotal = calc_res.subtotal
            existing.discount_type = data.discount_type
            existing.discount_value = data.discount_value
            existing.total_discount = calc_res.total_discount
            existing.taxable_amount = calc_res.taxable_amount
            existing.cgst_rate = calc_res.cgst_rate
            existing.cgst_amount = calc_res.cgst_amount
            existing.sgst_rate = calc_res.sgst_rate
            existing.sgst_amount = calc_res.sgst_amount
            existing.total_tax = calc_res.total_tax
            existing.final_amount = calc_res.final_amount
            existing.amount_in_words = calc_res.amount_in_words
            if hasattr(data, 'snapshot_json') and data.snapshot_json is not None:
                existing.snapshot_json = data.snapshot_json
            if hasattr(data, 'image_url') and data.image_url is not None:
                existing.image_url = data.image_url
            existing.updated_at = datetime.utcnow()

            # Replace items
            db.query(QuotationItem).filter(QuotationItem.quotation_id == existing.id).delete()
            for idx, (item_input, item_calc) in enumerate(zip(data.items, calc_res.items), start=1):
                item_row = QuotationItem(
                    quotation_id=existing.id,
                    item_order=idx,
                    service_id=item_input.service_id,
                    item_code=item_input.item_code,
                    item_name=item_input.item_name,
                    description=item_input.description,
                    hsn_sac=item_input.hsn_sac,
                    quotation_type=item_input.quotation_type,
                    quantity=item_calc.quantity,
                    uom=item_calc.uom,
                    unit_price=item_calc.unit_price,
                    rate_source=item_input.rate_source,
                    original_catalogue_rate=item_input.original_catalogue_rate,
                    applied_rate=item_input.applied_rate,
                    taxable_value=item_calc.taxable_value,
                    tax_rate=item_calc.tax_rate,
                    line_total=item_calc.line_total,
                    notes=item_input.notes,
                )
                db.add(item_row)

            # Replace sections
            db.query(QuotationSection).filter(QuotationSection.quotation_id == existing.id).delete()
            for idx, (sec_input, sec_calc) in enumerate(zip(data.sections, calc_res.sections), start=1):
                sec_row = QuotationSection(
                    quotation_id=existing.id,
                    section_name=sec_calc.section_name,
                    section_order=idx,
                    service_id=sec_input.service_id,
                    service_name=sec_input.service_name,
                    length=sec_calc.length,
                    breadth=sec_calc.breadth,
                    measurement_unit=sec_calc.measurement_unit,
                    calculated_area=sec_calc.calculated_area,
                    repetitions=sec_calc.repetitions,
                    billable_area=sec_calc.billable_area,
                    billable_uom=sec_calc.billable_uom,
                    rate_source=sec_input.rate_source,
                    original_catalogue_rate=sec_input.original_catalogue_rate,
                    applied_rate=sec_calc.applied_rate,
                    override_reason=sec_calc.override_reason,
                    discount_percent=sec_calc.discount_percent,
                    line_total=sec_calc.line_total,
                    notes=sec_input.notes,
                )
                db.add(sec_row)

            db.commit()
            db.refresh(existing)
            return existing
        elif existing:
            prefix = company.quotation_prefix if company and company.quotation_prefix else "KMP"
            quotation_number = generate_next_quotation_number(db, data.quotation_date, prefix=prefix)
    else:
        prefix = company.quotation_prefix if company and company.quotation_prefix else "KMP"
        quotation_number = generate_next_quotation_number(db, data.quotation_date, prefix=prefix)

    quotation = Quotation(
        company_code=data.company_code or (company.company_code if company else "kleanmaxpro"),
        quotation_number=quotation_number,
        revision_number=0,
        customer_id=customer.id,
        quotation_type=data.quotation_type,
        status="draft",
        quotation_date=data.quotation_date,
        validity_date=validity_date,
        customer_ref=data.customer_ref,
        job_description=data.job_description,
        payment_terms=data.payment_terms or (company.default_payment_terms if company else None),
        delivery_terms=data.delivery_terms or (company.default_delivery_terms if company else None),
        warranty_terms=data.warranty_terms or (company.default_warranty_terms if company else None),
        terms_and_conditions=data.terms_and_conditions or (company.terms_and_conditions if company else None),
        notes=data.notes,
        subtotal=calc_res.subtotal,
        discount_type=data.discount_type,
        discount_value=data.discount_value,
        total_discount=calc_res.total_discount,
        freight_charges=calc_res.freight_charges,
        packing_charges=calc_res.packing_charges,
        other_charges=calc_res.other_charges,
        taxable_amount=calc_res.taxable_amount,
        is_interstate=calc_res.is_interstate,
        cgst_rate=calc_res.cgst_rate,
        cgst_amount=calc_res.cgst_amount,
        sgst_rate=calc_res.sgst_rate,
        sgst_amount=calc_res.sgst_amount,
        igst_rate=calc_res.igst_rate,
        igst_amount=calc_res.igst_amount,
        total_tax=calc_res.total_tax,
        rounding_adjustment=calc_res.rounding_adjustment,
        final_amount=calc_res.final_amount,
        amount_in_words=calc_res.amount_in_words,
        snapshot_json=getattr(data, 'snapshot_json', None),
        image_url=getattr(data, 'image_url', None),
        prepared_by_id=current_user.id,
    )
    db.add(quotation)
    db.flush()

    # Save sections with calculated metrics
    for idx, (sec_input, sec_calc) in enumerate(zip(data.sections, calc_res.sections), start=1):
        section_row = QuotationSection(
            quotation_id=quotation.id,
            section_name=sec_calc.section_name,
            section_order=idx,
            service_id=sec_input.service_id,
            service_name=sec_input.service_name,
            length=sec_calc.length,
            breadth=sec_calc.breadth,
            measurement_unit=sec_calc.measurement_unit,
            calculated_area=sec_calc.calculated_area,
            repetitions=sec_calc.repetitions,
            billable_area=sec_calc.billable_area,
            billable_uom=sec_calc.billable_uom,
            rate_source=sec_calc.rate_source,
            original_catalogue_rate=sec_calc.original_catalogue_rate,
            applied_rate=sec_calc.applied_rate,
            override_reason=sec_calc.override_reason,
            override_by_id=current_user.id if sec_calc.rate_source == "manual_override" else None,
            override_at=datetime.utcnow() if sec_calc.rate_source == "manual_override" else None,
            discount_percent=sec_calc.discount_percent,
            line_total=sec_calc.line_total,
            notes=sec_input.notes,
        )
        db.add(section_row)

        if sec_calc.rate_source == "manual_override":
            audit = AuditLog(
                entity_type="quotation_section",
                entity_id=str(quotation.id),
                action="rate_override",
                performed_by_id=current_user.id,
                changes_json={
                    "quotation_number": quotation_number,
                    "section_name": sec_calc.section_name,
                    "service_name": sec_input.service_name,
                    "original_rate": str(sec_calc.original_catalogue_rate),
                    "overridden_rate": str(sec_calc.applied_rate),
                    "reason": sec_calc.override_reason,
                }
            )
            db.add(audit)

    # Save items
    for idx, (item_input, item_calc) in enumerate(zip(data.items, calc_res.items), start=1):
        item_row = QuotationItem(
            quotation_id=quotation.id,
            item_order=idx,
            service_id=item_input.service_id,
            item_code=item_input.item_code,
            item_name=item_calc.item_name,
            description=item_input.description,
            hsn_sac=item_input.hsn_sac,
            quotation_type=item_input.quotation_type,
            quantity=item_calc.quantity,
            uom=item_calc.uom,
            unit_price=item_calc.unit_price,
            rate_source=item_input.rate_source,
            original_catalogue_rate=item_input.original_catalogue_rate,
            applied_rate=item_input.applied_rate,
            override_reason=item_input.override_reason,
            override_by_id=current_user.id if item_input.rate_source == "manual_override" else None,
            override_at=datetime.utcnow() if item_input.rate_source == "manual_override" else None,
            taxable_value=item_calc.taxable_value,
            tax_rate=item_calc.tax_rate,
            line_total=item_calc.line_total,
            notes=item_input.notes,
        )
        db.add(item_row)

    # Audit log creation
    audit_create = AuditLog(
        entity_type="quotation",
        entity_id=str(quotation.id),
        action="create_draft",
        performed_by_id=current_user.id,
        changes_json={"quotation_number": quotation_number, "status": "draft"}
    )
    db.add(audit_create)

    db.commit()
    db.refresh(quotation)
    return quotation


def update_quotation(
    db: Session,
    quotation_id: str,
    data: QuotationUpdate,
    current_user: Profile
) -> Quotation:
    quotation = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")

    # Immutability enforcement: Issued or Revised quotations CANNOT be edited directly
    if quotation.status in ("issued", "revised", "cancelled"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Quotation {quotation.quotation_number} is {quotation.status} and immutable. Please create a Revision instead."
        )

    customer = db.query(Customer).filter(Customer.id == (data.customer_id or quotation.customer_id)).first()
    if data.company_code:
        quotation.company_code = data.company_code

    company = None
    if quotation.company_code:
        company = db.query(CompanySetting).filter(CompanySetting.company_code == quotation.company_code).first()
    if not company:
        company = db.query(CompanySetting).first()
    company_state = company.state_code if company else "33"

    if data.customer_id:
        quotation.customer_id = customer.id
    if data.quotation_date:
        quotation.quotation_date = data.quotation_date
    if data.validity_date:
        quotation.validity_date = data.validity_date
    if data.customer_ref is not None:
        quotation.customer_ref = data.customer_ref
    if data.job_description is not None:
        quotation.job_description = data.job_description
    if data.payment_terms is not None:
        quotation.payment_terms = data.payment_terms
    if data.delivery_terms is not None:
        quotation.delivery_terms = data.delivery_terms
    if data.warranty_terms is not None:
        quotation.warranty_terms = data.warranty_terms
    if data.terms_and_conditions is not None:
        quotation.terms_and_conditions = data.terms_and_conditions
    if data.notes is not None:
        quotation.notes = data.notes

    # If sections are updated
    if data.sections is not None:
        # Delete existing sections
        db.query(QuotationSection).filter(QuotationSection.quotation_id == quotation.id).delete()
        
        # Validate overrides
        for sec in data.sections:
            if sec.rate_source == "manual_override":
                if not check_override_permission(current_user):
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="User is not authorized to override catalogue rates."
                    )
                if not sec.override_reason or len(sec.override_reason.strip()) < 3:
                    raise HTTPException(
                        status_code=400,
                        detail="A valid explanation reason is mandatory for manual rate overrides."
                    )

        calc_sections = [
            SectionCalculationInput(
                section_name=s.section_name,
                length=s.length,
                breadth=s.breadth,
                measurement_unit=s.measurement_unit,
                repetitions=s.repetitions,
                rate_uom=s.billable_uom,
                applied_rate=s.applied_rate,
                discount_percent=s.discount_percent,
                service_id=s.service_id,
                service_name=s.service_name,
                rate_source=s.rate_source,
                original_catalogue_rate=s.original_catalogue_rate,
                override_reason=s.override_reason,
            )
            for s in data.sections
        ]
    else:
        calc_sections = [
            SectionCalculationInput(
                section_name=s.section_name,
                length=s.length,
                breadth=s.breadth,
                measurement_unit=s.measurement_unit,
                repetitions=s.repetitions,
                rate_uom=s.billable_uom,
                applied_rate=s.applied_rate,
                discount_percent=s.discount_percent,
                service_id=s.service_id,
                service_name=s.service_name,
                rate_source=s.rate_source,
                original_catalogue_rate=s.original_catalogue_rate,
                override_reason=s.override_reason,
            )
            for s in quotation.sections
        ]

    if data.items is not None:
        calc_items = [
            ItemCalculationInput(
                item_name=i.item_name,
                quantity=i.quantity,
                uom=i.uom,
                unit_price=i.unit_price,
                discount_percent=Decimal("0.00"),
                tax_rate=i.tax_rate,
                service_id=i.service_id,
                item_code=i.item_code,
                description=i.description,
                hsn_sac=i.hsn_sac,
                rate_source=i.rate_source,
                original_catalogue_rate=i.original_catalogue_rate,
                override_reason=i.override_reason,
            )
            for i in data.items
        ]
    else:
        calc_items = [
            ItemCalculationInput(
                item_name=i.item_name,
                quantity=i.quantity,
                uom=i.uom,
                unit_price=i.unit_price,
                discount_percent=Decimal("0.00"),
                tax_rate=i.tax_rate,
                service_id=i.service_id,
                item_code=i.item_code,
                description=i.description,
                hsn_sac=i.hsn_sac,
                rate_source=i.rate_source,
                original_catalogue_rate=i.original_catalogue_rate,
                override_reason=i.override_reason,
            )
            for i in quotation.items
        ]

    calc_req = QuotationCalculationRequest(
        sections=calc_sections,
        items=calc_items,
        discount_type=data.discount_type or quotation.discount_type,
        discount_value=data.discount_value if data.discount_value is not None else quotation.discount_value,
        freight_charges=data.freight_charges if data.freight_charges is not None else quotation.freight_charges,
        packing_charges=data.packing_charges if data.packing_charges is not None else quotation.packing_charges,
        other_charges=data.other_charges if data.other_charges is not None else quotation.other_charges,
        customer_state_code=customer.billing_state_code or "33",
        company_state_code=company_state,
        tax_rate=data.tax_rate or Decimal("18.00"),
        rounding_policy=data.rounding_policy or "HALF_UP",
    )

    calc_res = calculate_quotation_totals(calc_req)

    quotation.subtotal = calc_res.subtotal
    quotation.discount_type = calc_res.discount_type
    quotation.discount_value = calc_res.discount_value
    quotation.total_discount = calc_res.total_discount
    quotation.freight_charges = calc_res.freight_charges
    quotation.packing_charges = calc_res.packing_charges
    quotation.other_charges = calc_res.other_charges
    quotation.taxable_amount = calc_res.taxable_amount
    quotation.is_interstate = calc_res.is_interstate
    quotation.cgst_rate = calc_res.cgst_rate
    quotation.cgst_amount = calc_res.cgst_amount
    quotation.sgst_rate = calc_res.sgst_rate
    quotation.sgst_amount = calc_res.sgst_amount
    quotation.igst_rate = calc_res.igst_rate
    quotation.igst_amount = calc_res.igst_amount
    quotation.total_tax = calc_res.total_tax
    quotation.rounding_adjustment = calc_res.rounding_adjustment
    quotation.final_amount = calc_res.final_amount
    quotation.amount_in_words = calc_res.amount_in_words
    if hasattr(data, 'image_url') and data.image_url is not None:
        quotation.image_url = data.image_url
    quotation.updated_at = datetime.utcnow()

    if data.sections is not None:
        for idx, (sec_input, sec_calc) in enumerate(zip(data.sections, calc_res.sections), start=1):
            s_row = QuotationSection(
                quotation_id=quotation.id,
                section_name=sec_calc.section_name,
                section_order=idx,
                service_id=sec_input.service_id,
                service_name=sec_input.service_name,
                length=sec_calc.length,
                breadth=sec_calc.breadth,
                measurement_unit=sec_calc.measurement_unit,
                calculated_area=sec_calc.calculated_area,
                repetitions=sec_calc.repetitions,
                billable_area=sec_calc.billable_area,
                billable_uom=sec_calc.billable_uom,
                rate_source=sec_calc.rate_source,
                original_catalogue_rate=sec_calc.original_catalogue_rate,
                applied_rate=sec_calc.applied_rate,
                override_reason=sec_calc.override_reason,
                override_by_id=current_user.id if sec_calc.rate_source == "manual_override" else None,
                override_at=datetime.utcnow() if sec_calc.rate_source == "manual_override" else None,
                discount_percent=sec_calc.discount_percent,
                line_total=sec_calc.line_total,
                notes=sec_input.notes,
            )
            db.add(s_row)

    if data.items is not None:
        db.query(QuotationItem).filter(QuotationItem.quotation_id == quotation.id).delete()
        for idx, (item_input, item_calc) in enumerate(zip(data.items, calc_res.items), start=1):
            item_row = QuotationItem(
                quotation_id=quotation.id,
                item_order=idx,
                service_id=item_input.service_id,
                item_code=item_input.item_code,
                item_name=item_calc.item_name,
                description=item_input.description,
                hsn_sac=item_input.hsn_sac,
                quotation_type=item_input.quotation_type,
                quantity=item_calc.quantity,
                uom=item_calc.uom,
                unit_price=item_calc.unit_price,
                rate_source=item_input.rate_source,
                original_catalogue_rate=item_input.original_catalogue_rate,
                applied_rate=item_input.applied_rate,
                override_reason=item_input.override_reason,
                override_by_id=current_user.id if item_input.rate_source == "manual_override" else None,
                override_at=datetime.utcnow() if item_input.rate_source == "manual_override" else None,
                taxable_value=item_calc.taxable_value,
                tax_rate=item_calc.tax_rate,
                line_total=item_calc.line_total,
                notes=item_input.notes,
            )
            db.add(item_row)

    audit_update = AuditLog(
        entity_type="quotation",
        entity_id=str(quotation.id),
        action="update_quotation",
        performed_by_id=current_user.id,
        changes_json={"quotation_number": quotation.quotation_number}
    )
    db.add(audit_update)

    db.commit()
    db.refresh(quotation)
    return quotation


def transition_status(
    db: Session,
    quotation_id: str,
    action: str,  # 'submit', 'approve', 'issue', 'cancel'
    current_user: Profile
) -> Quotation:
    quotation = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")

    if action == "submit":
        if quotation.status != "draft":
            raise HTTPException(status_code=400, detail=f"Cannot submit quotation in status {quotation.status}")
        quotation.status = "pending_approval"

    elif action == "approve":
        if quotation.status != "pending_approval":
            raise HTTPException(status_code=400, detail=f"Cannot approve quotation in status {quotation.status}")
        if current_user.role not in ("admin", "manager"):
            raise HTTPException(status_code=403, detail="Only Managers and Admins can approve quotations")
        quotation.status = "approved"
        quotation.approved_by_id = current_user.id
        quotation.approved_at = datetime.utcnow()

    elif action == "issue":
        if quotation.status not in ("approved", "draft"):
            raise HTTPException(status_code=400, detail=f"Cannot issue quotation in status {quotation.status}")
        if current_user.role not in ("admin", "manager"):
            raise HTTPException(status_code=403, detail="Only Managers and Admins can issue quotations")
        quotation.status = "issued"
        quotation.issued_at = datetime.utcnow()

        # Build immutable snapshot
        snapshot = {
            "quotation_number": quotation.quotation_number,
            "revision_number": quotation.revision_number,
            "issued_at": quotation.issued_at.isoformat(),
            "customer": {
                "company_name": quotation.customer.company_name,
                "contact_person": quotation.customer.contact_person,
                "phone": quotation.customer.phone,
                "email": quotation.customer.email,
                "gstin": quotation.customer.gstin,
                "billing_address": f"{quotation.customer.billing_address_line1}, {quotation.customer.billing_city}, {quotation.customer.billing_state} - {quotation.customer.billing_pincode}",
            },
            "financials": {
                "subtotal": str(quotation.subtotal),
                "total_discount": str(quotation.total_discount),
                "freight": str(quotation.freight_charges),
                "packing": str(quotation.packing_charges),
                "taxable_amount": str(quotation.taxable_amount),
                "cgst_amount": str(quotation.cgst_amount),
                "sgst_amount": str(quotation.sgst_amount),
                "igst_amount": str(quotation.igst_amount),
                "rounding_adjustment": str(quotation.rounding_adjustment),
                "final_amount": str(quotation.final_amount),
                "amount_in_words": quotation.amount_in_words,
            },
            "sections": [
                {
                    "name": s.section_name,
                    "service": s.service_name,
                    "length": str(s.length),
                    "breadth": str(s.breadth),
                    "unit": s.measurement_unit,
                    "calculated_area": str(s.calculated_area),
                    "repetitions": s.repetitions,
                    "billable_area": str(s.billable_area),
                    "billable_uom": s.billable_uom,
                    "applied_rate": str(s.applied_rate),
                    "line_total": str(s.line_total),
                }
                for s in quotation.sections
            ]
        }
        quotation.snapshot_json = snapshot

    elif action == "cancel":
        if quotation.status == "cancelled":
            raise HTTPException(status_code=400, detail="Quotation is already cancelled")
        if current_user.role not in ("admin", "manager"):
            raise HTTPException(status_code=403, detail="Only Managers and Admins can cancel quotations")
        quotation.status = "cancelled"

    else:
        raise HTTPException(status_code=400, detail=f"Invalid action: {action}")

    audit = AuditLog(
        entity_type="quotation",
        entity_id=str(quotation.id),
        action=f"transition_{action}",
        performed_by_id=current_user.id,
        changes_json={"new_status": quotation.status}
    )
    db.add(audit)
    db.commit()
    db.refresh(quotation)
    return quotation


def create_revision(
    db: Session,
    quotation_id: str,
    req: RevisionCreateRequest,
    current_user: Profile
) -> Quotation:
    orig = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not orig:
        raise HTTPException(status_code=404, detail="Quotation not found")

    if orig.status not in ("issued", "approved"):
        raise HTTPException(
            status_code=400,
            detail="Revisions can only be branched from Issued or Approved quotations"
        )

    # Mark original as revised
    orig.status = "revised"

    new_rev_number = orig.revision_number + 1

    # Create new quotation for this revision
    new_quotation = Quotation(
        quotation_number=orig.quotation_number,
        revision_number=new_rev_number,
        parent_quotation_id=orig.id,
        customer_id=orig.customer_id,
        quotation_type=orig.quotation_type,
        status="draft",
        quotation_date=date.today(),
        validity_date=date.today() + timedelta(days=30),
        customer_ref=orig.customer_ref,
        job_description=orig.job_description,
        payment_terms=orig.payment_terms,
        delivery_terms=orig.delivery_terms,
        warranty_terms=orig.warranty_terms,
        terms_and_conditions=orig.terms_and_conditions,
        notes=f"Revision {new_rev_number}: {req.revision_reason}",
        subtotal=orig.subtotal,
        discount_type=orig.discount_type,
        discount_value=orig.discount_value,
        total_discount=orig.total_discount,
        freight_charges=orig.freight_charges,
        packing_charges=orig.packing_charges,
        other_charges=orig.other_charges,
        taxable_amount=orig.taxable_amount,
        is_interstate=orig.is_interstate,
        cgst_rate=orig.cgst_rate,
        cgst_amount=orig.cgst_amount,
        sgst_rate=orig.sgst_rate,
        sgst_amount=orig.sgst_amount,
        igst_rate=orig.igst_rate,
        igst_amount=orig.igst_amount,
        total_tax=orig.total_tax,
        rounding_adjustment=orig.rounding_adjustment,
        final_amount=orig.final_amount,
        amount_in_words=orig.amount_in_words,
        prepared_by_id=current_user.id,
    )
    db.add(new_quotation)
    db.flush()

    # Clone sections
    for sec in orig.sections:
        new_sec = QuotationSection(
            quotation_id=new_quotation.id,
            section_name=sec.section_name,
            section_order=sec.section_order,
            service_id=sec.service_id,
            service_name=sec.service_name,
            length=sec.length,
            breadth=sec.breadth,
            measurement_unit=sec.measurement_unit,
            calculated_area=sec.calculated_area,
            repetitions=sec.repetitions,
            billable_area=sec.billable_area,
            billable_uom=sec.billable_uom,
            rate_source=sec.rate_source,
            original_catalogue_rate=sec.original_catalogue_rate,
            applied_rate=sec.applied_rate,
            override_reason=sec.override_reason,
            discount_percent=sec.discount_percent,
            line_total=sec.line_total,
            notes=sec.notes,
        )
        db.add(new_sec)

    # Clone items
    for item in orig.items:
        new_item = QuotationItem(
            quotation_id=new_quotation.id,
            item_order=item.item_order,
            service_id=item.service_id,
            item_code=item.item_code,
            item_name=item.item_name,
            description=item.description,
            hsn_sac=item.hsn_sac,
            quotation_type=item.quotation_type,
            quantity=item.quantity,
            uom=item.uom,
            unit_price=item.unit_price,
            rate_source=item.rate_source,
            original_catalogue_rate=item.original_catalogue_rate,
            applied_rate=item.applied_rate,
            override_reason=item.override_reason,
            taxable_value=item.taxable_value,
            tax_rate=item.tax_rate,
            line_total=item.line_total,
            notes=item.notes,
        )
        db.add(new_item)

    # Record in quotation_revisions table
    rev_record = QuotationRevision(
        quotation_id=new_quotation.id,
        revision_number=new_rev_number,
        previous_quotation_id=orig.id,
        revised_by_id=current_user.id,
        revision_reason=req.revision_reason,
        snapshot_json=_serialize_for_snapshot(orig.snapshot_json or {}),
    )
    db.add(rev_record)

    audit = AuditLog(
        entity_type="quotation",
        entity_id=str(new_quotation.id),
        action="create_revision",
        performed_by_id=current_user.id,
        changes_json={
            "quotation_number": new_quotation.quotation_number,
            "revision_number": new_rev_number,
            "parent_id": str(orig.id),
            "reason": req.revision_reason,
        }
    )
    db.add(audit)

    db.commit()
    db.refresh(new_quotation)
    return new_quotation
