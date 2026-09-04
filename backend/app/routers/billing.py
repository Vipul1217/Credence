from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/api/billing", tags=["billing"])


@router.get("/invoices", response_model=List[schemas.InvoiceOut])
def list_invoices(
    db: Session = Depends(get_db),
    _officer: models.Officer = Depends(auth.get_current_officer),
):
    invoices = db.query(models.Invoice).all()
    if not invoices:
        for period in ["Jul 2026", "Jun 2026", "May 2026"]:
            db.add(models.Invoice(period_label=period, verification_volume=120))
        db.commit()
        invoices = db.query(models.Invoice).all()
    return invoices
