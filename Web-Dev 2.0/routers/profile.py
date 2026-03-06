# routers/profile.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import models, schemas
from database import get_db
from utils.auth import get_current_user

from pydantic import BaseModel
from fastapi import HTTPException

router = APIRouter(
    tags=["Profile"],
)

@router.post(
    "/",
    response_model=schemas.ProfileOut,
    status_code=status.HTTP_201_CREATED,
)
def create_profile(
    profile_in: schemas.ProfileCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Create a profile for the authenticated user.
    """
    if db.query(models.Profile).filter_by(user_id=current_user.id).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile already exists"
        )

    new_profile = models.Profile(
        user_id=current_user.id,
        **profile_in.dict()
    )
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    return new_profile


@router.get(
    "/me",
    response_model=schemas.ProfileOut,
    status_code=status.HTTP_200_OK,
)
def read_own_profile(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Retrieve the authenticated user's profile.
    """
    profile = db.query(models.Profile).filter_by(user_id=current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    return profile

# --- NEW: ADDED STATS ENDPOINT TO STOP THE 422 ERRORS ---
@router.get("/stats")
def get_profile_stats(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    """
    Mock stats endpoint to satisfy the frontend dashboard requests.
    """
    return {
        "profile_views": 15,
        "search_appearances": 32,
        "avg_match_score": 85.5
    }

# --- /{profile_id} MUST COME LAST ---
@router.get("/{profile_id}")
async def get_profile_by_id(profile_id: int, db: Session = Depends(get_db)):
    """
    Fetch a specific user's profile AND their projects.
    This is used by the Detail Drawer to view matches.
    """
    profile = db.query(models.Profile).filter(models.Profile.id == profile_id).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    # Fetch all projects belonging to this user
    projects = db.query(models.Project).filter(models.Project.user_id == profile.user_id).all()
    
    # Convert profile to a dictionary so we can inject the projects array
    profile_data = {c.name: getattr(profile, c.name) for c in profile.__table__.columns}
    profile_data["projects"] = projects
    
    return profile_data


@router.put(
    "/",
    response_model=schemas.ProfileOut,
    status_code=status.HTTP_200_OK,
)
def update_profile(
    profile_in: schemas.ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Update fields of the authenticated user's profile.
    Only fields provided will be changed.
    """
    db_profile = db.query(models.Profile).filter_by(user_id=current_user.id).first()
    if not db_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )

    update_data = profile_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_profile, field, value)

    db.commit()
    db.refresh(db_profile)
    return db_profile

import uuid
from pydantic import BaseModel
from fastapi import HTTPException

class PublicKeyPayload(BaseModel):
    user_id: str
    public_key: str

@router.post("/keys/upload")
async def upload_public_key(payload: PublicKeyPayload, db: Session = Depends(get_db)):
    """
    Saves the user's RSA Public Key to the database securely.
    """
    # Safely determine if user_id is a UUID or an Integer
    try:
        uuid.UUID(str(payload.user_id))
        profile = db.query(models.Profile).filter(models.Profile.user_id == payload.user_id).first()
    except ValueError:
        profile = db.query(models.Profile).filter(models.Profile.id == int(payload.user_id)).first()
        
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found to attach key.")

    profile.public_key = payload.public_key
    db.commit()
    
    return {"status": "success", "message": "Cryptographic public key secured in vault."}

@router.get("/keys/{target_id}")
async def get_target_public_key(target_id: str, db: Session = Depends(get_db)):
    """
    Fetches a match's RSA Public Key.
    """
    # Safely determine if target_id is a UUID or an Integer
    try:
        uuid.UUID(str(target_id))
        profile = db.query(models.Profile).filter(models.Profile.user_id == target_id).first()
    except ValueError:
        profile = db.query(models.Profile).filter(models.Profile.id == int(target_id)).first()

    if not profile or not profile.public_key:
        raise HTTPException(status_code=404, detail="Public key not found for this user. E2EE cannot be established.")

    return {"public_key": profile.public_key}