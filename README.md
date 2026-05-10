# Mental Health AI Assistant

A production-grade AI-powered clinical decision support system for mental health professionals. Built with FastAPI, LangChain, FAISS, React, and OpenAI GPT-4.

## Overview

This system helps licensed clinicians by providing:
- AI-powered interpretation of PHQ-9 and GAD-7 assessments
- Evidence-based treatment recommendations grounded in clinical documents
- Automatic crisis detection with immediate 988 Lifeline resources
- RAG-powered chat with full source citations
- Complete patient session history and audit trail

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11, FastAPI, SQLAlchemy, SQLite |
| AI / RAG | LangChain, FAISS, OpenAI GPT-4, text-embedding-3-small |
| Frontend | React 18, Vite, React Router, Axios |
| DevOps | Docker, GitHub Actions, AWS ECS, S3, CloudFront |

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Frontend                           │
│           Home · Patient Workspace · Dashboard                  │
│    PatientIntake · ChatInterface · AssessmentForm · RiskDashboard│
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP / Axios
┌────────────────────────▼────────────────────────────────────────┐
│                    FastAPI Backend                               │
│         /patients  /assessments  /chat  /health                 │
└──────┬─────────────────┬──────────────────┬─────────────────────┘
       │                 │                  │
┌──────▼──────┐  ┌───────▼───────┐  ┌──────▼──────┐
│  SQLite DB  │  │  RAG Pipeline │  │   Crisis    │
│  SQLAlchemy │  │  LangChain +  │  │  Detector   │
│  4 tables   │  │  FAISS index  │  │  Keywords + │
└─────────────┘  │  OpenAI GPT-4 │  │  Phrases    │
                 └───────┬───────┘  └─────────────┘
                         │
                 ┌───────▼───────┐
                 │ Clinical Docs │
                 │ PHQ-9 · GAD-7 │
                 │ Crisis · CBT  │
                 │ Coping · Tx   │
                 └───────────────┘
