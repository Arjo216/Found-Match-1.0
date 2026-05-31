# File: agents/negotiation_graph.py
import os
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage
from langgraph.graph import StateGraph, START, END
from dotenv import load_dotenv

from agents.swarm_state import NegotiationState

load_dotenv()

# --- DUAL-ENGINE INITIALIZATION ---
groq_llm = ChatGroq(
    groq_api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.4, 
    model_name="llama-3.3-70b-versatile"
)

gemini_llm = ChatGoogleGenerativeAI(
    google_api_key=os.getenv("GEMINI_API_KEY"),
    model="gemini-1.5-flash",
    temperature=0.4,
)

llm = groq_llm.with_fallbacks([gemini_llm])

# --- AGENT NODES ---
def investor_agent(state: NegotiationState):
    print(f"💼 Investor making offer (Round {state['current_round']})...")
    history_text = "\n".join(state["messages"]) if state["messages"] else "No previous offers."
    
    sys_prompt = f"""
    You are a Lead Partner at a top-tier Venture Capital firm. You are negotiating a funding round for {state['startup_name']}.
    They requested {state['investment_amount_requested']}.
    Their pitch: {state['pitch']}
    
    History:
    {history_text}
    
    NEGOTIATION PARAMETERS:
    - Your goal is to secure 25% to 30% equity for the requested capital.
    - However, you are authorized to go as low as 15% equity if the founder pushes back hard.
    - If the founder's counter-offer falls within your acceptable range (15% - 30%), you MUST accept the deal by replying with EXACTLY: [ACCEPT]
    - If not, make a highly professional, data-driven counter-offer. 
    - Keep your response to 2 crisp sentences.
    """
    response = llm.invoke([SystemMessage(content=sys_prompt)])
    return {"messages": [f"INVESTOR: {response.content}"], "current_round": state["current_round"] + 1}

def founder_agent(state: NegotiationState):
    print("🚀 Founder reviewing and countering...")
    history_text = "\n".join(state["messages"])
    
    sys_prompt = f"""
    You are the visionary founder of {state['startup_name']}. 
    You are raising {state['investment_amount_requested']}.
    
    History:
    {history_text}
    
    NEGOTIATION PARAMETERS:
    - Your ideal scenario is giving up only 10% equity.
    - However, you are pragmatic and willing to give up to 25% equity to secure this strategic VC partner.
    - If the investor's offer is 25% equity or lower, you MUST secure the capital by replying with EXACTLY: [ACCEPT]
    - If they demand more than 25%, make a strong, confident counter-offer defending your valuation.
    - Keep your response to 2 crisp sentences.
    """
    response = llm.invoke([SystemMessage(content=sys_prompt)])
    return {"messages": [f"FOUNDER: {response.content}"]}

def legal_drafter(state: NegotiationState):
    print("⚖️ Legal AI drafting final term sheet...")
    history_text = "\n".join(state["messages"])
    
    sys_prompt = f"""
    You are the Lead M&A Counsel. Read the negotiation transcript below and draft the official verdict.
    
    History:
    {history_text}
    
    If the parties agreed (indicated by [ACCEPT]), generate a highly professional, clean Markdown Term Sheet. 
    Format it exactly like this:
    
    **I. INVESTMENT CAPITAL:** [Amount]
    **II. EQUITY ALLOCATION:** [Percentage]
    **III. POST-MONEY VALUATION:** [Calculated Amount]
    
    *Standard Board Seat and Pro-Rata rights apply. Capital will be unlocked to the CodeOps Swarm immediately.*

    If they walked away, output a 2-sentence summary of the valuation gap that caused the deal to fail. Do not use markdown headers for a failed deal.
    """
    response = llm.invoke([SystemMessage(content=sys_prompt)])
    return {"final_term_sheet": response.content}

# --- CONDITIONAL ROUTER ---
def check_agreement(state: NegotiationState) -> str:
    last_message = state["messages"][-1].upper()
    if "[ACCEPT]" in last_message:
        print("🤝 AGREEMENT REACHED!")
        return "draft"
    
    if state["current_round"] >= 4:
        print("🛑 NO DEAL. Walked away after maximum rounds.")
        return "draft"
        
    return "founder_counters"

# --- BUILD THE CYCLIC GRAPH ---
workflow = StateGraph(NegotiationState)

workflow.add_node("investor", investor_agent)
workflow.add_node("founder", founder_agent)
workflow.add_node("lawyer", legal_drafter)

workflow.add_edge(START, "investor")
workflow.add_conditional_edges("investor", check_agreement, {"draft": "lawyer", "founder_counters": "founder"})
workflow.add_conditional_edges("founder", check_agreement, {"draft": "lawyer", "founder_counters": "investor"})
workflow.add_edge("lawyer", END)

negotiation_swarm = workflow.compile()