from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/api/loans", tags=["loans"])


@router.get("", response_model=List[schemas.LoanOut])
def list_loans(
    db: Session = Depends(get_db),
    _officer: models.Officer = Depends(auth.get_current_officer),
):
    return db.query(models.Loan).all()


@router.post("/{loan_id}/toggle-freeze", response_model=schemas.LoanOut)
def toggle_freeze(
    loan_id: str,
    db: Session = Depends(get_db),
    _officer: models.Officer = Depends(auth.require_role("officer")),
):
    loan = db.query(models.Loan).filter(models.Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    if loan.status not in ("active", "frozen"):
        raise HTTPException(
            status_code=409,
            detail=f"Cannot toggle freeze on a loan with status '{loan.status}'",
        )
    loan.status = "active" if loan.status == "frozen" else "frozen"
    db.commit()
    db.refresh(loan)
    return loan
