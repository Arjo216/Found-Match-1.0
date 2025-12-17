import os
from datetime import datetime, timedelta
from typing import Union, Any
from jose import jwt
from passlib.context import CryptContext

# --- CONFIGURATION ---
# In production, these should come from your .env file
SECRET_KEY = os.getenv("SECRET_KEY", "YOUR_SUPER_SECRET_PRODUCTION_KEY_12345")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # Tokens last 7 days

# --- PASSWORD HASHING ---
# We use Bcrypt, the industry standard for password security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Checks if the typed password matches the stored hash.
    """
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """
    Turns a plain password like '12345' into a secure hash like '$2b$12$...'
    """
    return pwd_context.hash(password)

# --- JWT TOKEN GENERATION ---

def create_access_token(subject: Union[str, Any]) -> str:
    """
    Creates a stateless JSON Web Token (JWT) containing the User ID (subject).
    This token allows the user to stay logged in without database sessions.
    """
    # Set expiration time
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Create the payload (data inside the token)
    to_encode = {"sub": str(subject), "exp": expire}
    
    # Sign the token with your Secret Key
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt
def decode_access_token(token: str) -> Union[str, None]:
    """
    Decodes a JWT token to extract the subject (User ID).
    Returns None if the token is invalid or expired.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        subject: str = payload.get("sub")
        return subject
    except jwt.ExpiredSignatureError:
        print("Token has expired")
        return None
    except jwt.JWTError:
        print("Invalid token")
        return None