"""
Email Dispatch Service for Aditya Kathe's Portfolio.
Sends role-tailored resumes with verified attachments via Gmail SMTP.
"""

from __future__ import annotations

import base64
import logging
import os
import smtplib
import socket
import ssl
from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from typing import Optional

import requests
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
DATA_DIR = PROJECT_ROOT / "data"


class IPv4SMTP(smtplib.SMTP):
    """SMTP client that forces IPv4 connections, preventing cloud host IPv6 unreachable errors."""
    def _get_socket(self, host, port, timeout):
        for res in socket.getaddrinfo(host, port, socket.AF_INET, socket.SOCK_STREAM):
            af, socktype, proto, canonname, sa = res
            try:
                s = socket.socket(af, socktype, proto)
                s.settimeout(timeout)
                s.connect(sa)
                return s
            except OSError:
                if s:
                    s.close()
        raise OSError("No IPv4 route to host")


class IPv4SMTP_SSL(smtplib.SMTP_SSL):
    """SMTP_SSL client that forces IPv4 connections."""
    def _get_socket(self, host, port, timeout):
        for res in socket.getaddrinfo(host, port, socket.AF_INET, socket.SOCK_STREAM):
            af, socktype, proto, canonname, sa = res
            try:
                s = socket.socket(af, socktype, proto)
                s.settimeout(timeout)
                s.connect(sa)
                return self.context.wrap_socket(s, server_hostname=host)
            except OSError:
                if s:
                    s.close()
        raise OSError("No IPv4 route to host")


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

    # Check for HTTPS relay providers (Port 443 - never blocked by cloud firewalls)
    webhook_url = os.getenv("GMAIL_WEBHOOK_URL")
    brevo_key = os.getenv("BREVO_API_KEY")
    resend_key = os.getenv("RESEND_API_KEY")

    pdf_base64 = ""
    pdf_filename = "AdityaKathe_Resume.pdf"
    if resume_path and resume_path.exists():
        pdf_filename = resume_path.name
        pdf_base64 = base64.b64encode(resume_path.read_bytes()).decode("utf-8")

    # 1. Google Apps Script Webhook (Native Gmail relay over HTTPS port 443)
    if webhook_url:
        try:
            resp = requests.post(
                webhook_url,
                json={
                    "to": recipient,
                    "subject": subject,
                    "body": body,
                    "filename": pdf_filename,
                    "pdf_base64": pdf_base64,
                },
                timeout=25,
                allow_redirects=True,
            )
            logger.info("Google Apps Script HTTP webhook response status: %s", resp.status_code)
            if resp.status_code in (200, 201):
                return {"status": "sent", "recipient": recipient, "role": role_str, "provider": "gmail_webhook"}
            else:
                logger.warning("Google Apps Script returned %s: %s", resp.status_code, resp.text[:300])
                last_error = f"Google Apps Script returned {resp.status_code}: {resp.text[:200]}"
        except Exception as ew:
            logger.error("Failed to send via GMAIL_WEBHOOK_URL: %s", ew)
            last_error = str(ew)

    # 2. Brevo HTTPS REST API (Port 443)
    if brevo_key:
        try:
            resp = requests.post(
                "https://api.brevo.com/v3/smtp/email",
                headers={"api-key": brevo_key, "Content-Type": "application/json"},
                json={
                    "sender": {"name": "Aditya Kathe", "email": user or "katheaditya10@gmail.com"},
                    "to": [{"email": recipient}],
                    "subject": subject,
                    "textContent": body,
                    "attachment": [{"name": pdf_filename, "content": pdf_base64}] if pdf_base64 else [],
                },
                timeout=15,
            )
            if resp.status_code in (200, 201, 202):
                logger.info("Dispatched resume email via Brevo HTTPS API to %s", recipient)
                return {"status": "sent", "recipient": recipient, "role": role_str, "provider": "brevo"}
            else:
                logger.warning("Brevo API returned error %s: %s", resp.status_code, resp.text)
        except Exception as eb:
            logger.error("Failed to send via Brevo API: %s", eb)

    # 3. Resend HTTPS REST API (Port 443)
    if resend_key:
        try:
            resp = requests.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {resend_key}", "Content-Type": "application/json"},
                json={
                    "from": "Aditya Kathe <onboarding@resend.dev>",
                    "to": [recipient],
                    "subject": subject,
                    "text": body,
                    "attachments": [{"filename": pdf_filename, "content": pdf_base64}] if pdf_base64 else [],
                },
                timeout=15,
            )
            if resp.status_code in (200, 201, 202):
                logger.info("Dispatched resume email via Resend HTTPS API to %s", recipient)
                return {"status": "sent", "recipient": recipient, "role": role_str, "provider": "resend"}
        except Exception as er:
            logger.error("Failed to send via Resend API: %s", er)

    # 4. Fallback to direct SMTP (works on localhost or environments without outbound port restrictions)
    sent_successfully = False
    last_error = None

    # Attempt 1: Port 587 STARTTLS with forced IPv4
    try:
        with IPv4SMTP("smtp.gmail.com", 587, timeout=12) as server:
            server.starttls()
            server.login(user, pwd)
            server.send_message(msg)
        sent_successfully = True
        logger.info("Resume email dispatched to %s for role %s via port 587", recipient, role_str)
    except Exception as e587:
        last_error = e587
        logger.warning("Port 587 failed (%s), attempting SSL port 465 fallback...", e587)
        # Attempt 2: Port 465 Direct SSL with forced IPv4
        try:
            with IPv4SMTP_SSL("smtp.gmail.com", 465, timeout=12) as server:
                server.login(user, pwd)
                server.send_message(msg)
            sent_successfully = True
            logger.info("Resume email dispatched to %s for role %s via port 465 SSL", recipient, role_str)
        except Exception as e465:
            last_error = e465
            logger.error("Both port 587 and port 465 failed: %s", e465)

    if sent_successfully:
        return {"status": "sent", "recipient": recipient, "role": role_str}
    else:
        return {"status": "error", "message": str(last_error)}
