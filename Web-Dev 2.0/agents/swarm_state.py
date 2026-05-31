# File: agents/swarm_state.py
from typing import TypedDict, Dict, Any, Annotated
import operator

# --- STATE FOR DUE DILIGENCE (DAG) ---
class DiligenceState(TypedDict):
    startup_name: str
    pitch_text: str
    financial_report: Dict[str, Any]
    risk_report: Dict[str, Any]
    match_criteria: Dict[str, Any]
    final_verdict: str

# --- STATE FOR NEGOTIATION (CYCLIC) ---
# Annotated with operator.add so messages automatically append to history
class NegotiationState(TypedDict):
    startup_name: str
    pitch: str
    investment_amount_requested: str
    messages: Annotated[list, operator.add] 
    current_round: int
    status: str
    final_term_sheet: str