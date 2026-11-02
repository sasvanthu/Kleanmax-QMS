import pytest
from datetime import date, timedelta
from decimal import Decimal
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from fastapi import HTTPException

from backend.app.core.database import Base, get_db
from backend.app.models.all_models import (
    Profile, CompanySetting, Customer, Service, ServiceRate, Quotation,
    QuotationSection, QuotationCounter
)
from backend.app.schemas.quotation import (
    QuotationCreate, QuotationUpdate, QuotationSectionSchema, RevisionCreateRequest
)
from backend.app.services.quotation_service import (
    create_quotation, update_quotation, transition_status, create_revision
)
from backend.app.services.pdf_generator import render_quotation_html

# Setup in-memory SQLite database for workflow testing
TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()

    # Create company settings
    company = CompanySetting(
        id="c0000000-0000-0000-0000-000000000001",
        company_name="Klean Max Pro",
        legal_name="Klean Max Pro Commercial Services",
        gstin="33AABCK1234F1Z8",
        state_code="33",
        quotation_prefix="KMP",
        default_validity_days=30,
        rounding_policy="HALF_UP",
    )
    session.add(company)

    # Counter
    counter = QuotationCounter(fiscal_year="2026-27", last_sequence=0)
    session.add(counter)

    # Users
    admin = Profile(
        id="u1111111-1111-1111-1111-111111111111",
        email="admin@kleanmaxpro.com",
        full_name="Admin User",
        role="admin",
        is_active=True,
    )
    manager = Profile(
        id="u2222222-2222-2222-2222-222222222222",
        email="manager@kleanmaxpro.com",
        full_name="Manager User",
        role="manager",
        is_active=True,
    )
    staff = Profile(
        id="u3333333-3333-3333-3333-333333333333",
        email="staff@kleanmaxpro.com",
        full_name="Staff User",
        role="staff",
        is_active=True,
    )
    session.add_all([admin, manager, staff])

    # Customer
    customer = Customer(
        id="cust-001",
        customer_code="CUST-001",
        company_name="TVS Logistics Park",
        contact_person="Ravi Kumar",
        phone="+91 98401 99999",
        billing_address_line1="Ambattur Industrial Estate",
        billing_city="Chennai",
        billing_state="Tamil Nadu",
        billing_state_code="33",
        billing_pincode="600058",
    )
    session.add(customer)

    # Service
    service = Service(
        id="srv-001",
        service_code="SVC-WH-DEEP",
        service_name="Warehouse Deep Scrubbing",
        category="cleaning",
        quotation_type="area_based",
        default_uom="sq_ft",
        standard_rate=Decimal("4.5000"),
        default_tax_rate=Decimal("18.00"),
        is_active=True,
    )
    session.add(service)

    session.commit()

    yield session

    session.close()
    Base.metadata.drop_all(bind=test_engine)


def test_complete_quotation_lifecycle_and_immutability(db_session):
    admin = db_session.query(Profile).filter(Profile.role == "admin").first()
    manager = db_session.query(Profile).filter(Profile.role == "manager").first()
    staff = db_session.query(Profile).filter(Profile.role == "staff").first()
    customer = db_session.query(Customer).first()
    service = db_session.query(Service).first()

    # 1. Staff creates draft quotation with 2 sections
    q_data = QuotationCreate(
        customer_id=customer.id,
        quotation_type="area_based",
        quotation_date=date.today(),
        sections=[
            QuotationSectionSchema(
                section_name="Main Warehouse Bay",
                service_id=service.id,
                service_name=service.service_name,
                length=Decimal("100"),
                breadth=Decimal("50"),
                measurement_unit="ft",
                repetitions=1,
                billable_uom="sq_ft",
                rate_source="catalogue",
                original_catalogue_rate=service.standard_rate,
                applied_rate=service.standard_rate,  # 4.50
            ),
            QuotationSectionSchema(
                section_name="Loading Dock 1 & 2",
                service_id=service.id,
                service_name=service.service_name,
                length=Decimal("40"),
                breadth=Decimal("20"),
                measurement_unit="ft",
                repetitions=2,  # 1600 sq ft
                billable_uom="sq_ft",
                rate_source="catalogue",
                original_catalogue_rate=service.standard_rate,
                applied_rate=service.standard_rate,  # 4.50
            ),
        ],
        discount_type="percentage",
        discount_value=Decimal("5.00"),
        freight_charges=Decimal("1000.00"),
        tax_rate=Decimal("18.00"),
    )

    q = create_quotation(db_session, q_data, staff)
    assert q.status == "draft"
    assert q.quotation_number.startswith("KMP/")
    assert q.revision_number == 0
    # Bay = 5000 sq ft * 4.5 = 22,500; Docks = 1600 sq ft * 4.5 = 7,200
    # Subtotal = 29,700.00
    assert q.subtotal == Decimal("29700.00")
    # Discount 5% = 1485.00 -> Taxable = 29,700 - 1485 + 1000 = 29,215.00
    assert q.taxable_amount == Decimal("29215.00")
    assert q.total_tax == Decimal("5258.70")

    # 2. Staff edits draft
    update_data = QuotationUpdate(
        notes="Updated special instructions for site clearance"
    )
    q_updated = update_quotation(db_session, str(q.id), update_data, staff)
    assert q_updated.notes == "Updated special instructions for site clearance"

    # 3. Submit draft for approval
    q_sub = transition_status(db_session, str(q.id), "submit", staff)
    assert q_sub.status == "pending_approval"

    # 4. Manager approves quotation
    q_app = transition_status(db_session, str(q.id), "approve", manager)
    assert q_app.status == "approved"
    assert q_app.approved_by_id == manager.id

    # 5. Issue quotation -> Snapshot frozen, marked issued
    q_issued = transition_status(db_session, str(q.id), "issue", manager)
    assert q_issued.status == "issued"
    assert q_issued.snapshot_json is not None
    assert q_issued.snapshot_json["financials"]["subtotal"] == "29700.00"

    # 6. Verify Immutability: Editing an issued quotation MUST fail with HTTPException
    with pytest.raises(HTTPException) as exc_info:
        update_quotation(db_session, str(q.id), QuotationUpdate(notes="Illegal post-issue edit"), staff)
    assert exc_info.value.status_code == 400
    assert "immutable" in exc_info.value.detail.lower()

    # 7. Create Revision
    rev_req = RevisionCreateRequest(revision_reason="Customer requested 10% discount and additional bay")
    q_rev = create_revision(db_session, str(q.id), rev_req, staff)
    assert q_rev.quotation_number == q.quotation_number
    assert q_rev.revision_number == 1
    assert q_rev.status == "draft"
    assert q_rev.parent_quotation_id == q.id
    # Original quotation is now status 'revised'
    assert q_issued.status == "revised"

    # 8. Render HTML document for the revision
    company = db_session.query(CompanySetting).first()
    html_output = render_quotation_html(
        quotation=q_rev,
        company=company,
        customer=customer,
        sections=q_rev.sections,
        items=[],
    )
    assert q.quotation_number in html_output
    assert "TVS Logistics Park" in html_output
    assert "Klean Max Pro" in html_output
