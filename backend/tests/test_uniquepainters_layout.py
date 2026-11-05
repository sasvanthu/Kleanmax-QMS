import pytest
import io
import docx
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.database import SessionLocal
from backend.app.models.all_models import Quotation, CompanySetting, Customer, Profile
from backend.app.services.docx_generator import generate_quotation_docx_bytes
from backend.app.services.pdf_generator import render_quotation_html
from backend.app.services.quotation_service import create_quotation
from backend.app.schemas.quotation import QuotationCreate, QuotationSectionSchema, QuotationItemSchema

client = TestClient(app)

def test_uniquepainters_docx_and_pdf_no_client_signature():
    # Login as admin to get token
    login_resp = client.post("/api/auth/login", json={"email": "admin@kleanmaxpro.com", "password": "admin123"})
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    db = SessionLocal()
    try:
        # Get or create company setting for uniquepainters
        comp = db.query(CompanySetting).filter(CompanySetting.company_code == 'uniquepainters').first()
        assert comp is not None

        # Get or create customer
        cust = db.query(Customer).first()
        if not cust:
            cust = Customer(
                company_name="TRUE NUTRITION",
                billing_address_line1="KODUNGAIYUR",
                billing_city="Chennai",
                billing_state="Tamil Nadu",
                billing_state_code="33"
            )
            db.add(cust)
            db.flush()

        admin = db.query(Profile).filter(Profile.role == 'admin').first()

        # Create Unique Painters Quotation
        q_create = QuotationCreate(
            customer_id=cust.id,
            company_code='uniquepainters',
            quotation_number='UNP/TEST/001',
            quotation_type='area_based',
            job_description='Surface coating and interior painting proposal',
            notes='Please call 9500065813',
            terms_and_conditions='GST 18% Extra\n50% Advance',
            items=[
                QuotationItemSchema(
                    item_name="INTERIOR WALL PAINTING: ASIAN PAINT TRACTOR EMULSION",
                    description="APPLY TWO COAT PREMIER EMULSION",
                    quantity=1,
                    uom="SQ_FT",
                    unit_price=93000,
                    applied_rate=93000,
                    tax_rate=0,
                    line_total=93000,
                    item_order=1
                )
            ],
            sections=[
                QuotationSectionSchema(
                    section_order=1,
                    section_name="INTERIOR WALL PAINTING",
                    service_name="ASIAN PAINT TRACTOR EMULSION",
                    length=4200,
                    breadth=1,
                    measurement_unit="ft",
                    calculated_area=4200,
                    repetitions=1,
                    billable_area=4200,
                    billable_uom="sq_ft",
                    applied_rate=22.14,
                    line_total=93000,
                    notes="APPLY TWO COAT PREMIER EMULSION"
                )
            ],
            tax_rate=0,
            discount_type="none",
            discount_value=0
        )

        created = create_quotation(db, q_create, admin)
        assert created.company_code == 'uniquepainters'
        assert created.final_amount > 0

        # Generate Word Document (.docx)
        docx_bytes = generate_quotation_docx_bytes(
            quotation=created,
            company=comp,
            customer=cust,
            sections=created.sections,
            items=created.items
        )
        assert docx_bytes is not None
        assert len(docx_bytes) > 1000

        # Parse docx and check text
        doc_stream = io.BytesIO(docx_bytes)
        parsed_doc = docx.Document(doc_stream)
        all_text = " ".join([p.text for p in parsed_doc.paragraphs])
        for t in parsed_doc.tables:
            for row in t.rows:
                for c in row.cells:
                    all_text += " " + c.text

        # Verify NO "Client Signature"
        assert "Client Signature" not in all_text

        # Verify company details present
        assert "Unique Painters" in all_text
        assert "SURFACE COATING & PAINTING PROPOSAL" in all_text

        # Generate HTML (for PDF preview)
        html_out = render_quotation_html(
            quotation=created,
            company=comp,
            customer=cust,
            sections=created.sections,
            items=created.items
        )
        assert html_out is not None
        assert "Client Signature" not in html_out
        assert "unp-banner-img" in html_out

    finally:
        db.close()
