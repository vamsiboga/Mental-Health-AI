from fastapi import APIRouter
from datetime import datetime

router = APIRouter()


@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Mental Health AI Assistant",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }
