# File: agents/codeops_graph.py
# 
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# 
#     http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# ==============================================================================

import os
from typing import TypedDict, Dict, Any
from langgraph.graph import StateGraph, START, END
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

# ==========================================
# STATE & SCHEMAS
# ==========================================
class CodeOpsState(TypedDict):
    project_name: str
    startup_pitch: str
    architecture_plan: Dict[str, Any]
    generated_code: Dict[str, str] # Maps filename to raw code
    security_audit: str
    deployment_ready: bool

class ArchitectureOutput(BaseModel):
    tech_stack: list[str] = Field(description="List of core technologies (e.g., FastAPI, React, Docker)")
    folder_structure: list[str] = Field(description="List of necessary files to generate (e.g., 'main.py', 'Dockerfile', 'requirements.txt')")
    system_design_notes: str = Field(description="Brief explanation of the architecture choice")

class CodeOutput(BaseModel):
    files: dict[str, str] = Field(description="Dictionary where key is filename and value is the actual raw code for that file")

# ==========================================
# DUAL-ENGINE INITIALIZATION
# ==========================================
groq_llm = ChatGroq(
    groq_api_key=os.getenv("GROQ_API_KEY"),
    model_name="llama-3.3-70b-versatile",
    temperature=0.1, # Extremely low temperature for strict coding syntax
    max_tokens=5000,
)
gemini_llm = ChatGoogleGenerativeAI(
    google_api_key=os.getenv("GEMINI_API_KEY"),
    #model="gemini-1.5-pro", # Using Pro for heavy coding tasks
    model="gemini-1.5-flash", 
    temperature=0.1,
)
llm = groq_llm.with_fallbacks([gemini_llm])

# ==========================================
# SWARM AGENT NODES
# ==========================================
def system_architect(state: CodeOpsState):
    print(f"📐 Architect designing cloud infrastructure for {state['project_name']}...")
    parser = JsonOutputParser(pydantic_object=ArchitectureOutput)
    
    sys_prompt = """
    You are an Elite Cloud Architect. Design the minimal viable product (MVP) tech stack and file structure based on the startup's pitch.
    
    CRITICAL RULE: You MUST output valid, raw JSON only. Do not wrap in markdown blocks.
    
    {format_instructions}
    """
    prompt = ChatPromptTemplate.from_messages([
        ("system", sys_prompt),
        ("user", "Project: {project_name}\nPitch: {startup_pitch}")
    ])
    
    chain = prompt | llm | parser
    res = chain.invoke({
        "project_name": state["project_name"],
        "startup_pitch": state["startup_pitch"],
        "format_instructions": parser.get_format_instructions()
    })
    return {"architecture_plan": res}

def core_developer(state: CodeOpsState):
    print(f"💻 Developer writing production code for {state['project_name']}...")
    parser = JsonOutputParser(pydantic_object=CodeOutput)
    
    sys_prompt = """
    You are a Senior Staff Software Engineer. Write the actual raw, production-ready code for the requested files.
    
    CRITICAL JSON ESCAPING RULES (ANTI-CRASH PROTOCOL):
    1. You MUST output ONLY a valid, raw JSON object. Do NOT wrap it in ```json markdown blocks.
    2. Because you are writing raw code inside JSON string values, you MUST properly escape every single double-quote (\") and backslash (\\).
    3. NEVER use literal newline characters or multiline string continuations (\\) inside the JSON strings. You MUST use the literal characters "\\n" to represent line breaks.
    4. Failure to strictly adhere to JSON RFC 8259 formatting will cause a critical system crash.
    
    {format_instructions}
    """
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", sys_prompt),
        ("user", "Architecture Blueprint: {architecture_plan}\n\nWrite the exact code for these files respecting the strict JSON escape rules.")
    ])
    
    chain = prompt | llm | parser
    res = chain.invoke({
        "architecture_plan": state["architecture_plan"],
        "format_instructions": parser.get_format_instructions()
    })
    return {"generated_code": res["files"]}

def devsecops_reviewer(state: CodeOpsState):
    print(f"🛡️ DevSecOps scanning code for vulnerabilities...")
    
    sys_prompt = """
    You are a DevSecOps Lead. Review the generated code for security flaws (e.g., hardcoded secrets, injection vulnerabilities, missing environment variables).
    
    Output a highly professional DevSecOps Audit report.
    - Start with a clear verdict: **Verdict: PASS** or **Verdict: FAIL**
    - List the vulnerabilities found (if any) and how to fix them.
    - If the code uses mock credentials or hardcoded keys, it MUST FAIL.
    """
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", sys_prompt),
        ("user", "Review this codebase:\n\n{generated_code}")
    ])
    
    chain = prompt | llm
    res = chain.invoke({"generated_code": str(state["generated_code"])})
    
    # Simple heuristic to determine if deployment is allowed based on the DevSecOps verdict
    is_safe = "VERDICT: FAIL" not in res.content.upper() and "VERDICT: PASS" in res.content.upper()
    return {"security_audit": res.content, "deployment_ready": is_safe}

# ==========================================
# LANGGRAPH ORCHESTRATION
# ==========================================
workflow = StateGraph(CodeOpsState)

workflow.add_node("architect", system_architect)
workflow.add_node("developer", core_developer)
workflow.add_node("secops", devsecops_reviewer)

workflow.add_edge(START, "architect")
workflow.add_edge("architect", "developer")
workflow.add_edge("developer", "secops")
workflow.add_edge("secops", END)

codeops_swarm = workflow.compile()