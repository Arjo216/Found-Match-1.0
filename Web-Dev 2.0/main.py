import os
import json
import uuid
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
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

# Load environment variables
load_dotenv()

# --- MODERN FASTAPI LIFESPAN ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    models.Base.metadata.create_all(bind=engine)
    print("🚀 FoundMatch Database Initialized.")
    yield
    print("🛑 FoundMatch Server Shutting Down.")

# Build FastAPI app
app = FastAPI(
    title="FoundMatch Institutional API",
    version="2.0.0",
    description="Investor ⇄ Entrepreneur matchmaking service powered by Hybrid AI with Real-Time Secure Messaging.",
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

# --- WEBSOCKET CONNECTION MANAGER ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        print(f"[WS] User {user_id} connected. Total active: {len(self.active_connections)}")

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            print(f"[WS] User {user_id} disconnected.")

    async def send_personal_message(self, message: str, receiver_id: str):
        if receiver_id in self.active_connections:
            websocket = self.active_connections[receiver_id]
            await websocket.send_text(message)

manager = ConnectionManager()

# --- REGISTER ROUTERS ---
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(profile_router, prefix="/profile", tags=["Profile"])
app.include_router(projects_router, prefix="/projects", tags=["Projects"])
app.include_router(match_router, prefix="/match", tags=["Match"])
app.include_router(agent.router, prefix="/agent", tags=["AI Agent"])
app.include_router(vault_router, prefix="/vault", tags=["Institutional Vault"])
app.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard Metrics"])
app.include_router(kyc_router, prefix="/kyc", tags=["Identity & KYC"])

# --- HELPER: SAFE UUID RESOLVER ---
def resolve_uuid(input_id: str, session: Session):
    try:
        uuid.UUID(str(input_id))
        return str(input_id)
    except ValueError:
        p = session.query(models.Profile).filter(models.Profile.id == int(input_id)).first()
        return str(p.user_id) if p else None

# --- NEW: SECURE CHAT HISTORY ENDPOINT ---
@app.get("/chat/history/{user_id}/{receiver_id}", tags=["Chat"])
def get_chat_history(user_id: str, receiver_id: str, db: Session = Depends(get_db)):
    real_user_uuid = resolve_uuid(user_id, db)
    real_receiver_uuid = resolve_uuid(receiver_id, db)

    if not real_user_uuid or not real_receiver_uuid:
        return {"messages": []}

    # Fetch messages between these two specific users
    messages = db.query(models.Message).filter(
        or_(
            and_(models.Message.sender_id == real_user_uuid, models.Message.receiver_id == real_receiver_uuid),
            and_(models.Message.sender_id == real_receiver_uuid, models.Message.receiver_id == real_user_uuid)
        )
    ).order_by(models.Message.timestamp.asc()).all()

    formatted_messages = []
    for m in messages:
        formatted_messages.append({
            "sender_id": str(m.sender_id),
            "content": m.content,
            "timestamp": m.timestamp.isoformat() if m.timestamp else datetime.now(timezone.utc).isoformat()
        })
    return {"messages": formatted_messages}


# --- WEBSOCKET CHAT ENDPOINT ---
@app.websocket("/ws/chat/{user_id}")
async def chat_endpoint(websocket: WebSocket, user_id: str, db: Session = Depends(get_db)):
    await manager.connect(websocket, user_id)
    
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            
            receiver_id = payload.get("receiver_id")
            content = payload.get("content")

            if receiver_id and content:
                real_sender_uuid = resolve_uuid(user_id, db)
                real_receiver_uuid = resolve_uuid(receiver_id, db)

                # Generate a real UTC timestamp for the live echo
                current_time_iso = datetime.now(timezone.utc).isoformat()

                try:
                    if real_sender_uuid and real_receiver_uuid:
                        new_msg = models.Message(
                            sender_id=real_sender_uuid, 
                            receiver_id=real_receiver_uuid, 
                            content=content
                        )
                        db.add(new_msg)
                        db.commit()
                except Exception as db_err:
                    db.rollback() 
                    print(f"[WS DB Error] Failed to save message: {db_err}")

                out_payload = json.dumps({
                    "sender_id": user_id, 
                    "content": content,
                    "timestamp": current_time_iso
                })
                await manager.send_personal_message(out_payload, receiver_id)

    except WebSocketDisconnect:
        manager.disconnect(user_id)
    except Exception as e:
        print(f"[WS Error] Connection dropped: {e}")
        manager.disconnect(user_id)

# --- ROOT ENDPOINTS ---
@app.get("/", tags=["Root"])
def read_root():
    return {"message": "Welcome to FoundMatch API! AI Engine & WebSockets are Online."}

@app.get("/health", tags=["Root"])
def health_check():
    return {
        "status": "ok", 
        "active_ws_connections": len(manager.active_connections)
    }