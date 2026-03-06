# routers/agent.py
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
import models
import uuid 
from database import get_db
from utils.auth import get_current_user
from utils.agent import generate_screening_question
import io
import json
import PyPDF2
from fastapi import APIRouter, UploadFile, File, Form, Depends
# ... your other imports ...

router = APIRouter(tags=["AI Agent"])

class ScreenRequest(BaseModel):
    project_id: int

class CoPilotMessage(BaseModel):
    role: str
    content: str

class CoPilotRequest(BaseModel):
    profile_id: int  # We use this to grab their context!
    message: str
    history: List[CoPilotMessage] = []   

@router.post("/generate-question")
async def trigger_ai_screening(
    req: ScreenRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Generates a contextual AI due-diligence question for a specific project based on the current user's (investor's) profile.
    """
    # 1. Fetch the Investor's Profile (Current User)
    investor_profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    if not investor_profile:
        raise HTTPException(status_code=400, detail="Investor profile not found.")
        
    investor_thesis = f"{investor_profile.bio} {investor_profile.interests}"

    # 2. Fetch the Target Project
    project = db.query(models.Project).filter(models.Project.id == req.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    # 3. Trigger the LLM Agent
    question = await generate_screening_question(
        investor_thesis=investor_thesis,
        project_title=project.title,
        project_pitch=project.description,
        domain=project.domain
    )

    return {
        "status": "success",
        "project_id": project.id,
        "investor_id": current_user.id,
        "agent_question": question
    }

@router.get("/test")
async def quick_test_ai():
    """
    A temporary developer endpoint to test Groq instantly without needing the UI, DB, or Auth.
    """
    # We will use some mock data to test the brain!
    test_question = await generate_screening_question(
        investor_thesis="Looking for highly scalable defense and autonomous technologies.",
        project_title="Project ETHOS",
        project_pitch="A simulated autonomous drone swarm defense system.",
        domain="Defense Tech & AI"
    )
    
    return {
        "status": "Groq is Online! 🚀",
        "generated_question": test_question
    }


@router.post("/copilot")
async def executive_copilot_chat(
    req: CoPilotRequest,
    db: Session = Depends(get_db)
):
    """
    A highly contextual AI advisor that guides founders and investors based on their profile data.
    """
    # 1. Fetch the User's Context
    profile = db.query(models.Profile).filter(models.Profile.id == req.profile_id).first()
    
    # Safely extract data so the AI knows EXACTLY who it's talking to
    user_role = profile.role if profile and profile.role else "Professional"
    user_domain = profile.interests if profile and profile.interests else "General Business"
    user_bio = profile.bio if profile and profile.bio else "Looking to navigate the platform."
    user_name = profile.full_name if profile and profile.full_name else "User"

    # 2. Craft the "System Prompt" (The AI's Persona)
    system_prompt = f"""
    You are the 'FoundMatch Executive Co-Pilot', an elite, highly strategic AI advisor built directly into an institutional capital allocation platform.
    
    You are currently advising: {user_name}.
    Their Role: {user_role} (Investor, Founder, or Entrepreneur)
    Their Domain Focus: {user_domain}
    Their Background: {user_bio}
    
    INSTRUCTIONS:
    - If they are a Founder, act as a strict but brilliant VC Partner. Advise them on growth, pitch strategy, and closing deals.
    - If they are an Investor, act as a sharp Quantitative Analyst. Help them spot red flags, understand technical domains, and optimize their thesis.
    - Keep responses highly professional, concise, actionable, and formatted cleanly. Do not use corporate jargon. Be direct.
    """

    # 3. Format the conversation history for the LLM
    messages = [{"role": "system", "content": system_prompt}]
    
    # Add previous chat history so it remembers the conversation
    for msg in req.history:
        messages.append({"role": msg.role, "content": msg.content})
        
    # Add the newest message
    messages.append({"role": "user", "content": req.message})

    try:
        # 4. Call the free Groq API
        from utils.agent import client # Re-use the Groq client we built earlier!
        
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.7,
            max_tokens=500
        )
        
        ai_reply = response.choices[0].message.content.strip()
        
        return {
            "status": "success",
            "reply": ai_reply
        }
    except Exception as e:
        print(f"[Co-Pilot Error] {e}")
        return {"status": "error", "reply": "I am experiencing network latency. Please try your request again."}


import json

class ChatHistoryItem(BaseModel):
    role: str
    content: str

class ChatAssistRequest(BaseModel):
    sender_id: str
    receiver_id: str
    history: List[ChatHistoryItem] = []



@router.post("/chat-assist")
async def generate_chat_suggestions(
    req: ChatAssistRequest,
    db: Session = Depends(get_db)
):
    # --- SAFE RESOLVER ---
    def get_profile_safe(identifier):
        try:
            # If it's a UUID, search by user_id
            uuid.UUID(str(identifier))
            return db.query(models.Profile).filter(models.Profile.user_id == str(identifier)).first()
        except ValueError:
            # If it's a number, search by id
            return db.query(models.Profile).filter(models.Profile.id == int(identifier)).first()

    # 1. Fetch BOTH profiles safely without crashing PostgreSQL
    sender = get_profile_safe(req.sender_id)
    receiver = get_profile_safe(req.receiver_id)

    #if not sender or not receiver:
        #return {"suggestions": ["Could you elaborate on your traction?", "I'd love to schedule a quick call.", "Can you share your pitch deck?"]}

    # 2. Construct the context
    system_prompt = f"""
    You are an elite M&A advisor and Venture Capital ghostwriter. 
    You are writing on behalf of the SENDER to the RECEIVER.
    
    [SENDER CONTEXT]
    Name: {sender.full_name if sender else 'User'}
    Role: {sender.role if sender else 'Professional'}
    
    [RECEIVER CONTEXT]
    Name: {receiver.full_name if receiver else 'User'}
    Role: {receiver.role if receiver else 'Professional'}

    INSTRUCTIONS:
    - Generate EXACTLY 3 brilliant, concise, and highly professional message suggestions.
    - Return ONLY a valid JSON array of 3 strings. Do not include markdown formatting.
    """

    messages = [{"role": "system", "content": system_prompt}]
    for msg in req.history[-4:]: 
        messages.append({"role": msg.role, "content": msg.content})

    try:
        from utils.agent import client 
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.6,
            max_tokens=300
        )
        
        import json
        raw_reply = response.choices[0].message.content.strip()
        
        if raw_reply.startswith("```json"):
            raw_reply = raw_reply[7:-3]
        elif raw_reply.startswith("```"):
            raw_reply = raw_reply[3:-3]
            
        suggestions = json.loads(raw_reply)
        return {"suggestions": suggestions}
        
    except Exception as e:
        print(f"[Chat Assist Error] {e}")
        return {"suggestions": [
            "What does your current runway and burn rate look like?",
            "I believe our strategic visions align perfectly. Can we discuss your go-to-market?",
            "Let's get 15 minutes on the calendar this week to dive deeper."
        ]}

class CoPilotAssistRequest(BaseModel):
    profile_id: int

@router.post("/copilot-assist")
async def generate_copilot_suggestions(
    req: CoPilotAssistRequest,
    db: Session = Depends(get_db)
):
    """
    Analyzes the user's profile and generates 3 strategic, humane questions 
    the user should ask their Executive Co-Pilot.
    """
    # 1. Fetch user context
    profile = db.query(models.Profile).filter(models.Profile.id == req.profile_id).first()

    user_role = profile.role if profile and profile.role else "Professional"
    user_domain = profile.interests if profile and profile.interests else "General Business"

    # 2. Instruct the AI on how to write the suggestions
    system_prompt = f"""
    You are an elite Venture Capital advisor. Your client is a {user_role} in the {user_domain} sector.
    They are looking at a blank chat box and need to know what to ask you.
    
    Generate EXACTLY 3 highly strategic, humane questions this client should ask you right now to optimize their success on this platform.
    - Question 1: Focused on market analysis or thesis validation.
    - Question 2: Focused on tactical growth, networking, or deal flow.
    - Question 3: Focused on risk mitigation or operational blind spots.
    
    Format the questions from the FIRST-PERSON perspective of the user (e.g., "What metrics should I focus on...").
    Return ONLY a valid JSON array of 3 strings. Do not include markdown formatting like ```json.
    """

    try:
        from utils.agent import client 
        
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "system", "content": system_prompt}],
            temperature=0.6,
            max_tokens=250
        )
        
        # 3. Safely parse the JSON response
        raw_reply = response.choices[0].message.content.strip()
        if raw_reply.startswith("```json"):
            raw_reply = raw_reply[7:-3]
        elif raw_reply.startswith("```"):
            raw_reply = raw_reply[3:-3]
            
        suggestions = json.loads(raw_reply)
        return {"suggestions": suggestions}
        
    except Exception as e:
        print(f"[Co-Pilot Assist Error] {e}")
        return {"suggestions": [
            "Based on my profile, what should my primary focus be this week?",
            "How can I better position my thesis to attract top-tier partners?",
            "What are the most common blind spots for someone in my domain?"
        ]}



