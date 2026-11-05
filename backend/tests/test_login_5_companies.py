import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

@pytest.mark.parametrize("username,password,expected_company,expected_role", [
    ("superadmin", "superadmin", "all", "admin"),
    ("kleanmaxpro", "kleanmaxpro", "kleanmaxpro", "staff"),
    ("kleanmax", "kleanmax", "kleanmax", "staff"),
    ("uniquepainters", "uniquepainters", "uniquepainters", "staff"),
    ("cleantech", "cleantech", "cleantech", "staff"),
    ("admin@kleanmaxpro.com", "admin123", "all", "admin"),
])
def test_5_companies_and_superadmin_login(username, password, expected_company, expected_role):
    res = client.post("/api/auth/login", json={"email": username, "password": password})
    assert res.status_code == 200, f"Login failed for {username}: {res.text}"
    data = res.json()
    assert "access_token" in data
    user = data["user"]
    assert user["company_code"] == expected_company
    assert user["role"] == expected_role

