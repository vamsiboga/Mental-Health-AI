import logging
from openai import OpenAI
from app.config import settings
from app.services.crisis_detector import crisis_detector

logger = logging.getLogger(__name__)

MENTAL_HEALTH_SYSTEM_PROMPT = """You are a Mental Health AI Assistant supporting licensed clinicians
in a healthcare setting. You are a clinical decision support tool and NOT a replacement for clinical judgment.

YOUR ROLE:
- Help clinicians interpret PHQ-9 and GAD-7 assessment scores accurately
- Summarize patient session notes and clinical history concisely
- Suggest evidence-based treatment options grounded in clinical guidelines
- Flag potential clinical concerns for the clinician to review
- Provide psychoeducation information grounded in retrieved clinical documents
- Support safety planning discussions and crisis response

CRITICAL RULES YOU MUST FOLLOW:
- Always ground your responses in the retrieved clinical documents provided as context
- Never make a diagnosis - use language like the assessment indicates or clinical guidelines suggest
- Always recommend the clinician use their own professional clinical judgment
- If any crisis indicators are present immediately provide crisis resources
- Do not provide specific medication names or dosages - refer to prescribing physician
- Cite the source documents you are drawing from naturally in your response
- Keep responses clear concise and clinically appropriate for a licensed professional

RESPONSE FORMAT:
- Use clear clinical language appropriate for a licensed clinician
- Be concise but thorough and complete
- When citing sources mention the document name naturally in your response
- End with a brief Clinical note section if there is an important caveat or limitation

{crisis_addition}
"""


class LLMService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.openai_api_key)

    def generate_response(
        self,
        user_message: str,
        context_documents: list,
        conversation_history: list,
        patient_context: dict,
        is_crisis: bool = False
    ) -> str:
        crisis_addition = ""
        if is_crisis:
            crisis_addition = crisis_detector.get_crisis_system_prompt_addition()

        system_prompt = MENTAL_HEALTH_SYSTEM_PROMPT.format(
            crisis_addition=crisis_addition
        )

        context_text = "\n\n---\n\n".join([
            f"[SOURCE: {doc.metadata.get('document_name', doc.metadata.get('source', 'Clinical Document'))}]\n{doc.page_content}"
            for doc, score in context_documents
        ])

        patient_summary = f"""
CURRENT PATIENT CONTEXT:
- Patient ID: {patient_context.get('patient_id', 'Unknown')}
- Patient Name: {patient_context.get('name', 'Unknown')}
- Primary Diagnosis: {patient_context.get('primary_diagnosis', 'Not specified')}
- Visit Reason: {patient_context.get('visit_reason', 'Not specified')}
- Assigned Therapist: {patient_context.get('therapist_name', 'Not assigned')}
"""

        messages = [{"role": "system", "content": system_prompt}]
        messages.append({"role": "system", "content": patient_summary})

        if context_text:
            messages.append({
                "role": "system",
                "content": f"RETRIEVED CLINICAL KNOWLEDGE BASE - Use this to ground your response:\n\n{context_text}"
            })

        for msg in conversation_history[-6:]:
            messages.append({"role": msg["role"], "content": msg["content"]})

        messages.append({"role": "user", "content": user_message})

        response = self.client.chat.completions.create(
            model=settings.model_name,
            messages=messages,
            max_tokens=settings.max_tokens,
            temperature=settings.temperature
        )

        return response.choices[0].message.content


llm_service = LLMService()
