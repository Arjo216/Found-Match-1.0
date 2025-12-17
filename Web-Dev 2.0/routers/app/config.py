#from pydantic import BaseSettings
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str  # e.g. "postgresql://user:password@localhost/dbname"

    class Config:
        env_file = ".env" # This loads variables from .env file at root
        extra = "allow"  # This allows extra fields  
settings = Settings()
#from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_minutes: int = 1440
    
    model_config = {
        "env_file": ".env"
    }

