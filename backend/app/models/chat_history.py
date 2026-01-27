from sqlalchemy import Column, String, Text, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.db.postgres import Base


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    notebook_id = Column(UUID(as_uuid=True), ForeignKey("notebooks.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    notebook = relationship("Notebook", backref="messages")
    user = relationship("User", backref="chat_messages")
