import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from database import Base
from main import app  # Import your FastAPI app

# Test database URL
TEST_DATABASE_URL = "sqlite:///./test.db"

@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Create the test DB and tables before tests run, drop it after."""
    
    # Drop existing test database file if it exists
    if os.path.exists("test.db"):
        os.remove("test.db")
    
    # Create new test database engine
    test_engine = create_engine(TEST_DATABASE_URL)
    
    # Create all tables using SQLAlchemy metadata
    Base.metadata.create_all(bind=test_engine)
    
    yield test_engine
    
    # Cleanup: remove the test database after tests complete
    test_engine.dispose()
    if os.path.exists("test.db"):
        os.remove("test.db")

@pytest.fixture(scope="session")
def test_engine(setup_test_database):
    """Provide test engine."""
    return setup_test_database

@pytest.fixture(scope="session")
def test_session(test_engine):
    """Create a test database session."""
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    session = TestingSessionLocal()
    yield session
    session.close()

@pytest.fixture
def db(test_session):
    """Provide a fresh database session for each test."""
    test_session.rollback()
    yield test_session
    test_session.rollback()

@pytest.fixture
def client(test_engine):
    """Provide a TestClient for making HTTP requests."""
    from database import get_db
    
    def override_get_db():
        TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()
    
    app.dependency_overrides[get_db] = override_get_db
    return TestClient(app)