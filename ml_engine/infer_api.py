import pandas as pd
import os
import sys
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from contextlib import asynccontextmanager

# --- 1. IMPORT THE CORRECT MODEL CLASS ---
# We add the current directory to sys.path to ensure we can find the module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from ml_engine.production_model import FoundMatchProductionAI
except ImportError:
    # Fallback if running directly from root
    from ml_engine.production_model import FoundMatchProductionAI

# --- 2. CONFIGURATION ---
DATA_DIR = "data"
MODEL_PATH = os.path.join(DATA_DIR, "foundmatch_graph.pth")

# Global AI variable
ai_engine = None

# --- 3. LIFESPAN MANAGER (Startup Logic) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    global ai_engine
    print("--- STARTING ML INFERENCE API ---")
    
    try:
        # Load Data to get correct dimensions
        investors_path = os.path.join(DATA_DIR, "processed_investors.csv")
        startups_path = os.path.join(DATA_DIR, "processed_startups.csv")
        
        if os.path.exists(investors_path) and os.path.exists(startups_path):
            inv_df = pd.read_csv(investors_path)
            stu_df = pd.read_csv(startups_path)
            num_users = len(inv_df)
            num_items = len(stu_df)
            print(f"[Init] Data stats: {num_users} Investors, {num_items} Startups")
        else:
            print("[Init] WARNING: Data CSVs not found. Using default size 100.")
            num_users = 100
            num_items = 100

        # Initialize the AI Brain
        ai_engine = FoundMatchProductionAI(num_users, num_items)
        
        # Load the Trained Weights
        if os.path.exists(MODEL_PATH):
            ai_engine.load_weights(MODEL_PATH)
            print("[Init] SUCCESS: AI Model weights loaded.")
        else:
            print("[Init] WARNING: Model weights file not found! Predictions will be random.")
            
    except Exception as e:
        print(f"[Init] CRITICAL ERROR: {e}")
    
    yield
    print("--- SHUTTING DOWN ML API ---")

# --- 4. CREATE APP ---
app = FastAPI(title="FoundMatch ML Engine", lifespan=lifespan)

class PredictIn(BaseModel):
    investor_id: int
    startup_id: int
    investor_text: str
    startup_text: str

@app.get("/")
def health_check():
    return {"status": "online", "model": "FoundMatch-Hybrid-v1"}

@app.post("/predict_match")
def predict(payload: PredictIn):
    if ai_engine is None:
        raise HTTPException(status_code=500, detail="Model not initialized")
    
    # Run Prediction
    score = ai_engine.predict_match_score(
        investor_text=payload.investor_text,
        startup_text=payload.startup_text,
        investor_id=payload.investor_id,
        startup_id=payload.startup_id
    )
    
    return {
        "match_score": score,
        "recommendation": "High" if score > 75 else "Medium" if score > 50 else "Low"
    }
