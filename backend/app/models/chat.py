from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ChatRequest(BaseModel):
    patient_id: str
    message: str
    session_id: Optional[str] = None


class Source(BaseModel):
    document: str
    excerpt: str
    relevance_score: float


class ChatResponse(BaseModel):
    session_id: str
    response: str
    sources: List[Source]
    crisis_detected: bool
    crisis_resources: Optional[List[str]] = None
