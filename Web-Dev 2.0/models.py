from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.dialects.sqlite import BLOB as SQLITE_BLOB
import uuid

from database import Base, engine

# Detect SQLite vs Postgres
IS_SQLITE = engine.url.get_backend_name() == "sqlite"

# Cross-DB GUID/UUID type
if IS_SQLITE:
    from sqlalchemy.types import TypeDecorator

    class GUID(TypeDecorator):
        impl = SQLITE_BLOB
        cache_ok = True

        def process_bind_param(self, value, dialect):
            if value is None:
                return None
            if not isinstance(value, uuid.UUID):
                return uuid.UUID(str(value)).bytes
            return value.bytes

        def process_result_value(self, value, dialect):
            if value is None:
                return None
            return uuid.UUID(bytes=value)
else:
    GUID = PG_UUID


class User(Base):
    __tablename__ = "users"

    id = Column(
        GUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4 if IS_SQLITE else None,
        server_default=None if IS_SQLITE else func.gen_random_uuid()
    )
    email = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(Text, nullable=False)
    is_investor = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete")
    projects = relationship("Project", back_populates="user", cascade="all, delete")
    matches_as_entrepreneur = relationship(
        "Match", back_populates="entrepreneur",
        foreign_keys="Match.entrepreneur_id", cascade="all, delete"
    )
    matches_as_investor = relationship(
        "Match", back_populates="investor",
        foreign_keys="Match.investor_id", cascade="all, delete"
    )


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True)
    user_id = Column(
        GUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True, nullable=False
    )
    full_name = Column(String(255), nullable=False)
    bio = Column(Text)
    location = Column(String(255))
    interests = Column(Text)
    role = Column(String(20), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="profile")
    matches = relationship("Match", back_populates="profile", cascade="all, delete")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True)
    user_id = Column(
        GUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    domain = Column(String(100), nullable=False)
    funding_goal = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="projects")


class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True)
    profile_id = Column(
        Integer,
        ForeignKey("profiles.id", ondelete="CASCADE"),
        nullable=False
    )
    entrepreneur_id = Column(
        GUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )
    investor_id = Column(
        GUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )
    match_score = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    profile = relationship("Profile", back_populates="matches")
    entrepreneur = relationship(
        "User", back_populates="matches_as_entrepreneur",
        foreign_keys=[entrepreneur_id]
    )
    investor = relationship(
        "User", back_populates="matches_as_investor",
        foreign_keys=[investor_id]
    )

    class MatchSwipe(Base):
     __tablename__ = "match_swipes"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)     # who swiped
    target_profile_id = Column(Integer, ForeignKey("profiles.id"), nullable=False)
    liked = Column(Boolean, nullable=False)
    type = Column(String(20), default="swipe")  # swipe | super
    created_at = Column(DateTime, default=datetime.utcnow)


# Ensure tables exist
Base.metadata.create_all(bind=engine)
