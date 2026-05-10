import json
import uuid
from sqlalchemy.orm import Session
from app.database import models_db


def create_patient(db: Session, patient_data: dict):
    db_patient = models_db.Patient(**patient_data)
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient


def get_patient(db: Session, patient_id: str):
    return db.query(models_db.Patient).filter(
        models_db.Patient.patient_id == patient_id
    ).first()


def get_all_patients(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models_db.Patient).filter(
        models_db.Patient.is_active == True
    ).offset(skip).limit(limit).all()


def update_patient(db: Session, patient_id: str, update_data: dict):
    db_patient = get_patient(db, patient_id)
    if not db_patient:
        return None
    for key, value in update_data.items():
        setattr(db_patient, key, value)
    db.commit()
    db.refresh(db_patient)
    return db_patient


def create_assessment(db: Session, assessment_data: dict):
    db_assessment = models_db.Assessment(**assessment_data)
    db.add(db_assessment)
    db.commit()
    db.refresh(db_assessment)
    return db_assessment


def get_assessments_for_patient(db: Session, patient_id: str):
    return db.query(models_db.Assessment).filter(
        models_db.Assessment.patient_id == patient_id
    ).order_by(models_db.Assessment.created_at.desc()).all()


def get_latest_assessment(db: Session, patient_id: str, assessment_type: str):
    return db.query(models_db.Assessment).filter(
        models_db.Assessment.patient_id == patient_id,
        models_db.Assessment.assessment_type == assessment_type
    ).order_by(models_db.Assessment.created_at.desc()).first()


def create_chat_session(db: Session, patient_id: str):
    session_id = str(uuid.uuid4())
    db_session = models_db.ChatSession(
        session_id=session_id,
        patient_id=patient_id
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session


def get_chat_session(db: Session, session_id: str):
    return db.query(models_db.ChatSession).filter(
        models_db.ChatSession.session_id == session_id
    ).first()


def save_chat_message(db: Session, session_id: str, role: str, content: str,
                       sources: list = None, crisis_flag: bool = False):
    db_message = models_db.ChatMessage(
        session_id=session_id,
        role=role,
        content=content,
        sources=json.dumps(sources) if sources else None,
        crisis_flag=crisis_flag
    )
    db.add(db_message)
    if crisis_flag:
        session = get_chat_session(db, session_id)
        if session:
            session.crisis_detected = True
    db.commit()
    db.refresh(db_message)
    return db_message


def get_session_messages(db: Session, session_id: str):
    return db.query(models_db.ChatMessage).filter(
        models_db.ChatMessage.session_id == session_id
    ).order_by(models_db.ChatMessage.created_at.asc()).all()
