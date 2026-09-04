def test_otp_request_returns_demo_code(client):
    res = client.post("/api/auth/otp/request", json={"phone": "9876543210"})
    assert res.status_code == 200
    body = res.json()
    assert "demo_code" in body
    assert len(body["demo_code"]) == 6


def test_otp_request_rejects_invalid_phone(client):
    res = client.post("/api/auth/otp/request", json={"phone": "12345"})
    assert res.status_code == 422


def test_otp_verify_wrong_code_fails(client):
    client.post("/api/auth/otp/request", json={"phone": "9876543210"})
    res = client.post("/api/auth/otp/verify", json={"phone": "9876543210", "code": "000000"})
    assert res.status_code == 400


def test_otp_verify_correct_code_issues_token(client):
    req = client.post("/api/auth/otp/request", json={"phone": "9876543210"})
    code = req.json()["demo_code"]
    res = client.post("/api/auth/otp/verify", json={"phone": "9876543210", "code": code})
    assert res.status_code == 200
    assert "access_token" in res.json()


def test_protected_route_requires_token(client):
    res = client.get("/api/applications")
    assert res.status_code in (401, 403)


def test_otp_rate_limit(client):
    for _ in range(3):
        client.post("/api/auth/otp/request", json={"phone": "9998887777"})
    res = client.post("/api/auth/otp/request", json={"phone": "9998887777"})
    assert res.status_code == 429
