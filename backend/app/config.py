from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    openai_api_key: str
    database_url: str = "sqlite:///./mental_health.db"
    environment: str = "development"
    app_name: str = "Mental Health AI Assistant"
    app_version: str = "1.0.0"
    faiss_index_path: str = "./app/data/faiss_index"
    documents_path: str = "./app/data/clinical_docs"
    max_tokens: int = 1000
    temperature: float = 0.1
    model_name: str = "gpt-4o"
    embedding_model: str = "text-embedding-3-small"
    top_k_results: int = 5
    crisis_keywords: str = "suicide,self-harm,kill myself,end my life,hurt myself,overdose,not worth living"

    @property
    def crisis_keywords_list(self) -> List[str]:
        return [kw.strip() for kw in self.crisis_keywords.split(",")]

    class Config:
        env_file = ".env"


settings = Settings()
