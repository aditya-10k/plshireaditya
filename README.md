# pls hire aditya

Live Demo: https://plshireaditya.pages.dev

An autonomous AI persona companion built to represent Aditya Kathe, an Agentic AI and Distributed Systems Software Engineer. Recruiter-first, voice-enabled, and backed by a real-time retrieval engine.

---

## Overview

plshireaditya is an interactive portfolio companion that replaces static PDF browsing with a real-time conversational agent. It accurately mirrors Aditya's technical depth, architectural trade-offs, and communication style.

Key highlights:
- Forensic Persona Engine: Powered by Groq Llama 3.3 70B with grounding in Aditya's real-world engineering experiences
- Multi-Agent and RAG Demos: In-depth breakdowns of distributed systems, pgvector pipelines, and LangGraph multi-agent architectures
- Neural Voice Synthesis: Sub-second audio streaming supporting native English and Hinglish conversational tones
- Automated Resume Delivery: Recruiter says or types their email, and the system extracts, normalizes, and delivers the tailored role resume via SMTP
- Production Monorepo: Cloudflare Pages edge delivery paired with a FastAPI microservice backend

---

## System Architecture

The project is structured as a monorepo containing the presentation layer and the intelligence engine:

### 1. Presentation Layer (Root Directory)
- Hosted on Cloudflare Pages global edge network
- Dynamic avatar engine reacting with contextual facial expressions (neutral, thinking, excited, focused)
- Interactive embedded demo overlays for complex backend architectures
- Responsive fluid background and audio sound triggers

### 2. Dedicated Intelligence Engine (backend/)
- Hosted on Render with Python 3 and FastAPI
- Autonomous agent routing with tool calling for database lookups and UI actions
- Lightweight vector similarity engine using SQLite and NumPy
- Multi-provider neural TTS pipeline (Sarvam AI, Edge-TTS) with local disk caching
- Spoken email parser handling phonetic inputs (e.g. name at gmail dot com) and dispatching role-specific PDFs

---

## Core Technical Competencies (Aditya Kathe)

- Languages: Python, Go, Java
- Distributed Backend: Spring Boot 3, FastAPI, PostgreSQL, pgvector, Redis, RabbitMQ, Docker Compose
- AI Systems: LangGraph, Autonomous RAG, Vector Search, LLM Tool Calling, Neural Speech
- Core Engineering: Low-latency API design, asynchronous workers, microservices architecture

---

## Featured Projects Ground-Truth

1. MatchResume
Spring Boot 3 REST service with PostgreSQL pgvector for candidate-job semantic similarity, Redis score caching, and RabbitMQ workers for asynchronous re-indexing.

2. Stock Research Assistant
Multi-agent financial research system built on LangGraph, coordinating parallel document ingestion, retrieval, and risk synthesis.

3. JackDSQL
Lightweight SQL query engine in Go implementing AST parsing, B-tree indexed storage, and cost-based query evaluation.

4. BatchShare
High-throughput collaborative file distribution system with FastAPI, MinIO S3-compatible storage, and presigned chunk transfers.

5. CricManage
Cricket league management platform with microservices, event streams, and real-time match tracking.

---

## Repository Structure

`
plshireaditya/
├── backend/                  # Dedicated Python intelligence server
│   ├── data/                 # SQLite store, persona profiles, role resumes
│   ├── src/
│   │   ├── api/              # FastAPI endpoints (agent, tts, email, health)
│   │   └── db/               # Database manager and vector search
│   └── requirements.txt      # Production backend dependencies
├── public/                   # Static audio, favicons, and role PDF resumes
├── src/                      # Frontend companion UI and agent client
│   ├── agent/                # Agent protocol client and TTS adapter
│   ├── components/           # Avatar, fluid scenes, chat bar, project modals
│   └── pages/                # Companion chat and overview views
└── package.json              # Frontend workspace manifest
`

---

## Local Development

### Prerequisites
- Node.js 20 or higher
- Python 3.10 or higher

### Frontend Setup
`ash
npm install
npm run dev
`
Runs at http://localhost:5173

### Backend Setup
`ash
cd backend
python -m venv .venv
source .venv/bin/activate  # Or on Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn src.api.server:app --host 0.0.0.0 --port 8000 --reload
`
API runs at http://localhost:8000

---

## Environment Configuration

### Backend (.env in backend directory)
`env
PORT=8000
GROQ_API_KEY=your_groq_api_key
SARVAM_API_KEY=your_sarvam_api_key
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
`

### Frontend (.env in root directory)
`env
NODE_VERSION=20
VITE_API_URL=http://localhost:8000
`

---

## Production Deployment

- Frontend: Cloudflare Pages linked to the main branch of this repository
- Backend: Render Web Service with Root Directory set to backend
- Keep-Alive Monitor: Cron ping to /api/health every 10 minutes to guarantee 24/7 responsiveness
