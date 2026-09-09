import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.seed.seed_data import seed_database
from app.routers import (
    auth, dashboard, animals, iot, health, records,
    prediction, alerts, gis, reports, dataset, ml_admin, capa
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure database schema is initialized and seeded
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield
    # Shutdown

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Integrated AI + ML + IoT bovine mastitis predictive forecasting platform for dairy cattle and buffaloes.",
    version=settings.VERSION,
    lifespan=lifespan
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(animals.router)
app.include_router(iot.router)
app.include_router(health.router)
app.include_router(records.router)
app.include_router(prediction.router)
app.include_router(alerts.router)
app.include_router(gis.router)
app.include_router(reports.router)
app.include_router(dataset.router)
app.include_router(ml_admin.router)
app.include_router(capa.router)

@app.get("/")
def root():
    return {
        "name": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "version": settings.VERSION,
        "status": "operational",
        "documentation": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
