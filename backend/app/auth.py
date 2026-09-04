import hashlib
import hmac
import os
import random
import time
from collections import defaultdict
from datetime import datetime, timedelta

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from . import models
from .database import get_db

JWT_SECRET = os.getenv("JWT_SECRET", "dev_secret_change_me")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "120"))
OTP_EXPIRE_SECONDS = int(os.getenv("OTP_EXPIRE_SECONDS", "300"))

# ---------- Simple in-memory rate limiter for OTP requests ----------
# Keyed by phone number: list of request timestamps (seconds).
# Not shared across multiple server processes/instances - fine for a single
# dev/demo instance, swap for Redis in production (see README).
_otp_request_log: dict[str, list[float]] = defaultdict(list)
OTP_MAX_REQUESTS = 3
OTP_WINDOW_SECONDS = 600  # 10 minutes


def check_otp_rate_limit(phone: str) -> None:
    now = time.time()
    recent = [t for t in _otp_request_log[phone] if now - t < OTP_WINDOW_SECONDS]
    if len(recent) >= OTP_MAX_REQUESTS:
        raise HTTPException(
            status_code=429,
            detail=f"Too many OTP requests for this number. Try again in a few minutes.",
        )
    recent.append(now)
    _otp_request_log[phone] = recent


def generate_otp_code() -> str:
    return str(random.randint(100000, 999999))


def _hash_code(code: str) -> str:
    # OTP codes are short-lived, single-use, and rate-limited, so a salted
    # SHA-256 digest (rather than a slow password hash like bcrypt) is
    # appropriate here and sidesteps bcrypt/passlib version friction.
    pepper = os.getenv("JWT_SECRET", "dev_secret_change_me")
    return hashlib.sha256(f"{pepper}:{code}".encode()).hexdigest()


def create_otp_request(db: Session, phone: str) -> str:
    """Creates and stores a hashed OTP for the given phone, returns the plaintext code
    (in production this would be sent via an SMS provider, not returned to the caller)."""
    code = generate_otp_code()
    otp = models.OtpRequest(
        phone=phone,
        code_hash=_hash_code(code),
        expires_at=datetime.utcnow() + timedelta(seconds=OTP_EXPIRE_SECONDS),
    )
    db.add(otp)
    db.commit()
    return code


def verify_otp_code(db: Session, phone: str, code: str) -> bool:
    otp = (
        db.query(models.OtpRequest)
        .filter(models.OtpRequest.phone == phone, models.OtpRequest.consumed == False)  # noqa: E712
        .order_by(models.OtpRequest.created_at.desc())
        .first()
    )
    if not otp:
        return False
    if otp.expires_at < datetime.utcnow():
        return False
    if not hmac.compare_digest(_hash_code(code), otp.code_hash):
        return False
    otp.consumed = True
    db.commit()
    return True


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])


# ---------- Route protection dependencies ----------
bearer_scheme = HTTPBearer()


def get_current_officer(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> models.Officer:
    """Validates the Bearer JWT and loads the officer it belongs to.
    Raises 401 if the token is missing, malformed, expired, or refers to a
    deleted account."""
    token = credentials.credentials
    try:
        payload = decode_access_token(token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    officer_id = payload.get("sub")
    officer = db.query(models.Officer).filter(models.Officer.id == officer_id).first()
    if not officer:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Officer account not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return officer


def require_role(*allowed_roles: str):
    """Dependency factory for role-based access control.
    Usage: Depends(require_role("officer"))"""

    def _checker(officer: models.Officer = Depends(get_current_officer)) -> models.Officer:
        if officer.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{officer.role}' is not permitted to perform this action",
            )
        return officer

    return _checker
