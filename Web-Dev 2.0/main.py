import os
import json
import uuid
import logging
import asyncio
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from typing import List, Dict, Any, Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from dotenv import load_dotenv

# Security & Utils
from utils.sentry import AutonomousSentryMiddleware

# DB/models
from database import engine, get_db
import models

# Routers
from routers.auth import router as auth_router
from routers.profile import router as profile_router
from routers.projects import router as projects_router
from routers.match import router as match_router
from routers import agent
from routers.vault import router as vault_router
from routers.dashboard import router as dashboard_router
from routers.kyc import router as kyc_router
from routers.agent_swarm import router as swarm_router
from routers.voice_agent import router as voice_router
from routers.vector_engine import router as vector_router

# AI Engine
try:
    from agents.negotiation_graph import negotiation_swarm
except ImportError as e:
    logging.error(f"❌ Failed to load AI Swarm. Negotiation Autopilot will be offline. Error: {e}")
    negotiation_swarm = None

# Load environment variables
load_dotenv()

# Configure root logger for the API
logger = logging.getLogger("FoundMatch-API")
logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(name)s | %(message)s")

# --- PYDANTIC MODELS ---
class EncryptedPayload(BaseModel):
    file_name: str
    ephemeral_public_key: str
    ciphertext: str


# --- MODERN FASTAPI LIFESPAN ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup Phase
    logger.info("Initializing FoundMatch Database...")
    models.Base.metadata.create_all(bind=engine)
    logger.info("🚀 FoundMatch API is ONLINE. Swarms, WebSockets, & Vault Engines armed.")
    yield
    # Shutdown Phase
    logger.info("🛑 FoundMatch API Shutting Down Gracefully.")

# Build FastAPI app
app = FastAPI(
    title="FoundMatch Institutional API",
    version="3.0.0",
    description="Institutional matchmaking powered by Graph Neural Networks, Real-Time WebSockets, and Autonomous Swarms.",
    lifespan=lifespan
)

# --- 🛡️ MIDDLEWARE STACK ---
app.add_middleware(AutonomousSentryMiddleware)

raw_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000")
ALLOW_ORIGINS = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# ==========================================
# PHASE 3: SECURE WEBSOCKET & AI MANAGER
# ==========================================
class NegotiationManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.autopilot_status: Dict[str, bool] = {}
        self.negotiation_states: Dict[str, dict] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        self.autopilot_status[user_id] = False
        
        # Initialize an empty LangGraph memory state for this user
        #self.negotiation_states[user_id] = {
            #"startup_name": "TitanOPS AIR", # Initialized with project name placeholder
            #"pitch": "Autonomous drone interception grid. Real-time computer vision.",
            #"investment_amount_requested": "$2M",
            #"messages": [],
            #"current_round": 0,
            #"status": "negotiating",
            #"final_term_sheet": ""
        #}
        self.negotiation_states[user_id] = {
            "startup_name": "QuantumGrid PLUS", 
            "pitch": "A quantum-resistant blockchain and AI-governed ledger utilizing lattice-based cryptography to secure institutional assets against Q-Day decryption threats.",
            "investment_amount_requested": "$8.5M",
            "messages": [],
            "current_round": 0,
            "status": "negotiating",
            "final_term_sheet": ""
        }
        logger.info(f"[WS] User {user_id} connected. Active connections: {len(self.active_connections)}")

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            logger.info(f"[WS] User {user_id} disconnected.")

    async def send_personal_message(self, message: str, receiver_id: str):
        if receiver_id in self.active_connections:
            websocket = self.active_connections[receiver_id]
            try:
                await websocket.send_text(message)
            except Exception as e:
                logger.error(f"[WS] Failed to send message to {receiver_id}: {e}")
                self.disconnect(receiver_id)

manager = NegotiationManager()

# --- REGISTER ROUTERS ---
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(profile_router, prefix="/profile", tags=["Profile"])
app.include_router(projects_router, prefix="/projects", tags=["Projects"])
app.include_router(match_router, prefix="/match", tags=["Match"])
app.include_router(agent.router, prefix="/agent", tags=["AI Agent (Legacy)"])
app.include_router(vault_router, prefix="/vault", tags=["Institutional Vault"])
app.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard Metrics"])
app.include_router(kyc_router, prefix="/kyc", tags=["Identity & KYC"])
app.include_router(swarm_router, prefix="/swarm", tags=["🚀 AI Swarm Intelligence"])
app.include_router(voice_router, prefix="/ws/voice", tags=["🎙️ Live Voice Interrogation"])
app.include_router(vector_router, prefix="/api/v1/vectors", tags=["🌌 Deal Galaxy Engine"])

