import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database.db import create_tables
from app.routes import health, patients, assessments, chat

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-powered Mental Health Assistant for clinical decision support"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:80"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["health"])
app.include_router(patients.router)
app.include_router(assessments.router)
app.include_router(chat.router)


@app.on_event("startup")
async def startup_event():
    logger.info("Starting Mental Health AI Assistant...")
    create_tables()
    logger.info("Database tables created and verified successfully")
    logger.info(f"Environment: {settings.environment}")
    logger.info("Application is ready to receive requests")


@app.get("/")
def root():
    return {
        "message": "Mental Health AI Assistant API",
        "version": settings.app_version,
        "status": "running",
        "docs": "/docs"
    }
