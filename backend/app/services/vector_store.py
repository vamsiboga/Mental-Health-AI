import os
import logging
from typing import List, Tuple
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.config import settings

logger = logging.getLogger(__name__)


class VectorStoreService:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings(
            model=settings.embedding_model,
            openai_api_key=settings.openai_api_key
        )
        self.vector_store = None
        self._load_or_create_index()

    def _load_or_create_index(self):
        index_path = settings.faiss_index_path
        try:
            if os.path.exists(index_path):
                logger.info("Loading existing FAISS index from disk")
                self.vector_store = FAISS.load_local(
                    index_path,
                    self.embeddings,
                    allow_dangerous_deserialization=True
                )
            else:
                logger.info("No FAISS index found. Creating new index from documents.")
                self._create_index_from_documents()
        except Exception as e:
            logger.warning(f"Could not initialize vector store: {e}. RAG will be unavailable until a valid API key is set.")

    def _create_index_from_documents(self):
        docs_path = settings.documents_path
        if not os.path.exists(docs_path):
            logger.warning(f"Documents path {docs_path} does not exist.")
            return

        txt_files = [f for f in os.listdir(docs_path) if f.endswith(".txt")]
        if not txt_files:
            logger.warning("No .txt files found in clinical_docs folder.")
            return

        all_documents = []
        for filename in txt_files:
            filepath = os.path.join(docs_path, filename)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            doc = Document(
                page_content=content,
                metadata={
                    "source": filename,
                    "document_name": filename.replace("_", " ").replace(".txt", "").title()
                }
            )
            all_documents.append(doc)

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,
            chunk_overlap=100,
            separators=["\n\n", "\n", ". ", " "]
        )
        chunks = splitter.split_documents(all_documents)
        logger.info(f"Created {len(chunks)} chunks from {len(all_documents)} documents")

        self.vector_store = FAISS.from_documents(chunks, self.embeddings)
        os.makedirs(settings.faiss_index_path, exist_ok=True)
        self.vector_store.save_local(settings.faiss_index_path)
        logger.info(f"FAISS index saved to {settings.faiss_index_path}")

    def search(self, query: str, k: int = None) -> List[Tuple[Document, float]]:
        if not self.vector_store:
            return []
        k = k or settings.top_k_results
        results = self.vector_store.similarity_search_with_score(query, k=k)
        return results

    def add_document(self, content: str, metadata: dict):
        doc = Document(page_content=content, metadata=metadata)
        splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)
        chunks = splitter.split_documents([doc])
        if self.vector_store:
            self.vector_store.add_documents(chunks)
        else:
            self.vector_store = FAISS.from_documents(chunks, self.embeddings)
        self.vector_store.save_local(settings.faiss_index_path)


vector_store_service = VectorStoreService()
