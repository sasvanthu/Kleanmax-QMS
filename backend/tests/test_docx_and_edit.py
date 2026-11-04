import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.database import SessionLocal
from backend.app.models.all_models import Quotation, Profile

client = TestClient(app)

def test_download_quotation_docx_and_pdf():
    # Login as admin to get token
    login_resp = client.post("/api/auth/login", json={"email": "admin@kleanmaxpro.com", "password": "admin123"})
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch quotations list
    list_resp = client.get("/api/quotations", headers=headers)
    assert list_resp.status_code == 200
    quotes = list_resp.json()
    assert len(quotes) > 0

    first_quote = quotes[0]
    quote_id = first_quote["id"]

    # Test docx endpoint
    docx_resp = client.get(f"/api/quotations/{quote_id}/docx", headers=headers)
    assert docx_resp.status_code == 200
    assert docx_resp.headers["content-type"] == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    assert len(docx_resp.content) > 1000  # Non-trivial docx binary

    # Test html endpoint
    html_resp = client.get(f"/api/quotations/{quote_id}/html", headers=headers)
    assert html_resp.status_code == 200
    assert "text/html" in html_resp.headers["content-type"]
    assert len(html_resp.text) > 500

    # Test update (edit) quotation
    patch_resp = client.patch(
        f"/api/quotations/{quote_id}",
        headers=headers,
        json={
            "job_description": "Updated commercial scope for testing edit functionality",
            "notes": "Verified live synchronization",
        }
    )
    assert patch_resp.status_code == 200
    updated = patch_resp.json()
    assert updated["job_description"] == "Updated commercial scope for testing edit functionality"
    assert updated["notes"] == "Verified live synchronization"