```

## Project Structure

```
mental-health-ai/
├── backend/
│   ├── app/
│   │   ├── config.py              # Pydantic settings from .env
│   │   ├── main.py                # FastAPI app, CORS, startup
│   │   ├── database/
│   │   │   ├── db.py              # SQLAlchemy engine and session
│   │   │   ├── models_db.py       # Patient, Assessment, ChatSession, ChatMessage
│   │   │   └── crud.py            # Database operations
│   │   ├── models/
│   │   │   ├── patient.py         # Pydantic request/response models
│   │   │   ├── assessment.py      # Assessment models
│   │   │   └── chat.py            # Chat request/response models
│   │   ├── routes/
│   │   │   ├── health.py          # GET /health
│   │   │   ├── patients.py        # CRUD /patients
│   │   │   ├── assessments.py     # PHQ-9 / GAD-7 scoring
│   │   │   └── chat.py            # RAG chat endpoint
│   │   ├── services/
│   │   │   ├── vector_store.py    # FAISS index creation and search
│   │   │   ├── llm_service.py     # OpenAI GPT-4 with system prompt
│   │   │   ├── assessment_service.py  # Scoring logic and recommendations
│   │   │   ├── crisis_detector.py # Keyword and phrase crisis detection
│   │   │   └── rag_pipeline.py    # Orchestrates the full RAG flow
│   │   └── data/
│   │       └── clinical_docs/     # 6 clinical reference documents
│   ├── .env                       # API keys (never commit)
│   ├── .env.example               # Safe template for teammates
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx                # Router with 3 routes
│   │   ├── components/
│   │   │   ├── Navbar.jsx         # Sticky nav with active link detection
│   │   │   ├── PatientIntake.jsx  # New patient registration form
│   │   │   ├── ChatInterface.jsx  # RAG chat with typing indicator
│   │   │   ├── AssessmentForm.jsx # PHQ-9 / GAD-7 scoring UI
│   │   │   ├── RiskDashboard.jsx  # Assessment history and trend bars
│   │   │   └── SourceCitation.jsx # Expandable citation chips
│   │   ├── pages/
│   │   │   ├── Home.jsx           # New / returning patient split layout
│   │   │   ├── Patient.jsx        # 3-tab patient workspace
│   │   │   └── Dashboard.jsx      # Patient list with stat cards
│   │   └── services/
│   │       └── api.js             # Axios client for all backend calls
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── tests/
│   ├── conftest.py                # Shared env setup and sys.path
│   ├── test_assessment.py         # 15 PHQ-9 and GAD-7 scoring tests
│   └── test_crisis_detector.py    # 14 crisis detection tests
├── Dockerfile.backend
├── Dockerfile.frontend
├── docker-compose.yml
├── nginx.conf
├── .dockerignore
└── .gitignore
```

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- An OpenAI API key (GPT-4 access required)

### 1. Clone and configure environment

```bash
git clone https://github.com/yourusername/mental-health-ai.git
cd mental-health-ai
cp backend/.env.example backend/.env
# Edit backend/.env and add your OpenAI API key
```

### 2. Start the backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Backend runs at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

### 4. Run with Docker (production)

```bash
# Add your OpenAI API key to backend/.env first
docker-compose up --build
```

- Frontend: `http://localhost:80`
- Backend: `http://localhost:8000`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/` | API status |
| POST | `/patients/` | Register new patient |
| GET | `/patients/` | List all patients |
| GET | `/patients/{id}` | Get patient by ID |
| PUT | `/patients/{id}` | Update patient record |
| GET | `/assessments/questions/{type}` | Get PHQ9 or GAD7 questions |
| POST | `/assessments/score` | Score assessment and save result |
| GET | `/assessments/{patient_id}` | Get assessment history |
| POST | `/chat/` | Send message to RAG pipeline |
| GET | `/chat/history/{session_id}` | Get session message history |

## Key Features

### RAG Pipeline
Clinical documents are chunked, embedded with `text-embedding-3-small`, and stored in a FAISS vector index. Each chat message retrieves the top 5 most relevant chunks which are injected into the GPT-4 system prompt. Source citations are returned with each response so clinicians can verify the grounding.

### PHQ-9 Scoring
Full 9-item scoring with severity classification across 5 bands (Minimal / Mild / Moderate / Moderately Severe / Severe). Item 9 (suicidal ideation) automatically sets a risk flag and prepends an URGENT recommendation to conduct a full C-SSRS assessment.

### GAD-7 Scoring
Full 7-item scoring with severity classification across 4 bands. Scores ≥ 15 trigger a risk flag for immediate specialist referral.

### Crisis Detection
Two-layer detection system:
1. **Config-driven keywords** from `.env` (editable per deployment)
2. **Extended phrases** hardcoded in `crisis_detector.py` (16 phrases including gerund and infinitive forms)

When triggered, the full 988 Lifeline, Crisis Text Line, SAMHSA helpline, and emergency services are returned immediately with every response.

### Clinical Document Knowledge Base

| Document | Content |
|----------|---------|
| `phq9_guide.txt` | PHQ-9 scoring, interpretation, follow-up timing, escalation triggers |
| `gad7_guide.txt` | GAD-7 scoring, CBT approaches, medication considerations |
| `crisis_intervention.txt` | C-SSRS protocol, risk stratification, safety planning |
| `depression_treatment.txt` | CBT, IPT, behavioral activation, pharmacotherapy guidelines |
| `anxiety_treatment.txt` | Exposure therapy, MBSR, MBCT, ACT, panic disorder protocols |
| `coping_strategies.txt` | 5-4-3-2-1 grounding, box breathing, PMR, thought records |

## Running Tests

```bash
cd backend
venv\Scripts\python -m pytest ../tests/ -v
```

Expected output: **29 passed** in under 1 second.

Tests cover:
- All PHQ-9 severity bands (0–27 score range)
- PHQ-9 Item 9 risk flag and URGENT recommendation injection
- All GAD-7 severity bands
- Crisis keyword detection (case-insensitive)
- Crisis phrase detection including gerund forms
- Resource list contents (988, 741741, SAMHSA)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key (required) | — |
| `DATABASE_URL` | SQLAlchemy DB URL | `sqlite:///./mental_health.db` |
| `MODEL_NAME` | OpenAI chat model | `gpt-4o` |
| `EMBEDDING_MODEL` | OpenAI embedding model | `text-embedding-3-small` |
| `MAX_TOKENS` | Max response tokens | `1000` |
| `TEMPERATURE` | LLM temperature | `0.1` |
| `TOP_K_RESULTS` | FAISS results per query | `5` |
| `CRISIS_KEYWORDS` | Comma-separated crisis keywords | see `.env.example` |
| `FAISS_INDEX_PATH` | Path to persist FAISS index | `./app/data/faiss_index` |
| `DOCUMENTS_PATH` | Path to clinical docs folder | `./app/data/clinical_docs` |

## Local Setup

### Prerequisites
- Python 3.11 or higher
- Node.js 18 or higher
- OpenAI API key from platform.openai.com

### Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\python -m pip install -r requirements.txt

# Mac/Linux
source venv/bin/activate && pip install -r requirements.txt

# Add your OpenAI key to backend/.env
cp .env.example .env

# Start the backend
venv\Scripts\python -m uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

### Docker (Full Stack)

```bash
docker-compose up --build
```

Open http://localhost:80 in your browser.

## API Documentation

Once the backend is running, open http://localhost:8000/docs for the full interactive Swagger API documentation.

## Features

- **Patient Management** — Create and manage patient records with full clinical context
- **PHQ-9 Scoring** — Complete 9-question depression screening with clinical interpretation and risk flagging
- **GAD-7 Scoring** — Complete 7-question anxiety screening with treatment recommendations
- **Crisis Detection** — Automatic detection of crisis language with immediate resource delivery including 988 Lifeline
- **RAG Chat** — Ask clinical questions and get answers grounded in 6 clinical knowledge documents with source citations
- **Risk Dashboard** — Visual PHQ-9 trend charts and assessment history per patient
- **Session History** — Complete audit trail of all AI interactions per patient

## Clinical Disclaimer

This system is a clinical decision support tool only. It is NOT a replacement for professional clinical judgment. All AI responses should be reviewed by a licensed mental health professional before clinical action is taken.

Crisis resources are always available: Call or text 988 for the Suicide and Crisis Lifeline.

## License

MIT License — See LICENSE file for details.
