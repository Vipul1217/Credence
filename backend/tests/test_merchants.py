from app import models


def get_token(client, phone="9876543210"):
    req = client.post("/api/auth/otp/request", json={"phone": phone})
    code = req.json()["demo_code"]
    res = client.post("/api/auth/otp/verify", json={"phone": phone, "code": code})
    return res.json()["access_token"]


def auth_headers(client):
    return {"Authorization": f"Bearer {get_token(client)}"}


def test_add_merchant_requires_auth(client):
    res = client.post("/api/merchants", json={
        "name": "Test Merchant", "category": "Cart & Equipment", "location": "Test Loc"
    })
    assert res.status_code in (401, 403)


def test_add_and_approve_merchant(client):
    headers = auth_headers(client)
    add = client.post("/api/merchants", json={
        "name": "Test Merchant", "category": "Cart & Equipment", "location": "Test Loc"
    }, headers=headers)
    assert add.status_code == 200
    merchant_id = add.json()["id"]
    assert add.json()["verification_status"] == "pending"

    approve = client.post(f"/api/merchants/{merchant_id}/approve", headers=headers)
    assert approve.status_code == 200
    assert approve.json()["verification_status"] == "verified"

    approve_again = client.post(f"/api/merchants/{merchant_id}/approve", headers=headers)
    assert approve_again.status_code == 409


def test_applications_pagination(client, db_session):
    for i in range(5):
        db_session.add(models.Applicant(
            name=f"Applicant {i}", score=600 + i, band="medium",
            amount=10000, category="Raw Material",
        ))
    db_session.commit()

    headers = auth_headers(client)
    res = client.get("/api/applications?limit=2&offset=0", headers=headers)
    assert res.status_code == 200
    body = res.json()
    assert len(body["items"]) == 2
    assert body["meta"]["total"] == 5
