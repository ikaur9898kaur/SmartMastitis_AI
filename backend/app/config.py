import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "SmartMastitis AI"
    TAGLINE: str = "AI-Based Bovine Mastitis Prediction & Early Warning System"
    VERSION: str = "1.0.0"
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "smartmastitis_super_secure_key_2026_dairy_ai")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./smartmastitis.db")
    
    FARM_ID: str = "FARM001"
    FARM_NAME: str = "Smart Dairy Farm"
    FARM_LOCATION: str = "Punjab, India"
    
    ALLOWED_ORIGINS: str = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"
    )

settings = Settings()