@router.post("/analyze-document")
async def analyze_document(
    file: UploadFile = File(...),
    message: str = Form(...),
    history: str = Form("[]"),
    profile_id: str = Form(...)
):
    """
    In-memory Document Analyzer. Reads a PDF or TXT, feeds it to the LLM, 
    and instantly destroys the file from memory.
    """
    try:
        # 1. Read file directly into RAM
        content = await file.read()
        extracted_text = ""
        
        if file.filename.lower().endswith('.pdf'):
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
            for page in pdf_reader.pages:
                extracted_text += page.extract_text() + "\n"
        else:
            # Fallback for TXT or CSV files
            extracted_text = content.decode('utf-8', errors='ignore')
            
        # Cap the text to prevent exceeding the LLM context window (~15,000 chars)
        extracted_text = extracted_text[:15000] 

        # 2. Build the highly-contextual Prompt
        system_prompt = f"""
        You are an elite Venture Capital Analyst and Startup Advisor. 
        The user has securely attached a document named '{file.filename}'.
        
        [ATTACHED DOCUMENT TEXT]
        {extracted_text}
        
        INSTRUCTIONS:
        Read the document above and answer the user's prompt directly and professionally. 
        If asking for a critique, be sharp, constructive, and institutional.
        """

        messages = [{"role": "system", "content": system_prompt}]
        
        # 3. Append Chat History
        past_messages = json.loads(history)
        for msg in past_messages[-4:]:
            messages.append({"role": msg["role"], "content": msg["content"]})
            
        # Add the current prompt
        messages.append({"role": "user", "content": message})

        # 4. Call the LLM
        from utils.agent import client 
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.3, # Lower temperature for analytical accuracy
            max_tokens=1000
        )
        
        return {"reply": response.choices[0].message.content.strip()}
        
    except Exception as e:
        print(f"[Document AI Error] {e}")
        return {"reply": "⚠️ I encountered an error reading that document. Please ensure it is a valid text-based PDF."}