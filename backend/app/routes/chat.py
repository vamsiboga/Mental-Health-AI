import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.database import crud
from app.models.chat import ChatRequest, ChatResponse
from app.services.rag_pipeline import rag_pipeline

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/", response_model=ChatResponse)
def chat(request: ChatRequest, db: Session = Depends(get_db)):
    patient = crud.get_patient(db, request.patient_id)
    if not patient:
        raise HTTPException(
            status_code=404,
            detail=f"Patient with ID {request.patient_id} not found"
        )

    if request.session_id:
        session = crud.get_chat_session(db, request.session_id)
        if not session:
            raise HTTPException(
                status_code=404,
                detail=f"Session {request.session_id} not found"
            )
    else:
        session = crud.create_chat_session(db, request.patient_id)

    history_records = crud.get_session_messages(db, session.session_id)
    conversation_history = [
        {"role": msg.role, "content": msg.content}
        for msg in history_records
    ]

    patient_context = {
        "patient_id": patient.patient_id,
        "name": patient.name,
        "primary_diagnosis": patient.primary_diagnosis,
        "visit_reason": patient.visit_reason,
        "therapist_name": patient.therapist_name
    }

    result = rag_pipeline.run(
        user_message=request.message,
        patient_context=patient_context,
        conversation_history=conversation_history
    )

    sources_list = [s.model_dump() for s in result.sources]

    crud.save_chat_message(
        db=db,
        session_id=session.session_id,
        role="user",
        content=request.message,
        sources=None,
        crisis_flag=result.crisis_detected
    )
    crud.save_chat_message(
        db=db,
        session_id=session.session_id,
        role="assistant",
        content=result.response,
        sources=sources_list,
        crisis_flag=result.crisis_detected
    )

    result.session_id = session.session_id
    return result


@router.get("/history/{session_id}")
def get_chat_history(session_id: str, db: Session = Depends(get_db)):
    session = crud.get_chat_session(db, session_id)
    if not session:
        raise HTTPException(
            status_code=404,
            detail=f"Session {session_id} not found"
        )
    messages = crud.get_session_messages(db, session_id)
    return [
        {
            "role": msg.role,
            "content": msg.content,
            "sources": json.loads(msg.sources) if msg.sources else [],
            "crisis_flag": msg.crisis_flag,
            "created_at": msg.created_at.isoformat() if msg.created_at else None
        }
        for msg in messages
    ]


@router.get("/sessions/{patient_id}")
def get_patient_sessions(patient_id: str, db: Session = Depends(get_db)):
    patient = crud.get_patient(db, patient_id)
    if not patient:
        raise HTTPException(
            status_code=404,
            detail=f"Patient {patient_id} not found"
        )
    return patient.chat_sessions
