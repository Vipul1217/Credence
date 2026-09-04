from app import models


def test_verification_declines_on_category_mismatch(client, db_session):
    merchant = models.Merchant(
        name="Test Merchant", category="Cart & Equipment", location="Test Location",
        verification_status="verified",
    )
    db_session.add(merchant)
    db_session.commit()

    res = client.post("/api/verifications", json={
        "seeker_name": "Test Seeker",
        "merchant_id": merchant.id,
        "category_requested": "Sewing Equipment",
        "mode": "NFC",
        "amount": 500,
    })
    assert res.status_code == 200
    assert res.json()["status"] == "declined"


def test_verification_approves_on_category_match(client, db_session):
    merchant = models.Merchant(
        name="Test Merchant", category="Cart & Equipment", location="Test Location",
        verification_status="verified",
    )
    db_session.add(merchant)
    db_session.commit()

    res = client.post("/api/verifications", json={
        "seeker_name": "Test Seeker",
        "merchant_id": merchant.id,
        "category_requested": "Cart & Equipment",
        "mode": "QR",
        "amount": 500,
    })
    assert res.status_code == 200
    assert res.json()["status"] == "approved"


def test_verification_rejects_unverified_merchant(client, db_session):
    merchant = models.Merchant(
        name="Pending Merchant", category="Cart & Equipment", location="Test Location",
        verification_status="pending",
    )
    db_session.add(merchant)
    db_session.commit()

    res = client.post("/api/verifications", json={
        "seeker_name": "Test Seeker",
        "merchant_id": merchant.id,
        "category_requested": "Cart & Equipment",
        "mode": "NFC",
        "amount": 500,
    })
    assert res.status_code == 403
