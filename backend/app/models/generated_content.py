from sqlalchemy import Column, String, Text, ForeignKey, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.db.postgres import Base


class ContentType(enum.Enum):
    FLASHCARDS = "flashcards"
    QUIZ = "quiz"
    SLIDES = "slides"
    AUDIO = "audio"
    VIDEO = "video"


class GeneratedContent(Base):
    __tablename__ = "generated_content"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    notebook_id = Column(UUID(as_uuid=True), ForeignKey("notebooks.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    material_id = Column(UUID(as_uuid=True), ForeignKey("materials.id", ondelete="CASCADE"), nullable=True)
    content_type = Column(String(50), nullable=False)  # flashcards, quiz, slides, audio, video
    title = Column(String(255), nullable=True)
    data = Column(JSONB, nullable=False)  # The actual content/metadata as JSON
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    notebook = relationship("Notebook", backref="generated_content")
    user = relationship("User", backref="generated_content")
    material = relationship("Material", backref="generated_content")
