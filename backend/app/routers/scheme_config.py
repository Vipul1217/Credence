from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/api/scheme-config", tags=["scheme-config"])


def get_or_create_config(db: Session) -> models.SchemeConfig:
    cfg = db.query(models.SchemeConfig).first()
    if not cfg:
        cfg = models.SchemeConfig(
            purpose_categories=["Cart & Equipment", "Sewing Equipment", "Raw Material", "Shop Renovation"],
            amount_tiers=[10000, 20000, 50000],
            remote_mode_enabled=True,
        )
        db.add(cfg)
        db.commit()
        db.refresh(cfg)
    return cfg


@router.get("", response_model=schemas.SchemeConfigOut)
def get_config(
    db: Session = Depends(get_db),
    _officer: models.Officer = Depends(auth.get_current_officer),
):
    return get_or_create_config(db)


@router.patch("", response_model=schemas.SchemeConfigOut)
def update_config(
    payload: schemas.SchemeConfigUpdateIn,
    db: Session = Depends(get_db),
    _officer: models.Officer = Depends(auth.require_role("officer")),
):
    cfg = get_or_create_config(db)
    if payload.purpose_categories is not None:
        cfg.purpose_categories = payload.purpose_categories
    if payload.amount_tiers is not None:
        cfg.amount_tiers = payload.amount_tiers
    if payload.remote_mode_enabled is not None:
        cfg.remote_mode_enabled = payload.remote_mode_enabled
    db.commit()
    db.refresh(cfg)
    return cfg
