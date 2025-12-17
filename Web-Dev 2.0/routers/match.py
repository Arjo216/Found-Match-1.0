from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from typing import Optional

# Internal imports
from database import get_db
from routers.auth import get_current_user
import models
import schemas

# Import our new Centralized AI Loader
from utils.match import get_ai_engine


router = APIRouter(tags=["Match"])

# --- MODELS ---
class SwipeIn(BaseModel):
    target_id: int
    liked: bool
    type: str = "swipe"

class AI_MatchRequest(BaseModel):
    investor_id: int
    startup_pitch: str
    investor_thesis: str
    startup_id: int = 0

# --- ENDPOINTS ---

@router.post("/score")
async def get_ai_match_score(req: AI_MatchRequest):
    """
    Returns a match percentage (0-100%) using the Central AI Engine.
    """
    # 1. Get the Engine (Auto-initializes if needed)
    ai_engine = get_ai_engine()
    
    if ai_engine is None:
        raise HTTPException(status_code=500, detail="AI System Offline or Failed to Load")
        
    # 2. Predict
    score = ai_engine.predict_match_score(
        investor_text=req.investor_thesis,
        startup_text=req.startup_pitch,
        investor_id=req.investor_id,
        startup_id=req.startup_id
    )
    
    # 3. Format Response
    if score > 85: rec = "Perfect Match"
    elif score > 70: rec = "Strong Match"
    elif score > 50: rec = "Potential Match"
    else: rec = "Low Priority"
    
    return {
        "match_percentage": score,
        "recommendation": rec,
        "model_version": "FoundMatch-Hybrid-Production-v1"
    }

@router.post("/swipe", status_code=status.HTTP_200_OK)
def swipe_target(payload: SwipeIn, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # ensure target exists
    target = db.query(models.Profile).filter(models.Profile.id == payload.target_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Target profile not found")

    swipe = models.MatchSwipe(
        user_id=current_user.id,
        target_profile_id=payload.target_id,
        liked=payload.liked,
        type=payload.type
    )
    db.add(swipe)
    db.commit()
    db.refresh(swipe)
    return {"status":"ok","id":swipe.id,"target_id":payload.target_id,"liked":payload.liked,"type":payload.type}

@router.get("/", response_model=schemas.MatchList)
def get_matches(
    search: Optional[str] = None,
    domain: Optional[str] = None,
    stage: Optional[str] = None,
    role: Optional[str] = None, # Frontend sends this, we can use or ignore
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> Dict[str, List[schemas.MatchOut]]:
    """
    Retrieve matches with OPTIONAL FILTERS (Search, Domain, Stage).
    """
    # 1. Get Current User Profile
    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    if profile is None:
        raise HTTPException(404, "Profile not found.")

    # 2. Determine Opposite Role (Founders see Investors, Investors see Founders)
    # If the frontend sends a specific role filter, we can respect it, otherwise default to opposite
    target_role = "investor" if profile.role == "founder" else "founder"
    
    # 3. Build the Query
    query = db.query(models.Profile).filter(models.Profile.role == target_role)

    # --- APPLY FILTERS ---
    if search:
        # Search by Name (Case insensitive)
        query = query.filter(models.Profile.full_name.ilike(f"%{search}%"))
    
    if domain:
        # Simple text match for domain/interests
        # Note: In a real app, you might split commas. Here we check if the string exists.
        query = query.filter(models.Profile.interests.ilike(f"%{domain}%"))

    # Execute Query
    candidates = query.all()

    # 4. Score & Return (Using AI Engine if available, or fallback)
    matches = []
    # Try to load AI engine (fail gracefully if not set up yet)
    try:
        from utils.match import get_ai_engine
        ai_engine = get_ai_engine()
    except:
        ai_engine = None

    my_text = profile.interests if profile.interests else "General"

    for candidate in candidates:
        cand_text = candidate.interests if candidate.interests else "General"
        
        # Calculate AI Score
        score = 50.0 # Default
        if ai_engine:
            try:
                # Map IDs based on roles
                if profile.role == "founder":
                    score = ai_engine.predict_match_score(cand_text, my_text, candidate.id, profile.id)
                else:
                    score = ai_engine.predict_match_score(my_text, cand_text, profile.id, candidate.id)
            except:
                pass # Keep default if AI fails

        matches.append({
            "profile_id": candidate.id,
            "entrepreneur_id": profile.user_id if profile.role == "founder" else candidate.user_id,
            "investor_id": candidate.user_id if candidate.role == "investor" else profile.user_id,
            "match_score": score,
            "full_name": candidate.full_name,
            "role": candidate.role,
            "location": candidate.location,
            "interests": candidate.interests
        })

    # Sort by score
    matches.sort(key=lambda x: x["match_score"], reverse=True)

    return {"matches": matches}