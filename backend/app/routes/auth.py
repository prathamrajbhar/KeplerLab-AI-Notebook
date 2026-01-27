from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, EmailStr

from app.db.postgres import get_db
from app.services.auth import (
    register_user,
    authenticate_user,
    get_current_user,
    create_access_token,
    create_refresh_token,
    decode_token
)
from app.models.user import User
from app.services.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/auth")


class SignupRequest(BaseModel):
    email: EmailStr
    username: str
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    role: str

    class Config:
        from_attributes = True


class RefreshRequest(BaseModel):
    refresh_token: str


@router.post("/signup", response_model=UserResponse)
async def signup(request: SignupRequest, db: AsyncSession = Depends(get_db)):
    logger.info(f"Signup attempt for email: {request.email}")
    user = await register_user(request.email, request.username, request.password, db)
    logger.info(f"User registered successfully: {user.id}")
    return UserResponse(
        id=str(user.id),
        email=user.email,
        username=user.username,
        role=user.role
    )


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    logger.info(f"Login attempt for email: {request.email}")
    user = await authenticate_user(request.email, request.password, db)
    
    if not user:
        logger.warning(f"Failed login attempt for email: {request.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    logger.info(f"User logged in successfully: {user.id}")
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshRequest, db: AsyncSession = Depends(get_db)):
    payload = decode_token(request.refresh_token)
    
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user_id = payload.get("sub")
    access_token = create_access_token(data={"sub": user_id})
    refresh_token = create_refresh_token(data={"sub": user_id})
    
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        username=current_user.username,
        role=current_user.role
    )


@router.post("/logout")
async def logout():
    return {"message": "Logged out successfully"}
