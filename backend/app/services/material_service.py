from app.services.text_processing.extractor import extract_text
from app.services.text_processing.chunker import chunk_text
from app.services.rag.embedder import embed_and_store
from app.models.material import Material, MaterialStatus
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List
from uuid import UUID


async def process_material(
    file_path: str,
    filename: str,
    user_id: UUID,
    db: AsyncSession,
    notebook_id: Optional[UUID] = None
) -> Material:
    material = Material(
        filename=filename,
        user_id=user_id,
        notebook_id=notebook_id,
        status=MaterialStatus.PROCESSING
    )
    db.add(material)
    await db.commit()
    await db.refresh(material)
    
    try:
        text = extract_text(file_path)
        material.original_text = text
        
        chunks = chunk_text(text)
        material.chunk_count = str(len(chunks))
        
        embed_and_store(chunks, material_id=str(material.id), user_id=str(user_id))
        
        material.status = MaterialStatus.COMPLETED
        await db.commit()
        await db.refresh(material)
        return material
    except Exception as e:
        material.status = MaterialStatus.FAILED
        await db.commit()
        raise e


async def get_material(material_id: str, db: AsyncSession) -> Material:
    result = await db.get(Material, material_id)
    return result


async def get_material_for_user(material_id: str, user_id: UUID, db: AsyncSession) -> Optional[Material]:
    result = await db.execute(
        select(Material).where(Material.id == material_id, Material.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def get_user_materials(user_id: UUID, db: AsyncSession, notebook_id: Optional[UUID] = None) -> List[Material]:
    query = select(Material).where(Material.user_id == user_id)
    if notebook_id:
        query = query.where(Material.notebook_id == notebook_id)
    query = query.order_by(Material.created_at.desc())
    result = await db.execute(query)
    return list(result.scalars().all())


async def delete_material(material_id: str, user_id: UUID, db: AsyncSession) -> bool:
    material = await get_material_for_user(material_id, user_id, db)
    if not material:
        return False
    await db.delete(material)
    await db.commit()
    return True

