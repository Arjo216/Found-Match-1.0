# File: agents/diligence_graph.py
import os
from langgraph.graph import StateGraph, START, END
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from agents.swarm_state import DiligenceState

load_dotenv()

# ==========================================
# PYDANTIC SCHEMAS (STRICT ENFORCEMENT)
# ==========================================
class FinancialOutput(BaseModel):
    tam: str = Field(description="Total Addressable Market size and analysis")
    cac: str = Field(description="Estimated Customer Acquisition Cost dynamics")
    ltv: str = Field(description="Lifetime Value estimations")
    burn_rate: str = Field(description="Estimated burn rate and runway")
    financial_health: str = Field(description="Overall financial health summary")

class RiskOutput(BaseModel):
    competitors: list[str] = Field(description="List of likely competitors")
    market_risks: list[str] = Field(description="Top 3 macro or market risks")
    business_model_holes: list[str] = Field(description="Logical weaknesses in the pitch")

class MatchOutput(BaseModel):
    target_investor_thesis: str = Field(description="The exact VC thesis that fits this startup")
    recommended_fund_types: list[str] = Field(description="Types of funds (e.g., Seed, Growth)")
    pgvector_query: str = Field(description="A 1-sentence semantic query to search the pgvector DB")

# ==========================================
# DUAL-ENGINE LLM INITIALIZATION
# ==========================================
# Primary Engine: Ultra-fast LPU processing via Groq
groq_llm = ChatGroq(
    groq_api_key=os.getenv("GROQ_API_KEY"),
    model_name="llama-3.3-70b-versatile",
    temperature=0, 
    max_tokens=2048,
)

# Fallback Engine: Google Gemini 1.5 Flash (Highly reliable, great JSON parsing)
gemini_llm = ChatGoogleGenerativeAI(
    google_api_key=os.getenv("GEMINI_API_KEY"),
    model="gemini-1.5-flash",
    temperature=0,
    max_tokens=2048,
)

# The Failover Cascade: If Groq hits a limit, Gemini instantly takes over.
llm = groq_llm.with_fallbacks([gemini_llm])

# ==========================================
# SWARM AGENT NODES
# ==========================================
def financial_analyst(state: DiligenceState):
    print(f"🕵️‍♂️ Analyst scanning financials for {state['startup_name']}...")
    parser = JsonOutputParser(pydantic_object=FinancialOutput)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an elite VC financial analyst. Extract core metrics from the pitch. \n\n{format_instructions}"),
        ("user", "Startup: {startup_name}\n\nPitch Deck Data:\n{pitch_text}")
    ])
    chain = prompt | llm | parser
    res = chain.invoke({
        "startup_name": state["startup_name"],
        "pitch_text": state["pitch_text"],
        "format_instructions": parser.get_format_instructions()
    })
    return {"financial_report": res}

def interrogator(state: DiligenceState):
    print(f"⚖️ Interrogator red-teaming {state['startup_name']}...")
    parser = JsonOutputParser(pydantic_object=RiskOutput)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a ruthless VC due diligence interrogator. Find the holes, risks, and competitors. \n\n{format_instructions}"),
        ("user", "Startup: {startup_name}\n\nPitch Deck Data:\n{pitch_text}")
    ])
    chain = prompt | llm | parser
    res = chain.invoke({
        "startup_name": state["startup_name"],
        "pitch_text": state["pitch_text"],
        "format_instructions": parser.get_format_instructions()
    })
    return {"risk_report": res}

def matchmaker(state: DiligenceState):
    print(f"🎯 Matchmaker formulating Deal Galaxy vectors...")
    parser = JsonOutputParser(pydantic_object=MatchOutput)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an institutional matchmaker. Determine the exact investor profile required based on the financial and risk reports. \n\n{format_instructions}"),
        ("user", "Startup: {startup_name}\nFinancials: {financial_report}\nRisks: {risk_report}")
    ])
    chain = prompt | llm | parser
    res = chain.invoke({
        "startup_name": state["startup_name"],
        "financial_report": state["financial_report"],
        "risk_report": state["risk_report"],
        "format_instructions": parser.get_format_instructions()
    })
    return {"match_criteria": res}

def compiler(state: DiligenceState):
    print(f"📝 Lead Partner compiling Final Verdict...")
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are the Lead Partner at a tier-1 VC firm. Write a concise, brutal 2-paragraph executive summary and a final GO / NO-GO verdict."),
        ("user", "Review this Due Diligence for {startup_name}.\n\nFinancials: {financial_report}\n\nRisks: {risk_report}\n\nMatching: {match_criteria}")
    ])
    chain = prompt | llm
    res = chain.invoke({
        "startup_name": state["startup_name"],
        "financial_report": state["financial_report"],
        "risk_report": state["risk_report"],
        "match_criteria": state["match_criteria"]
    })
    return {"final_verdict": res.content}

# ==========================================
# LANGGRAPH ORCHESTRATION
# ==========================================
workflow = StateGraph(DiligenceState)

workflow.add_node("financial_analyst", financial_analyst)
workflow.add_node("interrogator", interrogator)
workflow.add_node("matchmaker", matchmaker)
workflow.add_node("compiler", compiler)

workflow.add_edge(START, "financial_analyst")
workflow.add_edge("financial_analyst", "interrogator")
workflow.add_edge("interrogator", "matchmaker")
workflow.add_edge("matchmaker", "compiler")
workflow.add_edge("compiler", END)

diligence_swarm = workflow.compile()