import os
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase import create_client, Client
from sentence_transformers import SentenceTransformer

logger = logging.getLogger("VectorEngine")
router = APIRouter()

# Initialize the 384-dimensional NLP model locally 
# This runs instantly in RAM, converting search strings to math arrays
model = SentenceTransformer('all-MiniLM-L6-v2')

# Initialize Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
 logger.warning("Vector Engine booting without Supabase credentials. Ensure .env is loaded.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

class VectorSearchRequest(BaseModel):
    pitch_summary: str
    target_type: str = "founder"
    threshold: float = 0.1
    limit: int = 15

@router.post("/match")
async def find_deal_matches(request: VectorSearchRequest):
    logger.info(f"Galactic Vector Search Initiated for query: '{request.pitch_summary}'")
    
    try:
        # 1. Convert the user's text search into a 384d vector
        query_vector = model.encode(request.pitch_summary).tolist()

        # 2. Call the Supabase pgvector RPC (Remote Procedure Call)
        # We pass the vector, threshold, and limit directly to the database layer for ultra-fast filtering
        result = supabase.rpc(
            "match_users",
            {
                "query_embedding": query_vector,
                "match_threshold": request.threshold,
                "match_count": request.limit
            }
        ).execute()

        if not result.data:
            return {"status": "success", "matches": []}

        # 3. Format data exactly as the React 3D Engine expects it
        formatted_matches = []
        for match in result.data:
            # Prevent the user from matching with themselves in the 3D space if their pitch is similar
            # (Normally handled by filtering out the user's own ID, but safely appending all for now)
            formatted_matches.append({
                "id": match.get("id"),
                "name": match.get("name", "Unknown Node"), 
                "pitch_summary": match.get("pitch_summary", "Classified Intelligence"),
                "similarity": match.get("similarity", 0.0)
            })

        return {"status": "success", "matches": formatted_matches}

    except Exception as e:
        logger.error(f"Vector Engine Crash: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))