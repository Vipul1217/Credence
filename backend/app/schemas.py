from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


# ---------- Auth ----------
class OtpRequestIn(BaseModel):
    phone: str = Field(..., pattern=r"^[6-9]\d{9}$")


class OtpVerifyIn(BaseModel):
    phone: str
    code: str = Field(..., min_length=6, max_length=6)


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class OfficerOut(BaseModel):
    id: str
    name: str
    phone: str
    role: str

    class Config:
        from_attributes = True


class PaginatedMeta(BaseModel):
    total: int
    limit: int
    offset: int


# ---------- Applications ----------
class ApplicantOut(BaseModel):
    id: str
    name: str
    score: int
    band: str
    amount: float
    category: str
    date_applied: datetime
    status: str

    class Config:
        from_attributes = True


class ApplicationDecisionIn(BaseModel):
    decision: str = Field(..., pattern="^(approved|rejected|more_info)$")


# ---------- Loans ----------
class LoanOut(BaseModel):
    id: str
    name: str
    status: str
    balance: float
    category: str
    mode: str

    class Config:
        from_attributes = True


# ---------- Merchants ----------
class MerchantIn(BaseModel):
    name: str
    category: str
    location: str
    reader_type: str = "NFC + QR"


class MerchantOut(MerchantIn):
    id: str
    verification_status: str

    class Config:
        from_attributes = True


# ---------- Verification events ----------
class VerificationEventIn(BaseModel):
    seeker_name: str
    merchant_id: str
    loan_id: Optional[str] = None
    category_requested: str
    mode: str = Field(..., pattern="^(NFC|QR)$")
    amount: float = Field(..., gt=0)


class VerificationEventOut(BaseModel):
    id: str
    seeker_name: str
    merchant_name: str
    category_matched: bool
    mode: str
    amount: float
    timestamp: datetime
    status: str

    class Config:
        from_attributes = True


class VerificationEventIn(BaseModel):
    """Submitted by a merchant's NFC/QR reader at the point of sale."""
    seeker_name: str
    merchant_id: str
    category_requested: Optional[str] = None
    mode: str = Field(..., pattern="^(NFC|QR)$")
    amount: float = Field(..., gt=0)
    loan_id: Optional[str] = None


class PaginatedApplicants(BaseModel):
    items: List[ApplicantOut]
    meta: PaginatedMeta


class PaginatedMerchants(BaseModel):
    items: List[MerchantOut]
    meta: PaginatedMeta


class PaginatedVerifications(BaseModel):
    items: List[VerificationEventOut]
    meta: PaginatedMeta


# ---------- Scheme config ----------
class SchemeConfigOut(BaseModel):
    id: str
    name: str
    purpose_categories: List[str]
    amount_tiers: List[float]
    remote_mode_enabled: bool

    class Config:
        from_attributes = True


class SchemeConfigUpdateIn(BaseModel):
    purpose_categories: Optional[List[str]] = None
    amount_tiers: Optional[List[float]] = None
    remote_mode_enabled: Optional[bool] = None


# ---------- Billing ----------
class InvoiceOut(BaseModel):
    id: str
    period_label: str
    licensing_fee: float
    verification_volume: int
    status: str

    class Config:
        from_attributes = True
