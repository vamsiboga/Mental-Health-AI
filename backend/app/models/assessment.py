from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime


class AssessmentCreate(BaseModel):
    patient_id: str
    assessment_type: str
    responses: Dict[str, int]
    notes: Optional[str] = None
    administered_by: Optional[str] = None


class AssessmentResponse(BaseModel):
    id: int
    patient_id: str
    assessment_type: str
    total_score: int
    severity_level: str
    responses: str
    notes: Optional[str]
    risk_flag: bool
    administered_by: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class AssessmentResult(BaseModel):
    assessment_type: str
    total_score: int
    severity_level: str
    risk_flag: bool
    interpretation: str
    recommendations: List[str]
