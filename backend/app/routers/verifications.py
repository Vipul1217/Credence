from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/api/verifications", tags=["verifications"])


@router.get("", response_model=schemas.PaginatedVerifications)
def list_verifications(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    _officer: models.Officer = Depends(auth.get_current_officer),
):
    q = db.query(models.VerificationEvent)
    total = q.count()
    items = q.order_by(models.VerificationEvent.timestamp.desc()).offset(offset).limit(limit).all()
    return {"items": items, "meta": {"total": total, "limit": limit, "offset": offset}}


@router.post("", response_model=schemas.VerificationEventOut)
def submit_verification(payload: schemas.VerificationEventIn, db: Session = Depends(get_db)):
    """This is the endpoint a merchant's NFC/QR reader hits at the point of
    sale — it's intentionally NOT behind officer auth, since the caller here
    is reader hardware / a merchant-side client, not a logged-in officer.
    In production this would be authenticated with a separate merchant-device
    credential (e.g. an API key issued per reader), not the officer JWT."""
    merchant = db.query(models.Merchant).filter(models.Merchant.id == payload.merchant_id).first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
    if merchant.verification_status != "verified":
        raise HTTPException(status_code=403, detail="Merchant is not yet verified for transactions")

    category_matched = (
        payload.category_requested is None or payload.category_requested == merchant.category
    )

    event = models.VerificationEvent(
        seeker_name=payload.seeker_name,
        merchant_id=merchant.id,
        merchant_name=merchant.name,
        loan_id=payload.loan_id,
        category_requested=payload.category_requested,
        category_matched=category_matched,
        mode=payload.mode,
        amount=payload.amount,
        status="approved" if category_matched else "declined",
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event
