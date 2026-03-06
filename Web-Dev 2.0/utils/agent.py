# utils/agent.py
import os
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv() 

# We use the standard OpenAI client, but point it to Groq's free API!
client = AsyncOpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

async def generate_screening_question(investor_thesis: str, project_title: str, project_pitch: str, domain: str) -> str:
    """
    Acts as an autonomous VC Analyst using Groq's Lightning Fast Free API.
    """
    
    system_prompt = """
    You are an elite, highly analytical Venture Capital Due Diligence Agent.
    Your job is to read a startup's pitch and ask exactly ONE piercing, critical question 
    that tests the founder's technical depth, market viability, or scalability. 
    
    Do not introduce yourself. Do not say "Hello". Do not offer advice. 
    Only return the single, direct question.
    """

    user_prompt = f"""
    INVESTOR THESIS: "{investor_thesis}"
    
    STARTUP PROJECT: "{project_title}"
    DOMAIN: "{domain}"
    PITCH: "{project_pitch}"
    
    Based on the alignment between the investor's thesis and the startup's pitch, 
    ask your single due-diligence question now:
    """

    try:
        # We use Meta's brilliant Llama 3 model running on Groq hardware
        # UPDATED: Using Groq's newest supported Llama 3.3 model!
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile", 
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=150
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"[Agent Error] Failed to generate question: {e}")
        return "Can you elaborate on your primary go-to-market strategy and how you plan to overcome initial customer acquisition costs?"