from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/api/applications", tags=["applications"])


@router.get("", response_model=schemas.PaginatedApplicants)
def list_applications(
    band: Optional[str] = None,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    _officer: models.Officer = Depends(auth.get_current_officer),
):
    q = db.query(models.Applicant)
    if band and band != "all":
        q = q.filter(models.Applicant.band == band)
    total = q.count()
    items = q.order_by(models.Applicant.date_applied.desc()).offset(offset).limit(limit).all()
    return {"items": items, "meta": {"total": total, "limit": limit, "offset": offset}}


@router.get("/{app_id}", response_model=schemas.ApplicantOut)
def get_application(
    app_id: str,
    db: Session = Depends(get_db),
    _officer: models.Officer = Depends(auth.get_current_officer),
):
    app_ = db.query(models.Applicant).filter(models.Applicant.id == app_id).first()
    if not app_:
        raise HTTPException(status_code=404, detail="Application not found")
    return app_


@router.post("/{app_id}/decision", response_model=schemas.ApplicantOut)
def decide_application(
    app_id: str,
    payload: schemas.ApplicationDecisionIn,
    db: Session = Depends(get_db),
    _officer: models.Officer = Depends(auth.require_role("officer")),
):
    app_ = db.query(models.Applicant).filter(models.Applicant.id == app_id).first()
    if not app_:
        raise HTTPException(status_code=404, detail="Application not found")
    if app_.status != "pending":
        raise HTTPException(
            status_code=409,
            detail=f"Application already decided (status: {app_.status})",
        )
    app_.status = payload.decision
    db.commit()
    db.refresh(app_)
    return app_
