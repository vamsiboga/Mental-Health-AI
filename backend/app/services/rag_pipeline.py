import logging
from app.services.vector_store import vector_store_service
from app.services.llm_service import llm_service
from app.services.crisis_detector import crisis_detector
from app.models.chat import ChatResponse, Source

logger = logging.getLogger(__name__)


class RAGPipeline:

    def run(
        self,
        user_message: str,
        patient_context: dict,
        conversation_history: list
    ) -> ChatResponse:

        logger.info(f"RAG pipeline running for patient {patient_context.get('patient_id')}")

        is_crisis, crisis_resources = crisis_detector.detect(user_message)

        if is_crisis:
            logger.warning(f"Crisis detected for patient {patient_context.get('patient_id')}")

        retrieved_docs = vector_store_service.search(
            query=user_message,
            k=5
        )

        logger.info(f"Retrieved {len(retrieved_docs)} documents from vector store")

        ai_response = llm_service.generate_response(
            user_message=user_message,
            context_documents=retrieved_docs,
            conversation_history=conversation_history,
            patient_context=patient_context,
            is_crisis=is_crisis
        )

        sources = []
        for doc, score in retrieved_docs:
            relevance = round(1 - float(score), 3)
            if relevance > 0.3:
                sources.append(Source(
                    document=doc.metadata.get("document_name", doc.metadata.get("source", "Clinical Document")),
                    excerpt=doc.page_content[:200] + "..." if len(doc.page_content) > 200 else doc.page_content,
                    relevance_score=relevance
                ))

        return ChatResponse(
            session_id="",
            response=ai_response,
            sources=sources,
            crisis_detected=is_crisis,
            crisis_resources=crisis_resources if is_crisis else None
        )


rag_pipeline = RAGPipeline()
