import sys
import os
import pandas as pd
from pathlib import Path
 # Ensure ml_engine is importable

# --- 1. PATH FIX (CRITICAL) ---
# This ensures we can find 'ml_engine' even if running from the backend folder
current_path = Path(__file__).resolve()
ROOT_DIR = None

# Search up the directory tree for the project root (containing 'ml_engine')
for parent in current_path.parents:
    if (parent / "ml_engine").exists():
        ROOT_DIR = parent
        if str(parent) not in sys.path:
            sys.path.append(str(parent))
        break

# Fallback if root not found
if not ROOT_DIR:
    ROOT_DIR = Path.cwd()
    print("WARNING: Could not locate project root containing 'ml_engine'.")

# Import the Production AI Class
try:
    from ml_engine.production_model import FoundMatchProductionAI
except ImportError:
    print("ERROR: Could not import FoundMatchProductionAI. Check your python path.")
    FoundMatchProductionAI = None

# --- 2. SINGLETON AI INSTANCE ---
# We store the engine here so it is only loaded once per server restart
_ai_instance = None

def get_ai_engine():
    """
    Returns the global, pre-loaded AI Engine instance.
    Initializes it on the first call if it doesn't exist.
    """
    global _ai_instance
    
    if _ai_instance is not None:
        return _ai_instance

    print("--- INITIALIZING CENTRAL AI ENGINE (Singleton) ---")
    
    if FoundMatchProductionAI is None:
        return None

    try:
        # Define Paths
        data_dir = ROOT_DIR / "data"
        investors_path = data_dir / "processed_investors.csv"
        startups_path = data_dir / "processed_startups.csv"
        model_path = data_dir / "foundmatch_graph.pth"

        # Load Data Stats to size the model correctly
        if investors_path.exists() and startups_path.exists():
            n_inv = len(pd.read_csv(investors_path))
            n_stu = len(pd.read_csv(startups_path))
            print(f"[AI Utils] Stats: {n_inv} Investors, {n_stu} Startups")
        else:
            print("[AI Utils] WARNING: Data CSVs not found. Using fallback size 100.")
            n_inv, n_stu = 100, 100

        # Initialize Engine
        engine = FoundMatchProductionAI(n_inv, n_stu)

        # Load Weights
        if model_path.exists():
            engine.load_weights(str(model_path))
        else:
            print("[AI Utils] WARNING: 'foundmatch_graph.pth' weights not found.")

        _ai_instance = engine
        return _ai_instance

    except Exception as e:
        print(f"[AI Utils] CRITICAL INIT ERROR: {e}")
        return None

# --- 3. HELPER UTILS (Legacy Support) ---

def user_to_dict(user):
     return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role
    }