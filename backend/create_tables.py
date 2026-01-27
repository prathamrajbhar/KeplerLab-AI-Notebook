import asyncio
from dotenv import load_dotenv
import os

load_dotenv()

from sqlalchemy.ext.asyncio import create_async_engine
from app.db.postgres import Base

# Import all models to register them with SQLAlchemy
from app.models.user import User
from app.models.notebook import Notebook
from app.models.material import Material
from app.models.chat_history import ChatMessage
from app.models.generated_content import GeneratedContent


async def create_tables():
    database_url = os.getenv("DATABASE_URL")
    
    engine = create_async_engine(database_url, echo=True)
    
    async with engine.begin() as conn:
        # Drop all tables first for clean migration (remove in production!)
        # await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    await engine.dispose()
    print("Tables created successfully!")
    print("Created tables: users, notebooks, materials")


if __name__ == "__main__":
    asyncio.run(create_tables())

