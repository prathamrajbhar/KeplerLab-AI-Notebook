from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv()

from app.db.postgres import init_db

# Import all models for SQLAlchemy to create tables
from app.models.user import User
from app.models.notebook import Notebook
from app.models.material import Material

from app.routes.auth import router as auth_router
from app.routes.notebook import router as notebook_router
from app.routes.upload import router as upload_router
from app.routes.slide import router as slide_router
from app.routes.podcast_router import router as podcast_router
from app.routes.explainer import router as explainer_router
from app.routes.flashcard import router as flashcard_router
from app.routes.quiz import router as quiz_router
from app.routes.chat import router as chat_router


import time
from app.services.logger import get_logger

logger = get_logger("main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(lifespan=lifespan, title="Study Assistant API", version="2.0.0")

@app.middleware("http")
async def log_requests(request, call_next):
    start_time = time.time()
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        logger.info(
            f"Method: {request.method} Path: {request.url.path} Status: {response.status_code} Duration: {process_time:.2f}s"
        )
        return response
    except Exception as e:
        process_time = time.time() - start_time
        logger.error(
            f"Method: {request.method} Path: {request.url.path} Error: {str(e)} Duration: {process_time:.2f}s"
        )
        raise e

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Public routes (no authentication required)
app.include_router(auth_router, tags=["auth"])

# Protected routes (authentication required)
app.include_router(notebook_router, tags=["notebooks"])
app.include_router(upload_router, tags=["upload"])
app.include_router(slide_router, tags=["slide"])
app.include_router(podcast_router, tags=["podcast"])
app.include_router(explainer_router, tags=["explainer"])
app.include_router(flashcard_router, tags=["flashcard"])
app.include_router(quiz_router, tags=["quiz"])
app.include_router(chat_router, tags=["chat"])



