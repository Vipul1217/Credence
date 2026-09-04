from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/api/merchants", tags=["merchants"])


@router.get("", response_model=schemas.PaginatedMerchants)
def list_merchants(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    _officer: models.Officer = Depends(auth.get_current_officer),
):
    q = db.query(models.Merchant)
    total = q.count()
    items = q.order_by(models.Merchant.registered_date.desc()).offset(offset).limit(limit).all()
    return {"items": items, "meta": {"total": total, "limit": limit, "offset": offset}}


@router.post("", response_model=schemas.MerchantOut)
def add_merchant(
    payload: schemas.MerchantIn,
    db: Session = Depends(get_db),
    _officer: models.Officer = Depends(auth.require_role("officer")),
):
    merchant = models.Merchant(
        name=payload.name,
        category=payload.category,
        location=payload.location,
        reader_type=payload.reader_type,
        verification_status="pending",
    )
    db.add(merchant)
    db.commit()
    db.refresh(merchant)
    return merchant


@router.post("/{merchant_id}/approve", response_model=schemas.MerchantOut)
def approve_merchant(
    merchant_id: str,
    db: Session = Depends(get_db),
    _officer: models.Officer = Depends(auth.require_role("officer")),
):
    merchant = db.query(models.Merchant).filter(models.Merchant.id == merchant_id).first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
    if merchant.verification_status == "verified":
        raise HTTPException(status_code=409, detail="Merchant is already verified")
    merchant.verification_status = "verified"
    db.commit()
    db.refresh(merchant)
    return merchant
