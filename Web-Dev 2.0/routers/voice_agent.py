import os
import json
import tempfile
import asyncio
import edge_tts
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from groq import AsyncGroq

router = APIRouter()

# Initialize the Groq Client (Ensure GROQ_API_KEY is in your .env)
client = AsyncGroq(api_key=os.environ.get("GROQ_API_KEY"))

# The Persona of the VC
SYSTEM_PROMPT = """
You are the AI Managing Partner for Sequoia Capital. You are interviewing a startup founder live.
The founder is speaking to you. 
Listen to their pitch. Ask a sharp, aggressive follow-up question about their revenue, traction, or tech.
Keep your response strictly under 3 sentences. Be ruthless but professional. 
At the end of your response, output a confidence score in brackets like this: [Confidence: 85%]
"""

async def text_to_speech_bytes(text: str) -> bytes:
    """Converts the AI's text response into spoken audio bytes."""
    communicate = edge_tts.Communicate(text, "en-US-ChristopherNeural") # A professional male voice
    audio_data = b""
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_data += chunk["data"]
    return audio_data

@router.websocket("/interrogation/{profile_id}")
async def voice_interrogation_endpoint(websocket: WebSocket, profile_id: str):
    await websocket.accept()
    
    # Give the AI memory of the conversation
    chat_history = [{"role": "system", "content": SYSTEM_PROMPT}]
    
    try:
        # 1. Send the opening greeting audio
        opening_text = "Hello Founder. I am the AI Partner at FoundMatch. You have 60 seconds. Pitch me your vision."
        greeting_audio = await text_to_speech_bytes(opening_text)
        await websocket.send_bytes(greeting_audio)
        
        while True:
            # 2. Receive audio bytes from the Frontend (User's microphone)
            # The frontend will send the audio as a WEBM or WAV blob
            user_audio_bytes = await websocket.receive_bytes()
            
            print("🎙️ Received audio from founder. Processing...")
            
            # 3. Save bytes to a temporary file for Groq Whisper
            with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_audio:
                temp_audio.write(user_audio_bytes)
                temp_audio_path = temp_audio.name

            # 4. Speech-to-Text (Whisper-large-v3-turbo is incredibly fast)
            with open(temp_audio_path, "rb") as file:
                transcription = await client.audio.transcriptions.create(
                    file=(temp_audio_path, file.read()),
                    model="whisper-large-v3-turbo",
                    prompt="The user is pitching a startup.", 
                    response_format="text"
                )
            
            os.remove(temp_audio_path) # Clean up
            user_text = transcription.strip()
            print(f"🗣️ Founder said: {user_text}")
            
            if not user_text:
                continue

            # Send the transcribed text to the frontend so the user can read what they said
            await websocket.send_text(json.dumps({"type": "transcript", "role": "founder", "content": user_text}))

            # 5. Get AI Response (The Brain)
            chat_history.append({"role": "user", "content": user_text})
            
            response = await client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=chat_history,
                temperature=0.6,
                max_tokens=150
            )
            
            ai_text = response.choices[0].message.content.strip()
            chat_history.append({"role": "assistant", "content": ai_text})
            print(f"🤖 AI responded: {ai_text}")

            # Send the AI's text to the frontend for the visualizer
            await websocket.send_text(json.dumps({"type": "transcript", "role": "ai", "content": ai_text}))

            # 6. Text-to-Speech (The Voice)
            ai_audio_bytes = await text_to_speech_bytes(ai_text)
            
            # Send the actual voice audio back to the frontend to play out loud
            await websocket.send_bytes(ai_audio_bytes)

    except WebSocketDisconnect:
        print(f"🔌 Founder {profile_id} disconnected from the interrogation.")
    except Exception as e:
        print(f"❌ Voice Error: {e}")
        await websocket.close()