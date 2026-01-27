from sqlalchemy import Column, String, DateTime, Text, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.db.postgres import Base


class MaterialStatus(enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Material(Base):
    __tablename__ = "materials"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    notebook_id = Column(UUID(as_uuid=True), ForeignKey("notebooks.id", ondelete="SET NULL"), nullable=True, index=True)
    filename = Column(String(255), nullable=False)
    original_text = Column(Text, nullable=True)
    status = Column(Enum(MaterialStatus), default=MaterialStatus.PENDING)
    chunk_count = Column(String(10), default="0")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="materials")
    notebook = relationship("Notebook", back_populates="materials")

