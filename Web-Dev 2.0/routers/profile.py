# routers/profile.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import models, schemas
from database import get_db
from utils.auth import get_current_user

#router = APIRouter(prefix="/profile", tags=["Profile"],)
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
    # Prevent duplicate profiles
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

    # Apply only supplied updates
    update_data = profile_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_profile, field, value)

    db.commit()
    db.refresh(db_profile)
    return db_profile
