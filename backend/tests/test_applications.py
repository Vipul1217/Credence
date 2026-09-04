from app import models


def get_token(client, phone="9876543210"):
    req = client.post("/api/auth/otp/request", json={"phone": phone})
    code = req.json()["demo_code"]
    res = client.post("/api/auth/otp/verify", json={"phone": phone, "code": code})
    return res.json()["access_token"]


def auth_headers(client):
    return {"Authorization": f"Bearer {get_token(client)}"}


def test_list_applications_empty(client):
    res = client.get("/api/applications", headers=auth_headers(client))
    assert res.status_code == 200
    body = res.json()
    assert body["items"] == []
    assert body["meta"]["total"] == 0


def test_decision_on_missing_application_returns_404(client):
    res = client.post(
        "/api/applications/APP-DOES-NOT-EXIST/decision",
        json={"decision": "approved"},
        headers=auth_headers(client),
    )
    assert res.status_code == 404


def test_decision_twice_conflicts(client, db_session):
    app_ = models.Applicant(name="Test User", score=700, band="high", amount=10000, category="Cart & Equipment")
    db_session.add(app_)
    db_session.commit()

    headers = auth_headers(client)
    first = client.post(f"/api/applications/{app_.id}/decision", json={"decision": "approved"}, headers=headers)
    assert first.status_code == 200

    second = client.post(f"/api/applications/{app_.id}/decision", json={"decision": "rejected"}, headers=headers)
    assert second.status_code == 409
