"""Database models and setup using SQLAlchemy."""

from datetime import datetime

from database.models.enums import SenderType, SummaryStatus
from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    create_engine,
    text,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker

Base = declarative_base()


class File(Base):
    """SQLAlchemy model for uploaded file."""

    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(String, unique=True, index=True, nullable=False)
    file_name = Column(String, nullable=False)
    total_threads = Column(Integer, default=0, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    threads = relationship(
        "Thread", back_populates="file", cascade="all, delete-orphan"
    )


class Thread(Base):
    """SQLAlchemy model for email thread."""

    __tablename__ = "threads"

    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=True)  # Link to file
    thread_id = Column(String, unique=True, index=True, nullable=False)
    topic = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    initiated_by = Column(Enum(SenderType), nullable=False)
    order_id = Column(String, nullable=False)
    product = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    file = relationship("File", back_populates="threads")
    messages = relationship(
        "Message", back_populates="thread", cascade="all, delete-orphan"
    )
    summaries = relationship(
        "Summary", back_populates="thread", cascade="all, delete-orphan"
    )


class Message(Base):
    """SQLAlchemy model for email message."""

    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    thread_id = Column(Integer, ForeignKey("threads.id"), nullable=False)
    message_id = Column(String, nullable=False)
    sender = Column(Enum(SenderType), nullable=False)
    timestamp = Column(String, nullable=False)
    body = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    thread = relationship("Thread", back_populates="messages")


class Summary(Base):
    """SQLAlchemy model for summary."""

    __tablename__ = "summaries"

    id = Column(Integer, primary_key=True, index=True)
    thread_id = Column(Integer, ForeignKey("threads.id"), nullable=False)
    summary_id = Column(String, unique=True, index=True, nullable=False)
    original_summary = Column(Text, nullable=False)
    edited_summary = Column(Text, nullable=True)
    status = Column(Enum(SummaryStatus), default=SummaryStatus.PENDING, nullable=False)
    approved_by = Column(String, nullable=True)
    approved_at = Column(DateTime, nullable=True)
    remarks = Column(Text, nullable=True)  # Remarks/notes for approval
    rejection_reason = Column(Text, nullable=True)  # Reason for rejection
    structured_data_json = Column(Text, nullable=True)  # Store structured data as JSON
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    thread = relationship("Thread", back_populates="summaries")


# Database setup
DATABASE_URL = "sqlite:///./ce_summarization.db"
# Enable WAL mode for better concurrency and add timeout for locked database
engine = create_engine(
    DATABASE_URL,
    connect_args={
        "check_same_thread": False,
        "timeout": 30.0,  # Wait up to 30 seconds for database lock
    },
    pool_pre_ping=True,  # Verify connections before using
    pool_size=10,  # Connection pool size
    max_overflow=20,  # Max overflow connections
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db() -> None:
    """Initialize database tables and enable WAL mode for better concurrency."""
    Base.metadata.create_all(bind=engine)
    # Enable WAL (Write-Ahead Logging) mode for better concurrent access
    with engine.connect() as conn:
        conn.execute(text("PRAGMA journal_mode=WAL"))
        conn.execute(
            text("PRAGMA synchronous=NORMAL")
        )  # Balance between safety and performance
        conn.execute(text("PRAGMA busy_timeout=30000"))  # 30 second timeout
        conn.commit()


def get_db():
    """Get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
