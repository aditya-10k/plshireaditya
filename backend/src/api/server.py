"""
FastAPI Dedicated Intelligence Backend Server for Portfolio AI Companion.
Provides endpoints for Agent conversational responses, Neural TTS audio streaming,
project metadata, and health-check keep-alives.
"""

from __future__ import annotations

import asyncio
import logging
import os
import re
import smtplib
import time
from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from typing import Any, Dict, List, Optional

import requests
from fastapi import FastAPI, File, HTTPException, Query, Response, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Ensure environment variables are loaded
load_dotenv()

from src.api.agent_service import PersonaAgentService
from src.api.email_service import send_resume_email_direct, resolve_resume_path, get_resume_manifest
from src.api.tts_service import TTSService
from src.db.database import DatabaseManager

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("persona_api_server")

app = FastAPI(
    title="Aditya Persona Intelligence Engine API",
    description="Dedicated intelligence, forensic persona, and neural voice backend for portfolio.",
    version="1.0.0",
)

# CORS Middleware allowing all frontend origins (Cloudflare Pages, localhost, preview builds)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Shared services
try:
    import sys
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))
    from scripts.sync_user_profile import sync
    sync()
except Exception as e:
    logger.debug("Profile sync notice: %s", e)

db = DatabaseManager()
agent_service = PersonaAgentService(db_manager=db)
tts_service = TTSService()
START_TIME = time.time()


class AgentQueryRequest(BaseModel):
    prompt: str = Field(..., description="User prompt or speech transcript")
    history: Optional[List[Dict[str, str]]] = Field(default=None, description="Optional chat history")


class TTSRequest(BaseModel):
    text: str = Field(..., description="Text to synthesize")


@app.on_event("startup")
async def startup_event():
    logger.info("Intelligence engine ready (instant sub-300ms LLM mode, zero weight loading).")



@app.get("/")
@app.get("/health")
@app.get("/healthz")
@app.get("/api/health")
async def health_check():
    """Health-check endpoint for cron-job keep-alives, Render monitors, and load balancers."""
    return {
        "status": "healthy",
        "service": "persona-agent-api",
        "uptime_seconds": round(time.time() - START_TIME, 2),
        "projects_count": len(db.list_projects()),
    }


@app.get("/api/test-email")
async def test_email(to: str = Query("adityxishere@gmail.com")):
    """Diagnostic endpoint to test and verify live SMTP dispatch."""
    res = send_resume_email_direct(to, role="AI & Agentic Systems")
    return res


@app.get("/api/projects")
async def get_projects():
    """Returns structured project registry."""
    return {"projects": db.list_projects()}


@app.post("/api/agent")
async def query_agent(req: AgentQueryRequest):
    """
    Main conversational endpoint returning AgentResponse protocol 1.0 JSON.
    """
    if not req.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")

    logger.info("Received agent prompt: '%s'", req.prompt[:60])
    response = agent_service.query(req.prompt, history=req.history)
    return response


@app.get("/api/tts")
async def stream_tts(text: str = Query(..., description="Text to synthesize")):
    """
    Synthesize and stream studio-quality neural MP3/WAV audio via GET.
    """
    if not text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    audio_bytes, media_type = await tts_service.synthesize(text)
    if not audio_bytes:
        return Response(status_code=204)

    return Response(
        content=audio_bytes,
        media_type=media_type,
        headers={"Cache-Control": "public, max-age=86400"},
    )


@app.post("/api/tts")
async def post_stream_tts(req: TTSRequest):
    """
    Synthesize and stream full-length studio-quality neural audio via POST without URL length limits.
    """
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    audio_bytes, media_type = await tts_service.synthesize(req.text)
    if not audio_bytes:
        return Response(status_code=204)

    return Response(
        content=audio_bytes,
        media_type=media_type,
        headers={"Cache-Control": "public, max-age=86400"},
    )


