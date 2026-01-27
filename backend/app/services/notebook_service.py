from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID

from app.models.notebook import Notebook
from app.services.logger import get_logger

logger = get_logger(__name__)


async def create_notebook(user_id: UUID, name: str, description: Optional[str], db: AsyncSession) -> Notebook:
    notebook = Notebook(
        user_id=user_id,
        name=name,
        description=description
    )
    db.add(notebook)
    await db.commit()
    await db.refresh(notebook)
    logger.info(f"Created notebook: {notebook.id} for user: {user_id}")
    return notebook


async def get_user_notebooks(user_id: UUID, db: AsyncSession) -> List[Notebook]:
    result = await db.execute(
        select(Notebook).where(Notebook.user_id == user_id).order_by(Notebook.created_at.desc())
    )
    return list(result.scalars().all())


async def get_notebook_by_id(notebook_id: UUID, user_id: UUID, db: AsyncSession) -> Optional[Notebook]:
    result = await db.execute(
        select(Notebook).where(Notebook.id == notebook_id, Notebook.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def update_notebook(
    notebook_id: UUID,
    user_id: UUID,
    name: Optional[str],
    description: Optional[str],
    db: AsyncSession
) -> Optional[Notebook]:
    notebook = await get_notebook_by_id(notebook_id, user_id, db)
    if not notebook:
        return None
    
    if name is not None:
        notebook.name = name
    if description is not None:
        notebook.description = description
    
    await db.commit()
    await db.refresh(notebook)
    return notebook


async def delete_notebook(notebook_id: UUID, user_id: UUID, db: AsyncSession) -> bool:
    notebook = await get_notebook_by_id(notebook_id, user_id, db)
    if not notebook:
        return False
    
    await db.delete(notebook)
    await db.commit()
    logger.info(f"Deleted notebook: {notebook_id}")
    return True
