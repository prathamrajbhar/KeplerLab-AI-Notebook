"""
Database Reset Script
Drops all tables and recreates them fresh.
Also clears ChromaDB collections.

WARNING: This will DELETE ALL DATA!
"""

import asyncio
import os
import shutil
from dotenv import load_dotenv

load_dotenv()

from sqlalchemy.ext.asyncio import create_async_engine
from app.db.postgres import Base

# Import all models to register them with SQLAlchemy
from app.models.user import User
from app.models.notebook import Notebook
from app.models.material import Material


async def reset_database():
    """Drop all tables and recreate them."""
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("ERROR: DATABASE_URL not set in .env")
        return
    
    print("=" * 50)
    print("DATABASE RESET SCRIPT")
    print("=" * 50)
    print("\nWARNING: This will DELETE ALL DATA!")
    print("Tables to be dropped and recreated: users, notebooks, materials")
    
    confirm = input("\nType 'RESET' to confirm: ")
    if confirm != "RESET":
        print("Aborted.")
        return
    
    engine = create_async_engine(database_url, echo=True)
    
    print("\n[1/3] Dropping all tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    print("\n[2/3] Recreating all tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    await engine.dispose()
    
    print("\n[3/3] Clearing ChromaDB data...")
    chroma_dir = os.getenv("CHROMA_DIR")
    if chroma_dir and os.path.exists(chroma_dir):
        try:
            shutil.rmtree(chroma_dir)
            os.makedirs(chroma_dir, exist_ok=True)
            print(f"Cleared ChromaDB directory: {chroma_dir}")
        except Exception as e:
            print(f"Warning: Could not clear ChromaDB: {e}")
    else:
        print("ChromaDB directory not found or not configured")
    
    # Clear uploaded files (optional)
    upload_dir = os.getenv("UPLOAD_DIR")
    if upload_dir and os.path.exists(upload_dir):
        try:
            shutil.rmtree(upload_dir)
            os.makedirs(upload_dir, exist_ok=True)
            print(f"Cleared uploads directory: {upload_dir}")
        except Exception as e:
            print(f"Warning: Could not clear uploads: {e}")
    
    # Clear output files
    output_dirs = ["output/html", "output/videos", "output/podcasts", "output/slide_images"]
    for output_dir in output_dirs:
        if os.path.exists(output_dir):
            try:
                shutil.rmtree(output_dir)
                os.makedirs(output_dir, exist_ok=True)
                print(f"Cleared output directory: {output_dir}")
            except Exception as e:
                print(f"Warning: Could not clear {output_dir}: {e}")
    
    print("\n" + "=" * 50)
    print("DATABASE RESET COMPLETE!")
    print("=" * 50)
    print("\nCreated tables:")
    print("  - users")
    print("  - notebooks") 
    print("  - materials")
    print("\nYou can now start fresh with new user registrations.")


if __name__ == "__main__":
    asyncio.run(reset_database())
