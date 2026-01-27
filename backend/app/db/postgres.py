from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
import os


DATABASE_URL = os.getenv("DATABASE_URL")


class Base(DeclarativeBase):
    pass


engine = None
SessionLocal = None


def init_db():
    global engine, SessionLocal
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL environment variable is not set")
    engine = create_async_engine(DATABASE_URL, echo=False)
    SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_db():
    async with SessionLocal() as session:
        yield session
