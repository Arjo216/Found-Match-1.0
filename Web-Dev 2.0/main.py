import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# DB/models
from database import engine
import models

# Routers
from routers.auth import router as auth_router
from routers.profile import router as profile_router
from routers.projects import router as projects_router
from routers.match import router as match_router

# Load environment variables
load_dotenv()

# Create DB tables (Dev mode)
models.Base.metadata.create_all(bind=engine)

# Build FastAPI app
app = FastAPI(
    title="FoundMatch API",
    version="1.0.0",
    description="Investor ⇄ Entrepreneur matchmaking service powered by Hybrid AI",
)

# CORS Configuration
# Default to localhost:3000 (React default) if env var not set
ALLOW_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- REGISTER ROUTERS ---
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(profile_router, prefix="/profile", tags=["Profile"])
app.include_router(projects_router, prefix="/projects", tags=["Projects"])

# Match router is at /match (e.g., POST /match/score)
app.include_router(match_router, prefix="/match", tags=["Match"])

# --- ROOT ENDPOINTS ---
@app.get("/", tags=["Root"])
def read_root():
    return {"message": "Welcome to FoundMatch API! AI Engine is Online."}

@app.get("/health", tags=["Root"])
def health_check():
    return {"status": "ok"}