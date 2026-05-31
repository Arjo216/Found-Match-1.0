# File: routers/agent_swarm.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import logging
import sys
import os

# Add root directory to sys.path so 'agents' can be imported without errors
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

logger = logging.getLogger("FoundMatch-Swarm")

try:
    from agents.diligence_graph import diligence_swarm
    from agents.negotiation_graph import negotiation_swarm
    from agents.codeops_graph import codeops_swarm
    logger.info("✅ LangGraph Swarm Architectures loaded successfully.")
except ImportError as e:
    logger.error(f"❌ LangGraph agents failed to load. Error: {e}")
    diligence_swarm = None
    negotiation_swarm = None
    codeops_swarm = None

router = APIRouter()

# --- ROUTES & PAYLOADS ---
class PitchRequest(BaseModel):
    startup_name: str
    pitch_text: str

class NegotiationRequest(BaseModel):
    startup_name: str
    pitch: str
    requested_amount: str

# NEW: Payload for CodeOps
class CodeOpsRequest(BaseModel):
    project_name: str
    startup_pitch: str

@router.post("/diligence")
async def run_diligence(request: PitchRequest):
    """
    Triggers the Autonomous Due Diligence LangGraph Swarm.
    """
    if not diligence_swarm:
        raise HTTPException(status_code=503, detail="Diligence Swarm architecture is offline.")
    
    logger.info(f"🚀 Deploying Due Diligence Swarm for: {request.startup_name}")
    
    initial_state = {
        "startup_name": request.startup_name, 
        "pitch_text": request.pitch_text
    }
    
    final_state = diligence_swarm.invoke(initial_state)
    
    return {
        "startup_name": final_state.get("startup_name"),
        "financial_analysis": final_state.get("financial_report"),
        "risk_analysis": final_state.get("risk_report"),
        "match_criteria": final_state.get("match_criteria"),
        "final_verdict": final_state.get("final_verdict")
    }

@router.post("/negotiate")
async def run_negotiation(request: NegotiationRequest):
    """
    Locks a Founder AI and an Investor AI in a cyclic graph loop to negotiate a term sheet.
    """
    if not negotiation_swarm:
        raise HTTPException(status_code=503, detail="Negotiation Swarm offline.")

    logger.info(f"⚔️ Initiating Negotiation Sandbox for: {request.startup_name}")

    initial_state = {
        "startup_name": request.startup_name,
        "pitch": request.pitch,
        "investment_amount_requested": request.requested_amount,
        "messages": [],
        "current_round": 0,
        "status": "negotiating",
        "final_term_sheet": ""
    }
    
    final_state = negotiation_swarm.invoke(initial_state)
    
    return {
        "startup_name": final_state.get("startup_name"),
        "negotiation_transcript": final_state.get("messages"),
        "final_term_sheet": final_state.get("final_term_sheet")
    }  

# --- NEW: CodeOps Endpoint ---
@router.post("/codeops")
async def run_codeops(request: CodeOpsRequest):
    """
    Triggers the Autonomous Engineering Swarm (CodeOps-ULTRA)
    """
    if not codeops_swarm:
        raise HTTPException(status_code=503, detail="CodeOps Swarm architecture is offline.")

    logger.info(f"⚙️ Booting CodeOps-ULTRA Orchestrator for: {request.project_name}")

    initial_state = {
        "project_name": request.project_name,
        "startup_pitch": request.startup_pitch,
        "architecture_plan": {},
        "generated_code": {},
        "security_audit": "",
        "deployment_ready": False
    }
    
    # LangGraph Execution
    final_state = codeops_swarm.invoke(initial_state)
    
    return {
        "project_name": final_state.get("project_name"),
        "architecture": final_state.get("architecture_plan"),
        "source_code": final_state.get("generated_code"),
        "security_audit": final_state.get("security_audit"),
        "deployment_ready": final_state.get("deployment_ready")
    }