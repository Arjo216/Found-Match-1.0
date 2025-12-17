# database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()  # loads from .env

#DATABASE_URL = "postgresql://postgres:6291875269Sm@db.wixckqcmcikxlgstlvkd.supabase.co:5432/postgres"
DATABASE_URL="postgresql://postgres.wixckqcmcikxlgstlvkd:6291875269Sm@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"
#DATABASE_URL="postgresql://postgres:6291875269Sm@db.wixcxqmc1kxlgst1vkd.supabase.co:5432/postgres?sslmode=require&connect_timeout=60"
# database.py
from supabase import create_client, Client

# Supabase configuration
url = "https://wixcxqmc1kxlgst1vkd.supabase.co"
key = "6dc1decj5ofcex6zCIgFwss9oJEla4n2R9tJAzcqwVji0R4PNuj23sM60ZiPmR76BmUW1TVvqSdTF4eZh_Wukg"  # Replace with your real key
supabase: Client = create_client(url, key)
# connect_args only needed for SQLite; remove if using Postgres
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

        # database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool

DATABASE_URL = os.getenv("DATABASE_URL")

# Add connection pool settings
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
    future=True,  # Enable SQLAlchemy 2.0 style
    connect_args={
        "connect_timeout": 60,
        "sslmode": "require"
    }  

)



SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")

# Normalize older 'postgres://' scheme (Heroku / some providers) to SQLAlchemy's expected scheme
if DATABASE_URL.startswith("postgres://"):
    # prefer psycopg2 explicit driver
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)

# Optionally: also accept supabase style connection string with percent-encoded characters already present

# Typical engine / session
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    future=True,        # SQLAlchemy 2.0 style
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True, expire_on_commit=False)
Base = declarative_base()
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()