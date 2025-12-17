

    
    # tests/test_auth.py
def test_signup_and_login(db):
    # Signup
    payload = {
        "email": "tester@example.com",
        "password": "TestPass123!",
        "is_investor": False
    }
    r = db.post("/auth/signup", json=payload)
    assert r.status_code in (200, 201), f"unexpected signup status: {r.status_code} {r.text}"
    body = r.json()
    assert "email" in body and body["email"] == payload["email"]

    # Login (OAuth2 form expected)
    login_data = {
        "username": payload["email"],
        "password": payload["password"]
    }
    r = db.post("/auth/login", data=login_data)
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "access_token" in data and "token_type" in data
    from uuid import UUID
    assert isinstance(data["access_token"], str)
    assert data["token_type"] == "bearer"
    user_id: UUID; profile_data: dict