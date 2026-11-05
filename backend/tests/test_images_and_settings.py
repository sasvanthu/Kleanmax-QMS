import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.database import SessionLocal
from backend.app.models.all_models import CompanySetting, Quotation

client = TestClient(app)

def test_company_settings_update_and_persistence():
    # 1. Login as Super Admin
    login_res = client.post("/api/auth/login", json={"email": "superadmin", "password": "superadmin"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Update Cleantech settings
    update_payload = {
        "company_code": "cleantech",
        "company_name": "Cleantech Services Enterprise",
        "legal_name": "Cleantech Facility Solutions Private Limited",
        "gstin": "33AABCC1234D1Z5",
        "address_line1": "Guindy Industrial Estate",
        "city": "Chennai",
        "state": "Tamil Nadu",
        "state_code": "33",
        "pincode": "600032",
        "phone1": "+91 99999 88888",
        "bank_name": "HDFC Corporate Bank",
        "bank_account_name": "CLEANTECH SERVICES ENTERPRISE",
        "bank_account_no": "999888777666",
        "bank_ifsc": "HDFC0009999",
        "bank_branch": "Guindy Branch",
        "quotation_prefix": "CTS",
        "default_validity_days": 30,
        "terms_and_conditions": "1. 100% advance.\\n2. Valid for 30 days."
    }

    put_res = client.put("/api/company/cleantech", json=update_payload, headers=headers)
    assert put_res.status_code == 200
    data = put_res.json()
    assert data["company_name"] == "Cleantech Services Enterprise"
    assert data["bank_name"] == "HDFC Corporate Bank"

    # 3. Fetch to confirm DB persistence
    get_res = client.get("/api/company/cleantech")
    assert get_res.status_code == 200
    assert get_res.json()["bank_account_no"] == "999888777666"


def test_quotation_creation_with_image_url():
    # 1. Login as kleanmaxpro
    login_res = client.post("/api/auth/login", json={"email": "kleanmaxpro", "password": "kleanmaxpro"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create customer if needed or fetch
    cust_res = client.get("/api/customers", headers=headers)
    assert cust_res.status_code == 200
    customers = cust_res.json()
    assert len(customers) > 0
    cust_id = customers[0]["id"]

    # 3. Create Quotation with Supabase image_url
    sample_img_url = "https://fqnlnqbvgclacntrkngi.supabase.co/storage/v1/object/public/quotation-images/kleanmaxpro/rb800_test.png"
    quote_payload = {
        "customer_id": cust_id,
        "company_code": "kleanmaxpro",
        "quotation_number": "KMP/TEST-IMG/001",
        "quotation_type": "rental",
        "job_description": "MONTHLY RENTAL WITH MACHINE PHOTO",
        "image_url": sample_img_url,
        "items": [
            {
                "item_name": "RIDE ON SCRUBBER MACHINE RB-800",
                "description": "800mm scrubbing width",
                "quantity": 1,
                "uom": "NOS",
                "unit_price": 32000.0,
                "applied_rate": 32000.0,
                "tax_rate": 18.0,
                "line_total": 32000.0,
                "rate_source": "catalogue"
            }
        ]
    }

    create_res = client.post("/api/quotations", json=quote_payload, headers=headers)
    assert create_res.status_code == 200
    created = create_res.json()
    assert created["image_url"] == sample_img_url
    assert float(created["final_amount"]) > 0
    quote_id = created["id"]

    # 4. Verify in DB
    db = SessionLocal()
    db_quote = db.query(Quotation).filter(Quotation.id == quote_id).first()
    assert db_quote is not None
    assert db_quote.image_url == sample_img_url
    db.close()

    # 5. Verify Word Docx generation executes with the image_url and doesn't crash
    docx_res = client.get(f"/api/quotations/{quote_id}/docx", headers=headers)
    assert docx_res.status_code == 200
    assert len(docx_res.content) > 1000

    # 6. Verify HTML preview executes with the image_url
    html_res = client.get(f"/api/quotations/{quote_id}/html", headers=headers)
    assert html_res.status_code == 200
    assert sample_img_url in html_res.text
