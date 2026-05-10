import sys
import os

os.environ["OPENAI_API_KEY"] = "sk-test-key-for-testing-only"
os.environ["DATABASE_URL"] = "sqlite:///./test.db"
os.environ["FAISS_INDEX_PATH"] = "./test_faiss_index"
os.environ["DOCUMENTS_PATH"] = "./app/data/clinical_docs"
os.environ["CRISIS_KEYWORDS"] = "suicide,self-harm,kill myself,end my life,hurt myself"

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
