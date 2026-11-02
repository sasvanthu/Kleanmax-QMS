import pytest
from datetime import date
from decimal import Decimal
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi import HTTPException

from backend.app.core.database import Base
from backend.app.models.all_models import (
    Profile, CompanySetting, Customer, Service, QuotationCounter, AuditLog
)
from backend.app.schemas.quotation import QuotationCreate, QuotationSectionSchema
from backend.app.services.quotation_service import create_quotation, transition_status

TEST_DB_URL = "sqlite:///:memory:"
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture
def rbac_db():
    Base.metadata.create_all(bind=engine)
    db = Session()

    company = CompanySetting(
        company_name="Klean Max Pro",
        state_code="33",
        quotation_prefix="KMP",
    )
    db.add(company)
    db.add(QuotationCounter(fiscal_year="2026-27", last_sequence=0))

    admin = Profile(email="admin@test.com", full_name="Admin", role="admin")
    manager = Profile(email="manager@test.com", full_name="Manager", role="manager")
    staff = Profile(email="staff@test.com", full_name="Staff", role="staff")
    db.add_all([admin, manager, staff])

    cust = Customer(
        company_name="Test Client",
        phone="1234567890",
        billing_address_line1="Chennai",
        billing_city="Chennai",
        billing_state="Tamil Nadu",
        billing_state_code="33",
        billing_pincode="600001",
    )
    db.add(cust)

    svc = Service(
        service_code="SVC-01",
        service_name="Scrubbing",
        category="cleaning",
        standard_rate=Decimal("5.00"),
    )
    db.add(svc)

    db.commit()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)


def test_staff_cannot_override_rates(rbac_db):
    staff = rbac_db.query(Profile).filter(Profile.role == "staff").first()
    cust = rbac_db.query(Customer).first()
    svc = rbac_db.query(Service).first()

    override_data = QuotationCreate(
        customer_id=str(cust.id),
        sections=[
            QuotationSectionSchema(
                section_name="Test Bay",
                service_id=str(svc.id),
                service_name=svc.service_name,
                length=Decimal("10"),
                breadth=Decimal("10"),
                rate_source="manual_override",
                original_catalogue_rate=Decimal("5.00"),
                applied_rate=Decimal("2.50"),  # Unauthorized price cut!
                override_reason="Friend discount",
            )
        ]
    )

    # Must raise HTTP 403 Forbidden
    with pytest.raises(HTTPException) as exc_info:
        create_quotation(rbac_db, override_data, staff)
    assert exc_info.value.status_code == 403
    assert "not authorized to override" in exc_info.value.detail


def test_manager_can_override_rates_with_audit(rbac_db):
    manager = rbac_db.query(Profile).filter(Profile.role == "manager").first()
    cust = rbac_db.query(Customer).first()
    svc = rbac_db.query(Service).first()

    override_data = QuotationCreate(
        customer_id=str(cust.id),
        sections=[
            QuotationSectionSchema(
                section_name="Test Bay",
                service_id=str(svc.id),
                service_name=svc.service_name,
                length=Decimal("10"),
                breadth=Decimal("10"),
                rate_source="manual_override",
                original_catalogue_rate=Decimal("5.00"),
                applied_rate=Decimal("4.00"),
                override_reason="Volume discount approved by VP",
            )
        ]
    )

    q = create_quotation(rbac_db, override_data, manager)
    assert q.id is not None
    assert q.sections[0].rate_source == "manual_override"
    assert q.sections[0].applied_rate == Decimal("4.00")

    # Verify audit log was recorded
    audit = rbac_db.query(AuditLog).filter(AuditLog.action == "rate_override").first()
    assert audit is not None
    assert audit.performed_by_id == manager.id
    assert audit.changes_json["overridden_rate"] == "4.00"
    assert audit.changes_json["reason"] == "Volume discount approved by VP"


def test_staff_cannot_approve_quotation(rbac_db):
    staff = rbac_db.query(Profile).filter(Profile.role == "staff").first()
    cust = rbac_db.query(Customer).first()
    svc = rbac_db.query(Service).first()

    q_data = QuotationCreate(
        customer_id=str(cust.id),
        sections=[
            QuotationSectionSchema(
                section_name="Bay A",
                service_id=str(svc.id),
                service_name=svc.service_name,
                length=Decimal("10"),
                breadth=Decimal("10"),
                applied_rate=Decimal("5.00"),
            )
        ]
    )
    q = create_quotation(rbac_db, q_data, staff)
    transition_status(rbac_db, str(q.id), "submit", staff)

    # Staff trying to approve must fail
    with pytest.raises(HTTPException) as exc_info:
        transition_status(rbac_db, str(q.id), "approve", staff)
    assert exc_info.value.status_code == 403
