import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, Enum, ForeignKey, JSON
)
from sqlalchemy.orm import relationship

from .database import Base


def gen_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:8].upper()}"


class RoleEnum(str, enum.Enum):
    officer = "officer"
    merchant = "merchant"
    seeker = "seeker"


class ApplicationStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    more_info = "more_info"


class LoanStatus(str, enum.Enum):
    active = "active"
    frozen = "frozen"
    flagged = "flagged"
    closed = "closed"


class MerchantStatus(str, enum.Enum):
    pending = "pending"
    verified = "verified"
    rejected = "rejected"


class ReaderType(str, enum.Enum):
    nfc_only = "NFC only"
    qr_only = "QR only"
    both = "NFC + QR"


class VerificationMode(str, enum.Enum):
    nfc = "NFC"
    qr = "QR"


class Officer(Base):
    __tablename__ = "officers"
    id = Column(String, primary_key=True, default=lambda: gen_id("OFC"))
    name = Column(String, nullable=False)
    phone = Column(String, unique=True, nullable=False)
    scheme_id = Column(String, ForeignKey("scheme_configs.id"), nullable=True)
    role = Column(Enum(RoleEnum), default=RoleEnum.officer)
    permissions = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)


class OtpRequest(Base):
    __tablename__ = "otp_requests"
    id = Column(String, primary_key=True, default=lambda: gen_id("OTP"))
    phone = Column(String, nullable=False, index=True)
    code_hash = Column(String, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    consumed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Applicant(Base):
    __tablename__ = "applicants"
    id = Column(String, primary_key=True, default=lambda: gen_id("APP"))
    name = Column(String, nullable=False)
    score = Column(Integer, nullable=False)
    band = Column(String, nullable=False)  # high / medium / low
    amount = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    date_applied = Column(DateTime, default=datetime.utcnow)
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.pending)


class Loan(Base):
    __tablename__ = "loans"
    id = Column(String, primary_key=True, default=lambda: gen_id("LN"))
    applicant_id = Column(String, ForeignKey("applicants.id"), nullable=True)
    name = Column(String, nullable=False)
    status = Column(Enum(LoanStatus), default=LoanStatus.active)
    balance = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    mode = Column(Enum(VerificationMode), default=VerificationMode.nfc)
    disbursed_at = Column(DateTime, default=datetime.utcnow)


class Merchant(Base):
    __tablename__ = "merchants"
    id = Column(String, primary_key=True, default=lambda: gen_id("MER"))
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    location = Column(String, nullable=False)
    verification_status = Column(Enum(MerchantStatus), default=MerchantStatus.pending)
    reader_type = Column(Enum(ReaderType), default=ReaderType.both)
    registered_date = Column(DateTime, default=datetime.utcnow)


class VerificationEvent(Base):
    __tablename__ = "verification_events"
    id = Column(String, primary_key=True, default=lambda: gen_id("VE"))
    seeker_name = Column(String, nullable=False)
    merchant_id = Column(String, ForeignKey("merchants.id"), nullable=True)
    merchant_name = Column(String, nullable=False)
    loan_id = Column(String, ForeignKey("loans.id"), nullable=True)
    category_requested = Column(String, nullable=True)
    category_matched = Column(Boolean, default=True)
    mode = Column(Enum(VerificationMode), default=VerificationMode.nfc)
    amount = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="approved")  # approved / declined


class SchemeConfig(Base):
    __tablename__ = "scheme_configs"
    id = Column(String, primary_key=True, default=lambda: gen_id("SCH"))
    name = Column(String, nullable=False, default="PM Street Vendor Credit Scheme")
    purpose_categories = Column(JSON, default=list)
    amount_tiers = Column(JSON, default=list)
    remote_mode_enabled = Column(Boolean, default=True)


class Invoice(Base):
    __tablename__ = "invoices"
    id = Column(String, primary_key=True, default=lambda: gen_id("INV"))
    period_label = Column(String, nullable=False)
    licensing_fee = Column(Float, default=45000)
    verification_volume = Column(Integer, default=0)
    status = Column(String, default="paid")
    created_at = Column(DateTime, default=datetime.utcnow)
