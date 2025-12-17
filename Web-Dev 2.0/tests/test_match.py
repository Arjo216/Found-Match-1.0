# tests/test_match.py

    # Your test code here

  
def signup_and_profile(client, email, password, role):
    # sign up
    client.post("/auth/signup", json={"email": email, "password": password, "is_investor": role == "investor"})
    # login
    r = client.post("/auth/login", data={"username": email, "password": password})
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    # create profile
    payload = {
        "full_name": email.split("@")[0].title(),
        "bio": f"{role} bio",
        "location": "City",
        "interests": "ai,blockchain" if role == "founder" else "ai,vc",
        "role": role
    }
    client.post("/profile/", json=payload, headers=headers)
    return token, headers

def test_matching(db):
    """Test matching logic."""
    # create one investor and one founder
    _, headers_investor = signup_and_profile(db, "investor@example.com", "InvPass123!", role="investor")
    token_founder, headers_founder = signup_and_profile(db, "founder@example.com", "FoundPass123!", role="founder")

    # founder requests matches (should see investor)
    r = db.get("/match/", headers=headers_founder)
    assert r.status_code == 200, f"match fetch failed: {r.status_code} {r.text}"
    data = r.json()

    # Expect a list/structure containing matches
    assert "matches" in data or isinstance(data, list) or isinstance(data, dict)
    # if matches key exists, assert at least one match
    if isinstance(data, dict) and "matches" in data:
        assert len(data["matches"]) >= 1, "no matches returned"
    # if it's a list, assert at least one match
    elif isinstance(data, list):
        assert len(data) >= 1, "no matches returned"
        
        from uuid import UUID
    assert isinstance(data["access_token"], str)
    assert data["token_type"] == "bearer"
    user_id: UUID; profile_data: dict