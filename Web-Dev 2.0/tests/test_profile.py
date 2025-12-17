# tests/test_profile.py
def get_token_for(client, email="alice@example.com", password="Secret123!", is_investor=False):
    # helper: sign up and login to get token
    client.post("/auth/signup", json={"email": email, "password": password, "is_investor": is_investor})
    r = client.post("/auth/login", data={"username": email, "password": password})
    assert r.status_code == 200, r.text
    return r.json()["access_token"]

def test_create_and_get_profile(db):
    token = get_token_for(db, email="alice@example.com", password="Secret123!", is_investor=False)
    headers = {"Authorization": f"Bearer {token}"}
    profile_payload = {
        "full_name": "Alice Founder",
        "bio": "Tech startup",
        "location": "Delhi",
        "interests": "ai,ml",
        "role": "founder"
    }
    r =db.post("/profile/", json=profile_payload, headers=headers)
    assert r.status_code in (200,201), f"create profile failed: {r.status_code} {r.text}"
    p = r.json()
    assert p["full_name"] == profile_payload["full_name"]

    # GET /profile/me
    r = db.get("/profile/me", headers=headers)
    assert r.status_code == 200, f"get me failed: {r.status_code} {r.text}"
    me = r.json()
    assert me["full_name"] == profile_payload["full_name"]
    assert me["role"] == profile_payload["role"]

    from uuid import UUID
    assert isinstance(me["id"], int)  # profile ID is int, not UUID
    assert isinstance(me["user_id"], UUID)  # user_id is UUID
    user_id: UUID; profile_data: dict
    
    