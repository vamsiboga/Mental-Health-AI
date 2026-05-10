from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PatientCreate(BaseModel):
    patient_id: str
    name: str
    date_of_birth: str
    gender: str
    primary_diagnosis: Optional[str] = None
    visit_reason: Optional[str] = None
    therapist_name: Optional[str] = None
    emergency_contact: Optional[str] = None


class PatientUpdate(BaseModel):
    name: Optional[str] = None
    primary_diagnosis: Optional[str] = None
    visit_reason: Optional[str] = None
    therapist_name: Optional[str] = None
    emergency_contact: Optional[str] = None


class PatientResponse(BaseModel):
    id: int
    patient_id: str
    name: str
    date_of_birth: str
    gender: str
    primary_diagnosis: Optional[str]
    visit_reason: Optional[str]
    therapist_name: Optional[str]
    emergency_contact: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
