import os
from dotenv import load_dotenv
from supabase import create_client, Client
from sentence_transformers import SentenceTransformer

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials in .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Load the AI model
print("Loading AI Model...")
model = SentenceTransformer('all-MiniLM-L6-v2')

# 4 Realistic Startups with dummy login credentials to bypass database constraints
startups = [
    {
        "name": "Aegis Drone Dynamics",
        "pitch": "Autonomous swarm drones for military and border security defense using real-time computer vision and edge computing.",
        "email": "aegis.ceo@foundmatch.test",
        "hashed_password": "dummy_hash_123"
    },
    {
        "name": "NeuralNet Finance",
        "pitch": "AI-driven fintech platform utilizing deep learning to optimize high-frequency trading and algorithmic portfolio management.",
        "email": "neuralnet.admin@foundmatch.test",
        "hashed_password": "dummy_hash_123"
    },
    {
        "name": "BioForge Genetics",
        "pitch": "CRISPR-based biotech startup focusing on targeted gene therapy for rare autoimmune diseases.",
        "email": "bioforge.research@foundmatch.test",
        "hashed_password": "dummy_hash_123"
    },
    {
        "name": "Quantum Ledger Solutions",
        "pitch": "Quantum-resistant blockchain infrastructure for institutional banking and secure international asset transfers.",
        "email": "quantum.core@foundmatch.test",
        "hashed_password": "dummy_hash_123"
    }
]

print("Injecting realistic startups into the vector space...")

for startup in startups:
    try:
        # Calculate the true mathematical vector for the pitch
        vector = model.encode(startup["pitch"]).tolist()
        
        # Insert the new realistic user into the database
        supabase.table("users").insert({
            "name": startup["name"],
            "pitch_summary": startup["pitch"],
            "vector_embedding": vector,
            "email": startup["email"],
            "hashed_password": startup["hashed_password"],
            "is_investor": False
        }).execute()
        
        print(f"Successfully injected: {startup['name']}")
    except Exception as e:
        print(f"Failed to inject {startup['name']}: {e}")

print("Database seeding complete. The Deal Galaxy is ready.")