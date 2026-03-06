import os
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse

router = APIRouter()

# Create a secure local directory to act as the Vault (can be migrated to S3 later)
VAULT_DIR = "secure_vault"
os.makedirs(VAULT_DIR, exist_ok=True)

@router.post("/upload")
async def upload_encrypted_blob(file: UploadFile = File(...)):
    """
    Receives an already-encrypted binary blob from the frontend and stores it.
    The server has zero ability to read the contents of this file.
    """
    # Generate an untraceable UUID for the file
    file_id = str(uuid.uuid4())
    file_path = os.path.join(VAULT_DIR, file_id)
    
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
        
    return {"file_id": file_id}

@router.get("/download/{file_id}")
async def download_encrypted_blob(file_id: str):
    """
    Serves the encrypted blob back to the authenticated user's browser for decryption.
    """
    file_path = os.path.join(VAULT_DIR, file_id)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Encrypted asset not found in vault.")
    
    return FileResponse(file_path, media_type="application/octet-stream")