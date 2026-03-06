# routers/match.py
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

# Internal imports
from database import get_db
from routers.auth import get_current_user
import models
import schemas
from utils.match import get_ai_engine

router = APIRouter(tags=["Match"])

# --- MODELS ---
class SwipeIn(BaseModel):
    target_id: str
    #target_id: int
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
    ai_engine = get_ai_engine()
    
    if ai_engine is None:
        raise HTTPException(status_code=500, detail="AI System Offline or Failed to Load")
        
    score = ai_engine.predict_match_score(
        investor_text=req.investor_thesis,
        startup_text=req.startup_pitch,
        investor_id=req.investor_id,
        startup_id=req.startup_id
    )
    
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
    role: Optional[str] = None, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> Dict[str, List[schemas.MatchOut]]:
    """
    Retrieve matches dynamically scored by the AI Engine based on Bios AND Projects.
    """
    # 1. Get Current User Profile
    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    if profile is None:
        raise HTTPException(404, "Profile not found.")

    target_role = "investor" if profile.role == "founder" else "founder"
    query = db.query(models.Profile).filter(models.Profile.role == target_role)

    # Apply Filters
    if search:
        query = query.filter(models.Profile.full_name.ilike(f"%{search}%"))
    if domain:
        query = query.filter(models.Profile.interests.ilike(f"%{domain}%"))

    candidates = query.all()

    # 2. Try to load AI engine
    try:
        ai_engine = get_ai_engine()
    except:
        ai_engine = None

    # --- THE UPGRADE: BUILD RICH ML CONTEXT FOR CURRENT USER ---
    # We combine bio and interests for a stronger base semantic footprint
    my_text = f"{profile.bio or ''} {profile.interests or ''}".strip() or "General"
    
    # If the current user is a Founder, inject ALL their projects into the ML Context
    if profile.role == "founder":
        my_projects = db.query(models.Project).filter(models.Project.user_id == profile.user_id).all()
        for p in my_projects:
            my_text += f" [PROJECT: {p.title}. DOMAIN: {p.domain}. PITCH: {p.description}."
            if p.tags:
                my_text += f" TAGS: {', '.join(p.tags)}.]"

    matches = []
    
    # 3. Build Context for Candidates and Score Them
    for candidate in candidates:
        cand_text = f"{candidate.bio or ''} {candidate.interests or ''}".strip() or "General"
        
        # --- THE UPGRADE: FETCH PROJECTS FOR CANDIDATE FOUNDERS ---
        if candidate.role == "founder":
            cand_projects = db.query(models.Project).filter(models.Project.user_id == candidate.user_id).all()
            for p in cand_projects:
                cand_text += f" [PROJECT: {p.title}. DOMAIN: {p.domain}. PITCH: {p.description}."
                if p.tags:
                    cand_text += f" TAGS: {', '.join(p.tags)}.]"
        
        # Calculate AI Score
        score = 50.0 # Default fallback
        if ai_engine:
            try:
                # Map inputs correctly based on roles
                if profile.role == "founder":
                    # We are founder (startup_text), they are investor (investor_text)
                    score = ai_engine.predict_match_score(
                        investor_text=cand_text, 
                        startup_text=my_text, 
                        investor_id=candidate.id, 
                        startup_id=profile.id
                    )
                else:
                    # We are investor (investor_text), they are founder (startup_text)
                    score = ai_engine.predict_match_score(
                        investor_text=my_text, 
                        startup_text=cand_text, 
                        investor_id=profile.id, 
                        startup_id=candidate.id
                    )
            except Exception as e:
                print(f"Scoring error for candidate {candidate.id}: {e}")
                pass 

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

    # Sort by highest score first
    matches.sort(key=lambda x: x["match_score"], reverse=True)

    return {"matches": matches}

@router.get("/network")
def get_network(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    """
    Retrieve all professional connections (profiles the user clicked 'Connect' on).
    """
    # 1. Find all positive interactions (Connects) sent by the current user
    outbound_requests = db.query(models.MatchSwipe).filter(
        models.MatchSwipe.user_id == current_user.id,
        models.MatchSwipe.liked == True
    ).all()
    
    # Extract the profile IDs
    target_profile_ids = [req.target_profile_id for req in outbound_requests]
    
    if not target_profile_ids:
        return {"connections": []}
        
    # 2. Fetch the actual profiles for those IDs
    connected_profiles = db.query(models.Profile).filter(models.Profile.id.in_(target_profile_ids)).all()
    
    # 3. Format the response
    results = []
    for p in connected_profiles:
        results.append({
            "id": p.id,
            "profile_id": p.id,
            "user_id": p.user_id,
            "full_name": p.full_name,
            "role": p.role,
            "domain": p.interests, 
            "location": p.location,
            "headline": p.bio[:100] + "..." if p.bio and len(p.bio) > 100 else p.bio
        })
        
    return {"connections": results}