# --- HELPER: SAFE UUID RESOLVER ---
def resolve_uuid(input_id: str, session: Session) -> str | None:
    if not input_id:
        return None
        
    try:
        # 1. Check if it is already a valid UUID
        uuid.UUID(str(input_id))
        return str(input_id)
    except ValueError:
        # 2. Check if it is a pure number before crashing the DB lookup
        if str(input_id).isdigit():
            p = session.query(models.Profile).filter(models.Profile.id == int(input_id)).first()
            return str(p.user_id) if p else None
            
        # 3. If it's a string like "investor_demo_1", just return it as-is for the demo
        return None

# --- SECURE CHAT HISTORY ENDPOINT ---
@app.get("/chat/history/{user_id}/{receiver_id}", tags=["Chat"])
def get_chat_history(user_id: str, receiver_id: str, db: Session = Depends(get_db)):
    real_user_uuid = resolve_uuid(user_id, db)
    real_receiver_uuid = resolve_uuid(receiver_id, db)

    if not real_user_uuid or not real_receiver_uuid:
        return {"messages": []}

    messages = db.query(models.Message).filter(
        or_(
            and_(models.Message.sender_id == real_user_uuid, models.Message.receiver_id == real_receiver_uuid),
            and_(models.Message.sender_id == real_receiver_uuid, models.Message.receiver_id == real_user_uuid)
        )
    ).order_by(models.Message.timestamp.asc()).all()

    return {
        "messages": [
            {
                "sender_id": str(m.sender_id),
                "content": m.content,
                "timestamp": m.timestamp.isoformat() if m.timestamp else datetime.now(timezone.utc).isoformat()
            } for m in messages
        ]
    }

