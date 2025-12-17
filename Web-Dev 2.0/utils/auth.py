# utils/auth.py
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from database import get_db
import models

# Load secrets from environment (use .env in dev)
SECRET_KEY = os.getenv("JWT_SECRET", os.getenv("SECRET_KEY", "please-change-me-in-prod"))
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# Password hashing context
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme for Bearer tokens (login endpoint url)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# ------------------------
# Password utilities
# ------------------------
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against the hashed value stored in DB."""
    return pwd_ctx.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Return the bcrypt hash for a plaintext password."""
    return pwd_ctx.hash(password)


# ------------------------
# JWT utilities
# ------------------------
def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT token that encodes `sub` (subject, usually user id).
    Expires after `expires_delta` or ACCESS_TOKEN_EXPIRE_MINUTES.
    """
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    payload: Dict[str, Any] = {"exp": expire, "sub": str(subject)}
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token


def decode_access_token(token: str) -> Optional[str]:
    """
    Decode a JWT and return the subject (user id) or None if invalid.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: Optional[str] = payload.get("sub")
        return user_id
    except JWTError:
        return None


# ------------------------
# FastAPI dependency
# ------------------------
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    """
    FastAPI dependency - use in routes: current_user: models.User = Depends(get_current_user)
    Raises 401 if token invalid or user not found.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    user_id = decode_access_token(token)
    if not user_id:
        raise credentials_exception

    # Query user from DB. This is safe across SQLAlchemy versions:
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user


# Optional helper if you want to ensure user is active
def get_current_active_user(current_user: models.User = Depends(get_current_user)) -> models.User:
    # If your model has 'is_active' or similar, enforce it here
    if getattr(current_user, "is_active", True) is False:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


# ------------------------
# Profile / DB helpers
# ------------------------
def create_profile(db: Session, user_id: str, profile_data: dict) -> models.Profile:
    """
    Create a new profile record for a user.
    """
    new_profile = models.Profile(user_id=user_id, **profile_data)
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    return new_profile


def profile_exists(db: Session, user_id: str) -> bool:
    """
    Return True if profile exists for user_id.
    """
    return db.query(models.Profile).filter(models.Profile.user_id == user_id).first() is not None


def delete_profile(db: Session, user_id: str) -> None:
    """
    Delete the user's profile (raises HTTPException 404 if not found).
    """
    profile = db.query(models.Profile).filter(models.Profile.user_id == user_id).first()
    if profile:
        db.delete(profile)
        db.commit()
        return
    raise HTTPException(status_code=404, detail="Profile not found")
