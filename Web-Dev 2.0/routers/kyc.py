# routers/kyc.py
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
import models
import os
import asyncio
from database import get_db
from utils.auth import get_current_user

router = APIRouter()

# --- Schemas ---
class KYCSubmitRequest(BaseModel):
    document_type: str  # 'PAN' or 'AADHAAR'
    document_id: str

class KYCResponse(BaseModel):
    status: str
    message: str
    mask: str | None = None

# --- Sandbox Magic Numbers ---
# Professional teams use these exact strings to test verified vs rejected states
SANDBOX_VERIFIED_PAN = "ABCDE1234F"
SANDBOX_VERIFIED_AADHAAR = "000011112222"
SANDBOX_REJECTED_PAN = "REJECT123X"

def mask_document(doc_type: str, doc_id: str) -> str:
    """Creates a secure mask so we don't store the raw ID in plain text."""
    if doc_type.upper() == "PAN" and len(doc_id) == 10:
        return f"XXXXX{doc_id[5:9]}X" # e.g., XXXXX1234X
    elif doc_type.upper() == "AADHAAR" and len(doc_id) == 12:
        return f"XXXX-XXXX-{doc_id[-4:]}" # e.g., XXXX-XXXX-2222
    return "INVALID_FORMAT"

@router.post("/verify", response_model=KYCResponse)
async def verify_identity(
    req: KYCSubmitRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Submits identity documents for verification. 
    Currently routed through a secure Developer Sandbox.
    """
    # 1. Developer Bypass Check (The "Cheat Code")
    if os.getenv("ENV") == "development" and req.document_id == "DEV_BYPASS":
        current_user.kyc_verified = True
        current_user.kyc_document_type = "DEV_OVERRIDE"
        current_user.kyc_document_mask = "BYPASS"
        db.commit()
        return {"status": "success", "message": "Developer bypass activated.", "mask": "BYPASS"}

    # Simulate network latency to a third-party API (makes the UI loader spin)
    await asyncio.sleep(1.5)

    doc_type = req.document_type.upper()
    doc_id = req.document_id.upper().replace(" ", "")

    # 2. Sandbox Logic
    is_verified = False
    
    if doc_type == "PAN":
        if doc_id == SANDBOX_VERIFIED_PAN:
            is_verified = True
        elif doc_id == SANDBOX_REJECTED_PAN:
            raise HTTPException(status_code=400, detail="Identity Verification Failed. PAN is flagged or invalid.")
        else:
            # In production, this is where you call requests.post("https://api.setu.co/...")
            # For now, we accept any format-valid input as a simulation
            if len(doc_id) == 10: 
                is_verified = True
            else:
                raise HTTPException(status_code=400, detail="Invalid PAN format.")

    elif doc_type == "AADHAAR":
        if doc_id == SANDBOX_VERIFIED_AADHAAR:
            is_verified = True
        else:
            if len(doc_id) == 12 and doc_id.isdigit():
                is_verified = True
            else:
                raise HTTPException(status_code=400, detail="Invalid Aadhaar format.")
    else:
        raise HTTPException(status_code=400, detail="Unsupported document type.")

    # 3. Securely update the database
    if is_verified:
        current_user.kyc_verified = True
        current_user.kyc_document_type = doc_type
        current_user.kyc_document_mask = mask_document(doc_type, doc_id)
        db.commit()
        
        return {
            "status": "success", 
            "message": "Identity successfully verified and vaulted.",
            "mask": current_user.kyc_document_mask
        }

@router.get("/status")
async def check_kyc_status(current_user: models.User = Depends(get_current_user)):
    """
    Frontend calls this to check if the user is allowed to access Deal Rooms.
    """
    return {
        "kyc_verified": current_user.kyc_verified,
        "document_type": current_user.kyc_document_type,
        "document_mask": current_user.kyc_document_mask
    }