# ==========================================
# THE NEGOTIATION WEBSOCKET ENDPOINT
# ==========================================
@app.websocket("/ws/chat/{user_id}")
async def chat_endpoint(websocket: WebSocket, user_id: str, db: Session = Depends(get_db)):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            
            receiver_id = payload.get("receiver_id")
            command = payload.get("command")
            content = payload.get("content")

            real_sender_uuid = resolve_uuid(user_id, db)
            real_receiver_uuid = resolve_uuid(receiver_id, db) if receiver_id else None
            current_time_iso = datetime.now(timezone.utc).isoformat()

            # ------------------------------------------------
            # SCENARIO A: Autopilot Toggles
            # ------------------------------------------------
            if command == "ENABLE_AUTOPILOT":
                manager.autopilot_status[user_id] = True
                logger.info(f"🤖 AI AUTOPILOT ENGAGED FOR {user_id}. LangGraph is armed.")
                
                # 🚀 THE UPGRADE: ASYNCHRONOUS SWARM STREAMING
                if negotiation_swarm:
                    logger.info("⚡ Executing Asynchronous Swarm Stream...")
                    
                    # 1. Grab the current negotiation state
                    state = manager.negotiation_states[user_id]
                    
                    async def run_swarm_stream():
                        # 2. Use .astream() to iterate through the graph nodes in real-time
                        async for output in negotiation_swarm.astream(state):
                            # output is a dict where the key is the node name (e.g., 'investor', 'founder')
                            for node_name, state_update in output.items():
                                
                                # 3. If a node generated a message, broadcast it to the UI
                                if "messages" in state_update and state_update["messages"]:
                                    latest_msg = state_update["messages"][-1]
                                    
                                    # Pipe the AI's internal dialogue to the chat window
                                    stream_payload = json.dumps({
                                        "sender_id": receiver_id, # Renders on the left side of the UI
                                        "content": latest_msg,
                                        "timestamp": datetime.now(timezone.utc).isoformat()
                                    })
                                    await manager.send_personal_message(stream_payload, user_id)
                                    
                                    # Add a slight delay so the humans can read the AIs haggling
                                    await asyncio.sleep(2.0)
                                
                                # 4. If the Lawyer node generated the Term Sheet, trigger the Vault
                                if "final_term_sheet" in state_update:
                                    term_sheet = state_update["final_term_sheet"]
                                    seal_payload = json.dumps({
                                        "command": "DEAL_SEALED",
                                        "term_sheet": term_sheet,
                                        "timestamp": datetime.now(timezone.utc).isoformat()
                                    })
                                    # Small pause for dramatic effect before the Vault drops
                                    await asyncio.sleep(1.0)
                                    await manager.send_personal_message(seal_payload, user_id)

                    # Fire the async stream without blocking the main WebSocket thread
                    asyncio.create_task(run_swarm_stream())
                continue
            elif command == "DISABLE_AUTOPILOT":
                manager.autopilot_status[user_id] = False
                logger.info(f"👤 AI AUTOPILOT DISENGAGED FOR {user_id}. Human control restored.")
                continue

            # ------------------------------------------------
            # SCENARIO B: Message Processing & Database Logging
            # ------------------------------------------------
            if receiver_id and content:
                
                # 1. Log Human Message
                if real_sender_uuid and real_receiver_uuid:
                    try:
                        db.add(models.Message(sender_id=real_sender_uuid, receiver_id=real_receiver_uuid, content=content))
                        db.commit()
                    except Exception as db_err:
                        db.rollback() 
                        logger.error(f"[WS DB Error] Failed to save human message: {db_err}")

                # 2. 🚨 THE LEGAL TRIGGER: Check for DEAL SEALED keyword
                if "[ACCEPT]" in content.upper():
                    logger.info(f"🤝 DEAL SEALED between {user_id} and {receiver_id}!")
                    
                    # Force the Swarm into the Legal Drafter Node
                    state = manager.negotiation_states.get(receiver_id, manager.negotiation_states.get(user_id))
                    state["messages"].append(f"HUMAN: {content}")
                    
                    # Generate the term sheet using the LangGraph Legal AI
                    final_state = negotiation_swarm.invoke(state) if negotiation_swarm else {"final_term_sheet": "System Offline."}
                    term_sheet = final_state.get("final_term_sheet", "Drafting Error.")
                    
                    seal_payload = json.dumps({
                        "command": "DEAL_SEALED",
                        "term_sheet": term_sheet,
                        "timestamp": current_time_iso
                    })
                    
                    # Broadcast the Term Sheet to BOTH screens simultaneously
                    await manager.send_personal_message(seal_payload, user_id)
                    await manager.send_personal_message(seal_payload, receiver_id)
                    continue # Skip the rest of the chat routing

                # 3. Target is being defended by the LangGraph Swarm
                if manager.autopilot_status.get(receiver_id) and negotiation_swarm:
                    logger.info(f"⚔️ {user_id} triggered the Swarm defense for {receiver_id}!")
                    
                    state = manager.negotiation_states[receiver_id]
                    state["messages"].append(f"INVESTOR: {content}")
                    
                    final_state = negotiation_swarm.invoke(state)
                    ai_response = final_state["messages"][-1].replace("FOUNDER: ", "").replace("INVESTOR: ", "")
                    manager.negotiation_states[receiver_id] = final_state

                    if real_sender_uuid and real_receiver_uuid:
                        try:
                            db.add(models.Message(sender_id=real_receiver_uuid, receiver_id=real_sender_uuid, content=ai_response))
                            db.commit()
                        except Exception as db_err:
                            db.rollback()
                            logger.error(f"[WS DB Error] Failed to save AI message: {db_err}")
                    
                    out_payload = json.dumps({
                        "sender_id": receiver_id,
                        "content": ai_response,
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    })
                    await manager.send_personal_message(out_payload, user_id)

                # 4. Standard Human-to-Human relay
                else:
                    out_payload = json.dumps({
                        "sender_id": user_id, 
                        "content": content,
                        "timestamp": current_time_iso
                    })
                    await manager.send_personal_message(out_payload, receiver_id)

    except WebSocketDisconnect:
        manager.disconnect(user_id)
    except Exception as e:
        logger.error(f"[WS Error] Connection crashed for {user_id}: {e}")
        manager.disconnect(user_id)


# --- 🔐 ZERO-KNOWLEDGE VAULT INGESTION ---
@app.post("/api/vault/ingest", tags=["Institutional Vault"])
async def ingest_secure_document(payload: EncryptedPayload):
    """
    Phase 2: Zero-Knowledge Data Ingestion
    Receives Post-Quantum encrypted pitch decks and financial models from the Wasm frontend.
    """
    try:
        logger.info("=========================================")
        logger.info("🔒 SECURE VAULT INGESTION TRIGGERED")
        logger.info(f"Target File: {payload.file_name}")
        logger.info(f"Kyber Signature: {payload.ephemeral_public_key[:24]}...")
        logger.info(f"Payload Size: {len(payload.ciphertext)} bytes")
        logger.info("=========================================")
        
        return {
            "status": "success",
            "message": "Encrypted payload received and secured in backend vault.",
            "file_name": payload.file_name,
            "bytes_received": len(payload.ciphertext)
        }
        
    except Exception as e:
        logger.error(f"[Vault Error] Ingestion failed: {e}")
        raise HTTPException(status_code=500, detail="Internal Vault Error")


# --- ROOT ENDPOINTS ---
@app.get("/", tags=["Root"])
def read_root():
    return {"message": "Welcome to FoundMatch API! AI Engine, Swarms, & WebSockets are Online."}

@app.get("/health", tags=["Root"])
def health_check():
    return {
        "status": "operational", 
        "active_ws_connections": len(manager.active_connections),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }