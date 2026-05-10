# 🧠 Mental Health AI Assistant

> A production-grade AI-powered clinical decision support system for mental health professionals.

![Python](https://img.shields.io/badge/Python-3.11-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-green)
![React](https://img.shields.io/badge/React-18-61DAFB)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991)
![LangChain](https://img.shields.io/badge/LangChain-0.2.5-yellow)
![License](https://img.shields.io/badge/License-MIT-red)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Local Setup](#local-setup)
- [Docker Setup](#docker-setup)
- [API Documentation](#api-documentation)
- [Running Tests](#running-tests)
- [AWS Deployment](#aws-deployment)
- [Clinical Disclaimer](#clinical-disclaimer)
- [Author](#author)

---

## Overview

The Mental Health AI Assistant is a full-stack, production-ready clinical decision support platform built for mental health professionals. It combines Retrieval-Augmented Generation (RAG) with OpenAI GPT-4o to deliver accurate, document-grounded responses to clinical questions with every answer citing its source.

Clinicians can create patient records, administer PHQ-9 and GAD-7 assessments, chat with an AI assistant that understands the patient's full context, and monitor risk trends over time all in one unified interface.

---

## Features

| Feature | Description |
|---------|-------------|
| 🤖 RAG-Powered AI Chat | Ask clinical questions and get answers grounded in 6 clinical knowledge documents with source citations |
| 📋 PHQ-9 Scoring | Full 9-question depression screen with severity interpretation and automatic Item 9 risk flagging |
| 📋 GAD-7 Scoring | Full 7-question anxiety screen with evidence-based treatment recommendations |
| 🚨 Crisis Detection | Automatic detection of crisis language with immediate 988 Lifeline and Crisis Text Line resources |
| 👤 Patient Management | Create and manage patient records with full clinical context |
| 📊 Risk Dashboard | PHQ-9 score trend charts and complete assessment history per patient |
| 💬 Session History | Full audit trail of all AI interactions stored per patient session |
| 🔒 Source Citations | Every AI response cites the exact clinical document it drew from |

---

## Architecture

```
Patient Intake Form
        │
        ▼
   FastAPI Backend
        │
   ┌────┴────┐
   │         │
Crisis    RAG Pipeline
Detector       │
   │      ┌───┴────┐
   │   FAISS    LangChain
   │   Vector    Orchestration
   │   Search        │
   │      └───┬────┘
   │          │
   │     OpenAI GPT-4o
   │          │
   └────┬─────┘
        │
   Cited Response
        │
        ▼
   React Frontend
   (Chat + Assessments + Dashboard)
```

**RAG Flow:**
1. Clinician asks a question in the chat interface
2. The question is converted to embeddings using OpenAI text-embedding-3-small
3. FAISS searches 6 clinical knowledge documents for the most relevant chunks
4. Retrieved chunks are injected into the GPT-4o prompt as grounding context
5. GPT-4o generates a response based only on retrieved documents
6. Response is returned with source document citations and relevance scores

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Python | 3.11 | Core language |
| FastAPI | 0.111.0 | REST API framework |
| SQLAlchemy | 2.0.30 | Database ORM |
| SQLite | — | Local database (PostgreSQL for production) |
| Pydantic | 2.7.1 | Data validation and serialization |
| LangChain | 0.2.5 | LLM orchestration and RAG pipeline |
| FAISS | 1.8.0 | Vector similarity search |
| OpenAI | 1.35.3 | GPT-4o and embeddings |
| Uvicorn | 0.30.0 | ASGI server |

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18 | UI framework |
| Vite | 5 | Build tool |
| React Router | 6 | Client-side routing |
| Axios | — | HTTP client |
| Recharts | — | Score trend charts |

### DevOps & Cloud
| Technology | Purpose |
|-----------|---------|
| Docker | Containerization |
| Docker Compose | Local full-stack orchestration |
| GitHub Actions | CI/CD pipeline |
| AWS ECS Fargate | Backend container hosting |
| AWS ECR | Docker image registry |
| AWS S3 | Frontend static hosting |
| AWS CloudFront | CDN for frontend |
| AWS Secrets Manager | Secure API key storage |
| AWS CloudWatch | Logging and monitoring |

---

## Project Structure

```
mental-health-ai/
├── backend/
│   ├── app/
│   │   ├── config.py                  # Pydantic settings from .env
│   │   ├── main.py                    # FastAPI app entry point
│   │   ├── database/
│   │   │   ├── db.py                  # SQLAlchemy engine and session
│   │   │   ├── models_db.py           # Patient, Assessment, Chat tables
│   │   │   └── crud.py                # All database operations
│   │   ├── models/
│   │   │   ├── patient.py             # Patient Pydantic schemas
│   │   │   ├── assessment.py          # Assessment Pydantic schemas
│   │   │   └── chat.py                # Chat request/response schemas
│   │   ├── routes/
│   │   │   ├── health.py              # GET /health
│   │   │   ├── patients.py            # CRUD /patients
│   │   │   ├── assessments.py         # PHQ-9 and GAD-7 /assessments
│   │   │   └── chat.py                # RAG chat /chat
│   │   ├── services/
│   │   │   ├── vector_store.py        # FAISS index management
│   │   │   ├── crisis_detector.py     # Crisis keyword detection
│   │   │   ├── llm_service.py         # OpenAI GPT-4o calls
│   │   │   ├── assessment_service.py  # PHQ-9 and GAD-7 scoring logic
│   │   │   └── rag_pipeline.py        # Full RAG orchestration
│   │   └── data/
│   │       └── clinical_docs/         # 6 clinical knowledge documents
│   │           ├── phq9_guide.txt
│   │           ├── gad7_guide.txt
│   │           ├── crisis_intervention.txt
│   │           ├── depression_treatment.txt
│   │           ├── anxiety_treatment.txt
│   │           └── coping_strategies.txt
│   ├── requirements.txt
│   ├── .env.example
│   └── .env                           # Your keys — never committed to git
├── frontend/
│   ├── src/
│   │   ├── App.jsx                    # Router setup
│   │   ├── main.jsx                   # React root
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── PatientIntake.jsx
│   │   │   ├── ChatInterface.jsx
│   │   │   ├── AssessmentForm.jsx
│   │   │   ├── RiskDashboard.jsx
│   │   │   └── SourceCitation.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Patient.jsx
│   │   │   └── Dashboard.jsx
│   │   └── services/
│   │       └── api.js                 # All Axios API calls
│   ├── index.html
│   └── package.json
├── tests/
│   ├── conftest.py                    # Test environment setup
│   ├── test_assessment.py             # 15 PHQ-9 and GAD-7 tests
│   └── test_crisis_detector.py        # 14 crisis detection tests
├── aws-deploy/
│   ├── ecs-task-definition.json       # ECS Fargate task config
│   ├── setup-aws.sh                   # One-command AWS setup
│   ├── deploy-backend.sh              # Build and push to ECR
│   ├── deploy-frontend.sh             # Build and sync to S3
│   ├── setup-cloudfront.sh            # CloudFront distribution
│   ├── github-secrets-needed.md       # Required GitHub secrets list
│   └── aws-console-steps.md           # Step-by-step AWS Console guide
├── .github/
│   └── workflows/
│       └── ci.yml                     # CI + AWS auto-deploy pipeline
├── Dockerfile.backend
├── Dockerfile.frontend
├── docker-compose.yml
├── nginx.conf
├── .gitignore
└── README.md
```

---

## Local Setup

### Prerequisites

- Python 3.11 or higher — [python.org](https://www.python.org/downloads/)
- Node.js 18 or higher — [nodejs.org](https://nodejs.org/)
- Git — [git-scm.com](https://git-scm.com/)
- OpenAI API key — [platform.openai.com](https://platform.openai.com/)

### 1. Clone the repository

```bash
git clone https://github.com/vamsiboga2026/mental-health-ai.git
cd mental-health-ai
```

### 2. Backend setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate — Windows
venv\Scripts\activate

# Activate — Mac/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
```

Open `backend/.env` and replace the placeholder with your real OpenAI API key:

```
OPENAI_API_KEY=sk-your-actual-key-here
```

Start the backend:

```bash
# Windows
venv\Scripts\python -m uvicorn app.main:app --reload --port 8000

# Mac/Linux
uvicorn app.main:app --reload --port 8000
```

The backend is running at `http://localhost:8000`

### 3. Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend is running at `http://localhost:5173`

### 4. Open the app

Go to `http://localhost:5173` in your browser and create your first patient.

---

## Docker Setup

Make sure Docker Desktop is running, then from the project root:

```bash
docker-compose up --build
```

This starts both backend and frontend together.

- Frontend: `http://localhost:80`
- Backend API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

---

## API Documentation

Once the backend is running, open the interactive Swagger docs at:

```
http://localhost:8000/docs
```

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check |
| POST | /patients/ | Create new patient |
| GET | /patients/ | List all patients |
| GET | /patients/{id} | Get patient by ID |
| GET | /assessments/questions/PHQ9 | Get PHQ-9 questions |
| GET | /assessments/questions/GAD7 | Get GAD-7 questions |
| POST | /assessments/score | Score a PHQ-9 or GAD-7 |
| GET | /assessments/{patient_id} | Get patient assessment history |
| POST | /chat/ | Send message to AI assistant |
| GET | /chat/history/{session_id} | Get chat session history |

---

## Running Tests

```bash
cd backend
venv\Scripts\python -m pytest ../tests/ -v
```

Expected output: **29 tests passing**

```
tests/test_assessment.py::test_phq9_minimal_score PASSED
tests/test_assessment.py::test_phq9_mild_score PASSED
tests/test_assessment.py::test_phq9_moderate_score PASSED
tests/test_assessment.py::test_phq9_moderately_severe PASSED
tests/test_assessment.py::test_phq9_severe_score PASSED
tests/test_assessment.py::test_phq9_item9_triggers_risk_flag PASSED
tests/test_assessment.py::test_phq9_item9_risk_urgent_in_recommendations PASSED
tests/test_assessment.py::test_phq9_returns_recommendations PASSED
tests/test_assessment.py::test_gad7_minimal_score PASSED
tests/test_assessment.py::test_gad7_mild_score PASSED
tests/test_assessment.py::test_gad7_moderate_score PASSED
tests/test_assessment.py::test_gad7_severe_score PASSED
tests/test_assessment.py::test_get_phq9_questions PASSED
tests/test_assessment.py::test_get_gad7_questions PASSED
tests/test_assessment.py::test_unknown_assessment_type_returns_empty PASSED
tests/test_crisis_detector.py::test_no_crisis_normal_text PASSED
tests/test_crisis_detector.py::test_no_crisis_general_sadness PASSED
tests/test_crisis_detector.py::test_crisis_keyword_suicide PASSED
tests/test_crisis_detector.py::test_crisis_keyword_self_harm PASSED
tests/test_crisis_detector.py::test_crisis_phrase_end_my_life PASSED
tests/test_crisis_detector.py::test_crisis_phrase_want_to_die PASSED
tests/test_crisis_detector.py::test_crisis_phrase_nothing_to_live_for PASSED
tests/test_crisis_detector.py::test_crisis_case_insensitive PASSED
tests/test_crisis_detector.py::test_crisis_resources_include_988 PASSED
tests/test_crisis_detector.py::test_crisis_resources_include_text_line PASSED
tests/test_crisis_detector.py::test_crisis_resources_include_samhsa PASSED
tests/test_crisis_detector.py::test_crisis_system_prompt_returns_string PASSED
tests/test_crisis_detector.py::test_crisis_system_prompt_contains_988 PASSED
tests/test_crisis_detector.py::test_no_crisis_returns_empty_resources PASSED

29 passed in X.XXs
```

---

## AWS Deployment

### Prerequisites

- AWS account with programmatic access
- AWS CLI installed and configured: `aws configure`
- Docker Desktop running

### Step 1 — Run the setup script

```bash
bash aws-deploy/setup-aws.sh
```

This creates: ECR repositories, S3 bucket, Secrets Manager secret, CloudWatch log group, ECS cluster.

### Step 2 — Create ECS IAM role

Follow the steps in `aws-deploy/aws-console-steps.md`

### Step 3 — Deploy backend

```bash
bash aws-deploy/deploy-backend.sh
```

### Step 4 — Deploy frontend

```bash
bash aws-deploy/deploy-frontend.sh https://your-backend-url
```

### Step 5 — Set up CloudFront

```bash
bash aws-deploy/setup-cloudfront.sh
```

### Step 6 — Add GitHub secrets for auto-deploy

See `aws-deploy/github-secrets-needed.md` for the complete list.

After adding all secrets, every push to `main` automatically:
1. Runs all 29 tests
2. Builds and pushes Docker image to ECR
3. Updates ECS service
4. Deploys frontend to S3
5. Invalidates CloudFront cache

### CI/CD Pipeline Jobs

```
push to main
     │
     ├── Backend Tests (Python pytest — 29 tests)
     ├── Frontend Build (npm ci + npm run build)
     └── Docker Build Check
              │
              └── Deploy to AWS (only if all 3 pass)
                       ├── Push image to ECR
                       ├── Update ECS service
                       ├── Sync frontend to S3
                       └── Invalidate CloudFront
```

---

## Clinical Disclaimer

> ⚠️ This system is a **clinical decision support tool only**.
>
> It is **NOT** a replacement for professional clinical judgment. All AI-generated responses must be reviewed by a licensed mental health professional before any clinical action is taken.
>
> This tool does not store protected health information (PHI) in production without appropriate HIPAA safeguards. Consult your compliance team before deploying with real patient data.

### Crisis Resources

If you or someone you know is in crisis:

- **988 Suicide and Crisis Lifeline** — Call or text **988** (available 24/7)
- **Crisis Text Line** — Text **HOME** to **741741**
- **SAMHSA National Helpline** — **1-800-662-4357** (free, confidential, 24/7)
- **Emergency Services** — Call **911** if there is immediate danger

---

## Project Stats

| Category | Count |
|----------|-------|
| Total files | 56 |
| Lines of code | ~4,275 |
| Backend Python files | 17 |
| Frontend React files | 14 |
| Clinical knowledge documents | 6 |
| Automated tests | 29 |
| API endpoints | 10 |
| Git commits | 4 |

---

## Author

**Vamsi Boga**
GenAI / ML Engineer

- LinkedIn: [linkedin.com/in/vamsi-boga](https://www.linkedin.com/in/vamsi-boga)
- Email: vamsiboga2026@gmail.com
- GitHub: [github.com/vamsiboga2026](https://github.com/vamsiboga2026)

---

## License

MIT License — free to use, modify, and distribute with attribution.

---

*Built as a portfolio project demonstrating production-grade AI engineering with FastAPI, LangChain, RAG, React, and AWS.*
