# routers/auth.py
import os
from datetime import timedelta
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query, Response, Request
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db

# utils from utils/auth.py (replace path if needed)
from utils.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    decode_access_token,
    get_current_user as utils_get_current_user,  # optional reuse
)

#router = APIRouter(prefix="/auth", tags=["Auth"])
router = APIRouter(tags=["Auth"])

# OAuth2 scheme for Swagger "Authorize" modal - matches tokenUrl below
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# token expiry (minutes)
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# Enable cookie auth by setting AUTH_USE_COOKIES=true in .env
USE_COOKIES = os.getenv("AUTH_USE_COOKIES", "false").lower() == "true"
# cookie name
COOKIE_NAME = os.getenv("AUTH_COOKIE_NAME", "fm_token")
# cookie settings
COOKIE_SECURE = os.getenv("AUTH_COOKIE_SECURE", "false").lower() == "true"  # true in prod with HTTPS
COOKIE_SAMESITE = os.getenv("AUTH_COOKIE_SAMESITE", "lax")  # 'lax' or 'none' for cross-site
COOKIE_PATH = "/"
COOKIE_HTTPONLY = True


# -----------------------
# Signup
# -----------------------
@router.post("/signup", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def signup(user_in: schemas.UserCreate, db: Session = Depends(get_db)) -> Any:
    """
    Create a new user. Request model: schemas.UserCreate (email, password, optional is_investor)
    """
    existing = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    hashed = get_password_hash(user_in.password)
    new_user = models.User(email=user_in.email, hashed_password=hashed, is_investor=user_in.is_investor)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


# -----------------------
# Login
# -----------------------
@router.post("/login", response_model=schemas.Token)
def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> Any:
    """
    Login endpoint. Accepts form-data: username (email) + password.
    Returns JSON token OR sets HttpOnly cookie (if AUTH_USE_COOKIES=true).
    """
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
     # routers/auth.py (inside login function)
    print("DEBUG: login attempt, username:", form_data.username)

    expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(subject=str(user.id), expires_delta=expires)

    if USE_COOKIES:
        # Set HttpOnly cookie and still return a small JSON confirming login
        # Set secure=True in production with HTTPS
        response.set_cookie(
            key=COOKIE_NAME,
            value=token,
            httponly=COOKIE_HTTPONLY,
            secure=COOKIE_SECURE,
            samesite=COOKIE_SAMESITE,
            path=COOKIE_PATH,
            max_age=int(expires.total_seconds()),
        )
        return {"access_token": token, "token_type": "bearer"}
    else:
        # Token-in-body flow (frontend stores in localStorage)
        return {"access_token": token, "token_type": "bearer"}


# -----------------------
# Logout (cookie mode)
# -----------------------
@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(response: Response):
    """
    Clears the auth cookie (only meaningful when using cookie auth).
    """
    response.delete_cookie(key=COOKIE_NAME, path=COOKIE_PATH)
    return {"ok": True}


# -----------------------
# Helpers for other routers
# -----------------------
def get_current_user_from_token(token: str, db: Session) -> Optional[models.User]:
    """
    Decode token and return user instance (or None).
    Useful for routes that want to accept a raw token param (UI convenience).
    """
    user_id = decode_access_token(token)
    if not user_id:
        return None
    try:
        # SQLAlchemy 1.4+ supports db.get
        user = db.get(models.User, user_id)  # type: ignore
    except Exception:
        user = db.query(models.User).filter(models.User.id == user_id).first()
    return user


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    """
    FastAPI dependency for protected routes using Bearer token in Authorization header.
    Example: current_user: User = Depends(get_current_user)
    """
    user = get_current_user_from_token(token, db)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
    return user


# -----------------------
# UI-friendly endpoints
# -----------------------
@router.get("/me", response_model=schemas.UserOut, summary="Get current user (use Authorize → Bearer <token>)")
def get_me(current_user: models.User = Depends(get_current_user)) -> Any:
    """Return current user via standard bearer header."""
    return current_user


@router.get(
    "/user",
    response_model=schemas.UserOut,
    summary="Get user by pasting raw JWT token in query",
    description="Paste raw JWT into `token` query param (useful in the UI if you don't want to open Authorize modal).",
)
def get_user_by_token(token: str = Query(..., description="Your raw JWT token"), db: Session = Depends(get_db)) -> Any:
    user = get_current_user_from_token(token, db)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return user


# -----------------------
# Optional cookie-aware helper (for other routers)
# -----------------------
def get_current_user_from_cookie_or_bearer(request: Request, token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Optional[models.User]:
    """
    Attempt to get current user either from HttpOnly cookie (if present) or from Bearer token.
    Useful if you want endpoints that support both modes.
    """
    # Try cookie first
    cookie_token = request.cookies.get(COOKIE_NAME)
    if cookie_token:
        u = get_current_user_from_token(cookie_token, db)
        if u:
            return u
    # Fallback to bearer token
    if token:
        return get_current_user_from_token(token, db)
    return None