@app.post("/api/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """
    Transcribe user speech to text with sub-150ms latency using Groq whisper-large-v3-turbo.
    """
    groq_key = os.getenv("GROQ_API_KEY")
    if not groq_key:
        raise HTTPException(status_code=500, detail="Groq API key not configured.")

    content = await file.read()
    files = {"file": (file.filename or "recording.webm", content, file.content_type or "audio/webm")}
    data = {"model": "whisper-large-v3-turbo"}
    headers = {"Authorization": f"Bearer {groq_key}"}

    try:
        r = requests.post(
            "https://api.groq.com/openai/v1/audio/transcriptions",
            headers=headers,
            data=data,
            files=files,
            timeout=12,
        )
        if r.status_code == 200:
            return r.json()
        logger.warning("Groq whisper error %d: %s", r.status_code, r.text[:200])
        raise HTTPException(status_code=r.status_code, detail="Transcription failed.")
    except Exception as e:
        logger.error("Whisper transcription exception: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/resume/list")
async def list_resumes():
    """
    List all available handpicked role-tailored resumes.
    """
    return {"resumes": get_resume_manifest()}


@app.get("/api/resume/download")
async def download_resume(role: Optional[str] = None, filename: Optional[str] = None):
    """
    Direct resume PDF download endpoint supporting role matching or filename.
    """
    resume_path = resolve_resume_path(role=role, requested_filename=filename)
    if not resume_path or not resume_path.exists():
        raise HTTPException(status_code=404, detail="Resume PDF not yet uploaded by candidate. Please paste PDF in data/resumes/.")

    return FileResponse(
        path=str(resume_path),
        filename=resume_path.name,
        media_type="application/pdf",
    )


class EmailResumeRequest(BaseModel):
    recipient_email: str = Field(..., description="Recipient email address")
    role: Optional[str] = Field(default="Software Engineer", description="Target role")
    resume_filename: Optional[str] = Field(default="Aditya_Kathe_Resume.pdf", description="Resume file to attach")


@app.post("/api/resume/send-email")
async def send_resume_email(req: EmailResumeRequest):
    """
    Automated recruiter resume dispatch using verified Gmail SMTP.
    """
    loop = asyncio.get_event_loop()
    res = await loop.run_in_executor(
        None,
        send_resume_email_direct,
        req.recipient_email,
        req.role,
        req.resume_filename,
    )
    if res.get("status") != "sent":
        raise HTTPException(status_code=500, detail=res.get("message", "Email dispatch error"))
    return res


@app.get("/api/proxy/github")
async def proxy_github():
    """
    Proxies live GitHub profile with asset base rewrite to bypass X-Frame-Options in sidebar iframe.
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    }
    try:
        r = requests.get("https://github.com/aditya-10k", headers=headers, timeout=10)
        html = r.text
        html = re.sub(r"<head[^>]*>", '<head><base href="https://github.com/">', html, count=1, flags=re.I)
        custom_css = """
        <style>
            .Header, header.Header-old, .header-logged-out { display: none !important; }
            body { padding-top: 0 !important; }
        </style>
        """
        html = re.sub(r"</head>", f"{custom_css}</head>", html, count=1, flags=re.I)
        return HTMLResponse(content=html, status_code=200)
    except Exception as e:
        logger.error("GitHub proxy error: %s", e)
        return HTMLResponse(content=f"<html><body><h3>Unable to load GitHub: {e}</h3><p><a href='https://github.com/aditya-10k' target='_blank'>Click here to open GitHub profile directly</a></p></body></html>", status_code=500)


@app.get("/api/proxy/linkedin")
async def proxy_linkedin():
    """
    Renders authentic verified LinkedIn profile card view without anti-scraping block.
    """
    prof = db.get_profile() or {}
    exps = db.get_experiences() or []

    exp_html = ""
    for exp in exps:
        highlights = " &middot; ".join(exp.get("highlights", [])[:2])
        exp_html += f"""
        <div style="border-bottom: 1px solid #e0e0e0; padding: 14px 0;">
            <div style="font-weight: 600; font-size: 15px; color: #191919;">{exp.get('role')}</div>
            <div style="color: #000000e6; font-size: 14px;">{exp.get('company')} &middot; {exp.get('location')}</div>
            <div style="color: #00000099; font-size: 12px; margin-bottom: 6px;">{exp.get('start_date')} - {exp.get('end_date') or 'Present'}</div>
            <div style="font-size: 13px; color: #000000e6;">{highlights}</div>
        </div>
        """

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Aditya Kathe | LinkedIn</title>
        <style>
            body {{ font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif; background: #f3f2ef; margin: 0; padding: 20px; }}
            .card {{ background: #fff; border-radius: 8px; border: 1px solid #e0e0e0; padding: 24px; max-width: 680px; margin: 0 auto; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }}
            .header {{ display: flex; gap: 20px; align-items: center; border-bottom: 1px solid #e0e0e0; padding-bottom: 20px; }}
            .avatar {{ width: 88px; height: 88px; border-radius: 50%; background: #0a66c2; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: bold; }}
            .name {{ font-size: 22px; font-weight: bold; color: #191919; }}
            .headline {{ font-size: 15px; color: #191919; margin-top: 4px; }}
            .sub {{ font-size: 13px; color: #00000099; margin-top: 4px; }}
            .btn {{ display: inline-block; background: #0a66c2; color: #fff; padding: 9px 20px; border-radius: 24px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 14px; }}
            .btn:hover {{ background: #004182; }}
            .section-title {{ font-size: 18px; font-weight: bold; margin-top: 22px; margin-bottom: 8px; color: #191919; }}
        </style>
    </head>
    <body>
        <div class="card">
            <div class="header">
                <div class="avatar">AK</div>
                <div>
                    <div class="name">{prof.get('full_name', 'Aditya Kathe')}</div>
                    <div class="headline">{prof.get('headline', 'Software Engineer & AI Systems Builder')}</div>
                    <div class="sub">Mumbai, Maharashtra, India &middot; D.J. Sanghvi College of Engineering</div>
                    <a href="https://linkedin.com/in/adityakathe" target="_blank" class="btn">Connect on LinkedIn &rarr;</a>
                </div>
            </div>
            <div class="section-title">About</div>
            <div style="font-size: 14px; line-height: 1.6; color: #000000e6;">
                {prof.get('summary', '')}
            </div>
            <div class="section-title" style="margin-top: 24px;">Experience</div>
            {exp_html}
        </div>
    </body>
    </html>
    """
    return HTMLResponse(content=html, status_code=200)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.api.server:app", host="0.0.0.0", port=8000, reload=True)
