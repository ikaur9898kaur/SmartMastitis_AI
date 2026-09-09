from datetime import timedelta, datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.models.all_models import User
from app.schemas.schemas import LoginRequest, TokenResponse, UserProfile

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

import bcrypt

def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    pwd_bytes = plain_password.encode('utf-8')[:72]
    return bcrypt.checkpw(pwd_bytes, hashed_password.encode('utf-8'))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token", auto_error=False)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

@router.post("/login", response_model=TokenResponse)
def login(login_req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.email == login_req.username_or_email) |
        (User.user_id == login_req.username_or_email) |
        (User.mobile == login_req.username_or_email)
    ).first()
    
    # If user not found, support seamless demo fallback by creating or matching specified role
    if not user:
        role_map = {
            "farmer": ("USR_FARMER_01", "Ram Singh (Dairy Farmer)", "farmer@dairy.com"),
            "veterinarian": ("USR_VET_01", "Dr. Ananya Verma, BVSc & AH", "vet@dairy.com"),
            "admin": ("USR_ADMIN_01", "Gurpreet Singh (Farm Director)", "admin@dairy.com"),
            "field_personnel": ("USR_COOP_01", "Vikramjit Sidhu (Cooperative)", "coop@dairy.com")
        }
        role_key = (login_req.role or "farmer").lower()
        if role_key in role_map:
            uid, name, email = role_map[role_key]
            user = db.query(User).filter(User.user_id == uid).first()
            if not user:
                user = User(
                    user_id=uid, email=email, mobile="+919876543210",
                    hashed_password=get_password_hash("demo123"),
                    full_name=name, role=role_key, farm_id="FARM001"
                )
                db.add(user)
                db.commit()
                db.refresh(user)
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials or unknown role"
            )

    access_token = create_access_token(
        data={"sub": user.user_id, "role": user.role, "farm_id": user.farm_id}
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        role=user.role,
        user_id=user.user_id,
        full_name=user.full_name,
        farm_id=user.farm_id
    )

@router.get("/me", response_model=UserProfile)
def get_current_user_profile(user_id: Optional[str] = "USR_FARMER_01", db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        user = db.query(User).first()
    return UserProfile(
        user_id=user.user_id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        farm_id=user.farm_id
    )

@router.get("/roles")
def get_supported_roles():
    return [
        {"id": "farmer", "name": "Farmer", "description": "View herd dashboard, individual animals, risk scores, enter feeding/milking/hygiene records and observations"},
        {"id": "veterinarian", "name": "Veterinarian", "description": "Review high-risk animals, add veterinary examinations, vaccinations, treatments, SCC results, confirm/reject diagnoses"},
        {"id": "admin", "name": "Farm Admin", "description": "Manage farm, animals, users, IoT devices, herd analytics, reports, configure alerts"},
        {"id": "field_personnel", "name": "Field Personnel / Cooperative", "description": "Restricted access for herd monitoring, field observations, risk reports, farm-level analytics"}
    ]
