"""
Email Dispatch Service for Aditya Kathe's Portfolio.
Sends role-tailored resumes with verified attachments via Gmail SMTP.
"""

from __future__ import annotations

import logging
import os
import smtplib
from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
DATA_DIR = PROJECT_ROOT / "data"


RESUME_MAPPINGS = [
    {
        "id": "agentic",
        "title": "AI & Agentic Systems",
        "filename": "AdityaKathe_ResumeA.pdf",
        "keywords": ["agentic", "agent", "ai", "ml", "machine learning", "rag", "langgraph", "llm"],
        "description": "Tailored for AI & Agentic Systems Engineering",
    },
    {
        "id": "core_sde",
        "title": "Core SDE / Backend & Distributed Systems",
        "filename": "001_AdityaKatheB.pdf",
        "keywords": ["backend", "distributed", "core sde", "java", "spring", "microservices", "systems", "database"],
        "description": "Core SDE focused on backend architectures, high-throughput microservices, and distributed systems",
    },
    {
        "id": "pm",
        "title": "Technical Product Manager",
        "filename": "001__AdityaKathe__PM.pdf",
        "keywords": ["pm", "product", "product manager", "tpm", "program manager", "product management"],
        "description": "Tailored for Product Management & Technical PM roles",
    },
    {
        "id": "sde_agentic",
        "title": "Software Engineering (SDE + Agentic)",
        "filename": "AdityaKathe.pdf",
        "keywords": ["sde", "software engineer", "software", "swe", "general", "developer"],
        "description": "SDE focused with agentic AI systems",
    },
]


def get_resume_manifest() -> list[dict]:
    """Returns the list of all available role-tailored resumes."""
    resumes_dir = DATA_DIR / "resumes"
    result = []
    for m in RESUME_MAPPINGS:
        path = resumes_dir / m["filename"]
        if path.exists():
            result.append({
                **m,
                "download_url": f"/resumes/{m['filename']}",
                "exists": True,
            })
    return result


def resolve_resume_path(role: Optional[str] = None, requested_filename: Optional[str] = None) -> Optional[Path]:
    """
    Intelligently select the best matching resume PDF from data/resumes/ based on role or filename.
    Never uses quarantined / backup files (.bak).
    """
    resumes_dir = DATA_DIR / "resumes"
    if not resumes_dir.exists():
        return None

    if requested_filename:
        p = resumes_dir / requested_filename
        if p.exists() and p.is_file() and not p.name.endswith(".bak"):
            return p

    role_lower = (role or "").lower().strip()
    if role_lower:
        # Check specific mappings first
        for m in RESUME_MAPPINGS:
            if any(k in role_lower for k in m["keywords"]):
                p = resumes_dir / m["filename"]
                if p.exists():
                    return p

    # Default fallback: SDE + Agentic (AdityaKathe.pdf) or first available
    default_p = resumes_dir / "AdityaKathe.pdf"
    if default_p.exists():
        return default_p

    candidates = [f for f in resumes_dir.glob("*.pdf") if not f.name.endswith(".bak")]
    return candidates[0] if candidates else None


def send_resume_email_direct(
    recipient_email: str,
    role: Optional[str] = "Software Engineering & AI",
    resume_filename: Optional[str] = None,
) -> dict:
    """
    Send resume PDF attachment directly using Gmail SMTP.
    """
    user = os.getenv("GMAIL_USER", "katheaditya10@gmail.com")
    pwd = os.getenv("GMAIL_APP_PASSWORD")
    if not pwd:
        logger.error("GMAIL_APP_PASSWORD not configured.")
        return {"status": "error", "message": "Gmail credentials not configured."}

    recipient = recipient_email.strip()
    if "@" not in recipient or "." not in recipient:
        logger.error("Invalid recipient email: %s", recipient)
        return {"status": "error", "message": "Invalid email address."}

    role_str = role or "Software Engineering & AI"
    resume_path = resolve_resume_path(role_str, resume_filename)

    msg = MIMEMultipart()
    msg["From"] = f"Aditya Kathe <{user}>"
    msg["To"] = recipient

    template_file = DATA_DIR / "email_template.txt"
    subject = f"Aditya Kathe — Resume ({role_str})"
    body = ""
    if template_file.exists():
        raw_text = template_file.read_text(encoding="utf-8")
        lines = raw_text.splitlines()
        body_lines = []
        for line in lines:
            if line.startswith("Subject:") and not body_lines:
                subject = line.replace("Subject:", "").strip().replace("{role}", role_str)
            else:
                body_lines.append(line.replace("{role}", role_str))
        body = "\n".join(body_lines).strip()
    else:
        body = f"""Hi,

Thank you for chatting with my AI persona! As requested, here is my verified resume tailored for {role_str}.

Core Highlights:
- Distributed Systems & High-Throughput Microservices (Java 21, Spring Boot 3, RabbitMQ, Redis)
- Agentic AI Systems & RAG Pipelines (Python, LangGraph, FastAPI, Vector Embeddings)
- Relational & High-Performance Storage (PostgreSQL, MySQL, Redis, Docker Compose)
- Academic Standing: Final Year B.Tech Computer Engineering at D.J. Sanghvi College of Engineering, Mumbai (CGPA: 8.67)

Feel free to reply directly to this email or connect with me:
- LinkedIn: https://linkedin.com/in/adityakathe
- GitHub: https://github.com/aditya-10k

Best regards,
Aditya Kathe
katheaditya10@gmail.com | +91 9326956422"""

    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    if resume_path and resume_path.exists():
        with open(resume_path, "rb") as f:
            part = MIMEBase("application", "pdf")
            part.set_payload(f.read())
            encoders.encode_base64(part)
            part.add_header("Content-Disposition", f'attachment; filename="{resume_path.name}"')
            msg.attach(part)
    else:
        logger.warning("No valid resume file available to attach (user must paste PDF into data/resumes/)")

    try:
        with smtplib.SMTP("smtp.gmail.com", 587, timeout=12) as server:
            server.starttls()
            server.login(user, pwd)
            server.send_message(msg)
        logger.info("Resume email dispatched to %s for role %s", recipient, role_str)
        return {"status": "sent", "recipient": recipient, "role": role_str}
    except Exception as e:
        logger.error("Failed to send resume email: %s", e)
        return {"status": "error", "message": str(e)}
