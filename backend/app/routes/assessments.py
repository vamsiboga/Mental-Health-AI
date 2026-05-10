import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.db import get_db
from app.database import crud
from app.models.assessment import AssessmentCreate, AssessmentResponse, AssessmentResult
from app.services.assessment_service import assessment_service

router = APIRouter(prefix="/assessments", tags=["assessments"])


@router.get("/questions/{assessment_type}")
def get_questions(assessment_type: str):
    questions = assessment_service.get_questions(assessment_type)
    if not questions:
        raise HTTPException(
            status_code=404,
            detail="Assessment type not found. Use PHQ9 or GAD7"
        )
    return {
        "assessment_type": assessment_type.upper(),
        "questions": questions
    }


@router.post("/score", response_model=AssessmentResult)
def score_assessment(data: AssessmentCreate, db: Session = Depends(get_db)):
    patient = crud.get_patient(db, data.patient_id)
    if not patient:
        raise HTTPException(
            status_code=404,
            detail=f"Patient with ID {data.patient_id} not found"
        )

    assessment_type = data.assessment_type.upper()
    if assessment_type == "PHQ9":
        result = assessment_service.score_phq9(data.responses, data.notes)
    elif assessment_type == "GAD7":
        result = assessment_service.score_gad7(data.responses, data.notes)
    else:
        raise HTTPException(
            status_code=400,
            detail="Unknown assessment type. Use PHQ9 or GAD7"
        )

    crud.create_assessment(db, {
        "patient_id": data.patient_id,
        "assessment_type": result.assessment_type,
        "total_score": result.total_score,
        "severity_level": result.severity_level,
        "responses": json.dumps(data.responses),
        "notes": data.notes,
        "risk_flag": result.risk_flag,
        "administered_by": data.administered_by
    })

    return result


@router.get("/{patient_id}", response_model=List[AssessmentResponse])
def get_patient_assessments(patient_id: str, db: Session = Depends(get_db)):
    patient = crud.get_patient(db, patient_id)
    if not patient:
        raise HTTPException(
            status_code=404,
            detail=f"Patient with ID {patient_id} not found"
        )
    return crud.get_assessments_for_patient(db, patient_id)
