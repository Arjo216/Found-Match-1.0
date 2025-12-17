from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List, Optional, Literal
from uuid import UUID

# --- Authentication Schemas ---

class UserBase(BaseModel):
    email: EmailStr
    is_investor: bool = False

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: Literal['bearer'] = 'bearer'

class UserOut(UserBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# --- Profile Schemas ---

class ProfileBase(BaseModel):
    full_name: str
    bio: Optional[str] = None
    location: Optional[str] = None
    interests: Optional[str] = None
    role: str # 'founder' or 'investor'

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    interests: Optional[str] = None
    role: Optional[str] = None

class ProfileOut(ProfileBase):
    id: int
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# --- Project Schemas ---

class ProjectBase(BaseModel):
    title: str
    description: str
    domain: str
    funding_goal: int

class ProjectCreate(ProjectBase):
    pass

class ProjectOut(ProjectBase):
    id: int
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# --- Match Schemas ---

class MatchOut(BaseModel):
    profile_id: int
    entrepreneur_id: UUID  # <--- FIXED: Changed from int to UUID
    investor_id: UUID      # <--- FIXED: Changed from int to UUID
    match_score: float
    created_at: Optional[datetime] = None
    
    # Extra UI fields (Included for frontend display)
    full_name: Optional[str] = None
    role: Optional[str] = None
    location: Optional[str] = None
    interests: Optional[str] = None

    class Config:
        from_attributes = True

class MatchList(BaseModel):
    matches: List[MatchOut]

# --- Swipe Schemas ---
class SwipeIn(BaseModel):
    target_id: int
    liked: bool
    type: str = "swipe"