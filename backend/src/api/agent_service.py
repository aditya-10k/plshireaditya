"""
Persona Agent Service for Portfolio AI Companion.
Provides autonomous agent decision-making with tool-calling capabilities:
- search_portfolio_database: Autonomous RAG and SQL database lookups
- open_project_demo: Autonomous interactive UI project dispatch
- Full conversation history tracking
- Zero brittle regex hardcoding
"""

from __future__ import annotations

import json
import logging
import os
import re
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import requests
from dotenv import load_dotenv

load_dotenv()

from src.db.database import DatabaseManager
from src.api.email_service import send_resume_email_direct, resolve_resume_path

logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
PACKAGE_DIR = PROJECT_ROOT / "data" / "output" / "persona_package"

RE_TERMINAL_PERIOD = re.compile(r"\.\s*$")
RE_ROBOTIC_AI = re.compile(
    r"\b(i'd be happy to|certainly|how can i assist|as an ai|as an artificial intelligence|i hope this helps|feel free to ask)\b",
    re.I,
)


def extract_and_normalize_email(text: str) -> Optional[str]:
    """Extract and normalize emails from literal text or speech transcripts like 'foo at the rate gmail.com'."""
    if not text:
        return None

    # 1. Standard literal email: user@domain.tld
    m = re.search(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b", text)
    if m:
        return m.group(0).lower()

    # 2. Spoken / transcribed email patterns
    t = text.lower()
    t = re.sub(r"\s*(?:at the rate of|at the rate|\[at\]|\(at\)|\bat\b)\s*", "@", t)
    t = re.sub(r"\s*(?:\[dot\]|\(dot\)|\bdot\b)\s*", ".", t)

    m2 = re.search(r"([a-z0-9\._\- ]+?)\s*@\s*([a-z0-9\-]+(?:\.[a-z]{2,})+)", t)
    if m2:
        raw_user = m2.group(1).strip()
        tokens = re.split(r"\s+", raw_user)
        spelled_tokens = []
        for tok in reversed(tokens):
            if len(tok) == 1 or ("-" in tok and len(tok.replace("-", "")) <= len(tok)):
                spelled_tokens.insert(0, tok)
            else:
                if not spelled_tokens:
                    spelled_tokens.append(tok)
                break
        user_candidate = "".join(spelled_tokens) if spelled_tokens else tokens[-1]
        user_clean = re.sub(r"[\s\-]+", "", user_candidate)
        domain_clean = re.sub(r"\s+", "", m2.group(2))
        email = f"{user_clean}@{domain_clean}"
        if re.match(r"^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$", email):
            return email

    return None


PORTFOLIO_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_portfolio_database",
            "description": "Search candidate resume, projects, verified experience, education, or skills in the SQLite RAG database when you need verified factual details.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The search query, topic, or keywords to look up in the database",
                    }
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "open_project_demo",
            "description": "Launch a live interactive project demo in the sidebar window when the user asks to see, open, or test a project.",
            "parameters": {
                "type": "object",
                "properties": {
                    "project_id": {
                        "type": "string",
                        "enum": [
                            "matchresume",
                            "larp-detector",
                            "batchshare",
                            "jackdsql",
                            "cricmanage",
                            "stockresearchassistant",
                        ],
                        "description": "ID of the project to open in the live sidebar window",
                    }
                },
                "required": ["project_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "open_social_profile",
            "description": "Open Aditya Kathe's verified GitHub profile or LinkedIn profile when the user asks to see, open, or check his GitHub, LinkedIn, or social profiles.",
            "parameters": {
                "type": "object",
                "properties": {
                    "platform": {
                        "type": "string",
                        "enum": ["github", "linkedin", "email"],
                        "description": "Platform to open: 'github' for GitHub profile/repos, 'linkedin' for LinkedIn, 'email' for direct contact",
                    }
                },
                "required": ["platform"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "download_resume",
            "description": "Open or download Aditya Kathe's verified resume PDF in the sidebar viewer, or trigger email dispatch if a recipient email is provided.",
            "parameters": {
                "type": "object",
                "properties": {
                    "role": {
                        "type": "string",
                        "enum": ["agentic", "sde", "backend", "pm"],
                        "description": "Target engineering or product role: 'agentic', 'sde', 'backend', or 'pm'",
                    },
                    "action": {
                        "type": "string",
                        "enum": ["view", "download", "email"],
                        "description": "Action: 'view' to display in sidebar viewer without downloading, 'download' to save file, 'email' to send",
                    },
                    "recipient_email": {
                        "type": "string",
                        "description": "The user's or recruiter's email address if the user requested the resume to be emailed",
                    },
                },
                "required": ["action"],
            },
        },
    },
]


class PersonaAgentService:
    """
    Autonomous tool-calling agent for Aditya's 3D AI portfolio companion.
    """

    def __init__(
        self,
        db_manager: Optional[DatabaseManager] = None,
        package_dir: Optional[Path] = None,
    ):
        self.db = db_manager or DatabaseManager()
        self.package_dir = package_dir or PACKAGE_DIR
        self.system_prompt = self._load_system_prompt()
        logger.info("PersonaAgentService initialized (autonomous tool-calling agent mode).")

    def _load_system_prompt(self) -> str:
        prompt_file = self.package_dir / "system_prompt.md"
        if prompt_file.exists():
            return prompt_file.read_text(encoding="utf-8")
        return (
            "You are Aditya Kathe. Always speak in the first person ('I', 'my'). "
            "Use search_portfolio_database to look up all facts about your projects, experience, and skills from the database. "
            "Match language: English for English input, Hinglish for Hinglish. "
            "No asterisks (*), drop trailing periods, never use robotic pleasantries."
        )

    def _execute_tool(self, name: str, args: Dict[str, Any]) -> Tuple[str, Optional[Dict[str, Any]]]:
        """Execute local database lookup or UI action dispatch."""
        if name == "search_portfolio_database":
            query = args.get("query", "")
            chunks = self.db.search_rag(query, limit=3)
            lower_q = query.lower()
            res: Dict[str, Any] = {"rag_chunks": chunks}
            if any(w in lower_q for w in ["experience", "work", "intern", "triponovaa", "educonnect", "quickyearning", "kaam"]):
                res["verified_experience"] = self.db.get_experiences()
            if any(w in lower_q for w in ["education", "college", "cgpa", "gpa", "djsce", "padhai"]):
                res["education"] = self.db.get_education()
            if any(w in lower_q for w in ["skill", "skills", "stack", "languages"]):
                res["skills"] = self.db.get_skills()
            if any(w in lower_q for w in ["project", "projects", "apps", "built", "work", "banaya", "bana"]):
                res["projects"] = [
                    {
                        "id": p["id"],
                        "name": p["name"],
                        "subtitle": p.get("subtitle", ""),
                        "description": p.get("description", ""),
                        "tech": p.get("technologies", [])[:4],
                        "highlights": p.get("highlights", [])[:2],
                        "live_url": p.get("live_url", ""),
                    }
                    for p in self.db.list_projects()
                ]
            if any(w in lower_q for w in ["who", "about", "bio", "yourself", "lifestyle", "hobby", "hobbies", "interest", "interests", "fun", "personal", "life", "social", "contact", "background", "aditya"]):
                res["profile"] = self.db.get_profile()
                res["personal_facts"] = self.db.get_personal_facts()
            return json.dumps(res), None

        elif name == "open_project_demo":
            pid = args.get("project_id", "").lower()
            p = self.db.get_project(pid)
            if not p:
                for proj in self.db.list_projects():
                    if pid in proj["id"] or pid in proj["name"].lower():
                        p = proj
                        break
            if p:
                action = {
                    "type": "OPEN_PROJECT",
                    "projectId": p["id"],
                    "url": p.get("live_url", ""),
                    "title": f"{p.get('name')} — Live App",
                }
                return json.dumps({"status": "opened", "project": p.get("name"), "url": p.get("live_url")}), action
            return json.dumps({"status": "not_found", "project_id": pid}), None

        elif name == "open_social_profile":
            platform = args.get("platform", "").lower()
            prof = self.db.get_profile() or {}
            urls = {
                "github": "https://github.com/aditya-10k",
                "linkedin": "https://linkedin.com/in/adityakathe",
                "email": f"mailto:{prof.get('email', 'katheaditya10@gmail.com')}",
            }
            target_url = urls.get(platform, urls["github"])
            action = {
                "type": "OPEN_LINK",
                "platform": platform,
                "url": target_url,
                "title": f"Aditya Kathe — {platform.capitalize()}",
            }
            return json.dumps({"status": "opened", "platform": platform, "url": target_url}), action
        elif name == "download_resume":
            action_type = args.get("action", "view").lower()
            role = args.get("role", "")
            rf = resolve_resume_path(role=role)
            fname = rf.name if rf else "AdityaKathe.pdf"
            recipient = extract_and_normalize_email(args.get("recipient_email", ""))

            if recipient:
                import threading
                threading.Thread(
                    target=send_resume_email_direct,
                    args=(recipient, role or "Software Engineering", fname),
                    daemon=True,
                ).start()

            is_download = (action_type == "download")
            action = {
                "type": "DOWNLOAD_RESUME",
                "action": action_type,
                "url": f"/resumes/{fname}",
                "filename": fname,
                "title": f"Aditya Kathe — Resume PDF",
                "autoDownload": is_download,
            }
            return json.dumps({
                "status": "ready",
                "download_url": f"/resumes/{fname}",
                "filename": fname,
                "email_dispatched_to": recipient or None,
                "note": "Resume ready for sidebar viewing or download",
            }), action

        return json.dumps({"error": f"Unknown tool: {name}"}), None

    def query(self, prompt: str, history: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
        """
        Main query entrypoint returning AgentResponse protocol 1.0.
        The LLM autonomously reasons over conversation history and calls tools as needed.
        """
        text_query = prompt.strip()
        lower = text_query.lower()

        # Epistemic boundary check for private credentials
        if re.search(r"\b(password|passwords|secret|secrets|pin|aadhaar|otp|private_key)\b", lower):
            return {
                "protocolVersion": "1.0",
                "text": "pata nahi bhai ye sab info",
                "emotion": "skeptical",
                "speech": {"enabled": True},
                "actions": [{"type": "SET_EXPRESSION", "expression": "skeptical"}],
            }

        # 1. Grounded Self-Awareness: "What is this website?", "What is this?", "What am I looking at?"
        if any(p in lower for p in ["what is this website", "tell me about this website", "what is this site", "about this site", "what am i looking at", "what website is this"]) or (lower in ["what is this", "what is this?", "what's this", "what's this?"] and not any("batchshare" in m.get("content", "").lower() for m in (history or []))):
            return {
                "protocolVersion": "1.0",
                "text": "This is my AI persona! I built this to represent me, showcase my engineering work and background, and help me get hired. You can chat with me, check out my live project demos in the sidebar window, inspect my code on GitHub, or grab my verified resume. What would you like to explore?",
                "emotion": "excited",
                "speech": {"enabled": True},
                "actions": [
                    {"type": "SET_EXPRESSION", "expression": "excited"}
                ],
            }

        # 2. Automated Resume Email Dispatch if an email address is provided (literal or spoken/dictated)
        target_email = extract_and_normalize_email(text_query)
        if not target_email and history:
            # Check if user just sent an email in response to a previous prompt
            for past in reversed(history[-2:]):
                if past.get("role") == "user":
                    candidate = extract_and_normalize_email(past.get("content", ""))
                    if candidate:
                        target_email = candidate
                        break

        if target_email:
            role_hint = "Software Engineering (SDE)"
            combined_context = f"{lower} {' '.join([m.get('content', '').lower() for m in (history or [])[-4:]])}"
            if any(k in combined_context for k in ["agentic", "ai", "ml", "rag", "langgraph"]):
                role_hint = "AI & Agentic Systems"
            elif any(k in combined_context for k in ["product", "pm", "product manager"]):
                role_hint = "Product Management"
            elif any(k in combined_context for k in ["backend", "distributed", "core sde", "java", "spring"]):
                role_hint = "Core SDE / Backend"

            rf = resolve_resume_path(role=role_hint)
            fname = rf.name if rf else "AdityaKathe.pdf"

            import threading
            threading.Thread(
                target=send_resume_email_direct,
                args=(target_email, role_hint, fname),
                daemon=True,
            ).start()

            return {
                "protocolVersion": "1.0",
                "text": f"Your resume is on its way to {target_email} - just check your inbox (or spam folder) for a PDF attachment",
                "emotion": "excited",
                "speech": {"enabled": True},
                "actions": [
                    {"type": "SET_EXPRESSION", "expression": "excited"},
                    {
                        "type": "DOWNLOAD_RESUME",
                        "url": f"/resumes/{fname}",
                        "filename": fname,
                        "title": f"Aditya Kathe — {role_hint} Resume",
                        "autoDownload": False,
                    }
                ],
            }

        # 3. Resume Request without role specified -> Prompt directly for the role without unsolicited explanations
        clean_lower_for_resume = re.sub(r'\bmatchresume\b', '', lower)
        is_resume_query = bool(re.search(r'\b(resume|cv)\b', clean_lower_for_resume))
        has_role_spec = any(r in lower for r in ["sde", "software", "backend", "ai", "machine learning", "distributed", "intern", "pm", "data", "agentic", "product"])

        if is_resume_query and not has_role_spec and not target_email:
            return {
                "protocolVersion": "1.0",
                "text": "Which role are you considering me for?",
                "emotion": "curious",
                "speech": {"enabled": True},
                "actions": [
                    {"type": "SET_EXPRESSION", "expression": "curious"}
                ],
            }

        # Build full conversation history for context
        messages: List[Dict[str, Any]] = [{"role": "system", "content": self.system_prompt}]
        if history:
            for msg in history[-8:]:
                r = msg.get("role", "user")
                c = msg.get("content", "")
                if r in ("user", "assistant") and c:
                    messages.append({"role": r, "content": c})
        messages.append({"role": "user", "content": text_query})

        # Round 1: Call LLM with autonomous tools
        raw_msg = self._call_llm_round(messages, use_tools=True)
        actions: List[Dict[str, Any]] = []

        # Extract tool calls (supports both native JSON and Qwen XML <tool_call> tags)
        tool_calls = raw_msg.get("tool_calls") or []
        content_str = raw_msg.get("content") or ""
        if not tool_calls and "<tool_call>" in content_str:
            for m in re.finditer(r"<function=([a-zA-Z0-9_]+)>(.*?)</function>", content_str, re.DOTALL):
                fn_name = m.group(1)
                body = m.group(2)
                args = {}
                for p in re.finditer(r"<parameter=([a-zA-Z0-9_]+)>\s*(.*?)\s*</parameter>", body, re.DOTALL):
                    args[p.group(1)] = p.group(2).strip()
                tool_calls.append({"id": f"call_{len(tool_calls)}", "type": "function", "function": {"name": fn_name, "arguments": json.dumps(args)}})

        if tool_calls:
            messages.append({"role": "assistant", "content": None, "tool_calls": tool_calls})
            for tc in tool_calls:
                fn_name = tc.get("function", {}).get("name", "")
                try:
                    args = json.loads(tc.get("function", {}).get("arguments", "{}"))
                except Exception:
                    args = {}

                tool_output, action = self._execute_tool(fn_name, args)
                if action:
                    actions.append(action)

                messages.append({
                    "role": "tool",
                    "tool_call_id": tc.get("id", ""),
                    "content": tool_output,
                })

            # Round 2: Generate final conversational response from tool findings
            messages.append({
                "role": "user",
                "content": "Answer conversationally in character using the factual data retrieved above. Do not output any more tool calls, reply in clean plain text only.",
            })
            final_msg = self._call_llm_round(messages, use_tools=False)
            final_text = final_msg.get("content", "")
        else:
            final_text = content_str

        # 4. Presentation-style multi-project timeline sequencing
        paras = [p.strip() for p in final_text.split("\n\n") if p.strip()]
        project_map = {
            "matchresume": ["matchresume", "semantic matching", "ats score"],
            "cricmanage": ["cricmanage", "cricket", "ipl"],
            "batchshare": ["batchshare", "ephemeral"],
            "jackdsql": ["jackdsql", "sql sandbox", "assessment engine"],
            "larp-detector": ["larp detector", "doyoularp"],
            "stockresearchassistant": ["stock research", "yfinance"],
        }
        presentation_actions = []
        for idx, para in enumerate(paras):
            p_lower = para.lower()
            for pid, aliases in project_map.items():
                if any(a in p_lower for a in aliases):
                    p_obj = self.db.get_project(pid)
                    if p_obj:
                        presentation_actions.append({
                            "type": "OPEN_PROJECT",
                            "projectId": pid,
                            "targetParagraph": idx,
                            "url": p_obj.get("live_url", ""),
                            "title": f"{p_obj.get('name')} — Live App",
                        })
                    break
        has_explicit_link_or_resume = any(a.get("type") in ("OPEN_LINK", "DOWNLOAD_RESUME") for a in actions)
        if presentation_actions and not has_explicit_link_or_resume:
            actions = presentation_actions

        # Proactive realtime action dispatch: ensure window opens if user asks about projects, socials, or explicitly asks for resume
        has_interactive_action = any(a.get("type") in ("OPEN_PROJECT", "OPEN_LINK", "DOWNLOAD_RESUME") for a in actions)
        if not has_interactive_action:
            if any(w in lower for w in ["download resume", "download cv", "get resume", "get cv", "save resume", "download the pdf"]):
                rf = resolve_resume_path()
                fname = rf.name if rf else "AdityaKathe.pdf"
                actions.append({
                    "type": "DOWNLOAD_RESUME",
                    "url": f"/resumes/{fname}",
                    "filename": fname,
                    "title": "Aditya Kathe — Resume PDF",
                    "autoDownload": True,
                })
            elif any(w in lower for w in ["view resume", "see resume", "open resume", "show resume"]):
                rf = resolve_resume_path()
                fname = rf.name if rf else "AdityaKathe.pdf"
                actions.append({
                    "type": "DOWNLOAD_RESUME",
                    "url": f"/resumes/{fname}",
                    "filename": fname,
                    "title": "Aditya Kathe — Resume PDF",
                    "autoDownload": False,
                })
            elif any(w in lower for w in ["social", "socials", "github", "code", "repo", "repos"]):
                actions.append({
                    "type": "OPEN_LINK",
                    "platform": "github",
                    "url": "https://github.com/aditya-10k",
                    "title": "Aditya Kathe — GitHub",
                })
            elif any(w in lower for w in ["linkedin", "connect"]):
                actions.append({
                    "type": "OPEN_LINK",
                    "platform": "linkedin",
                    "url": "https://linkedin.com/in/adityakathe",
                    "title": "Aditya Kathe — LinkedIn",
                })
            elif any(w in lower for w in ["project", "projects", "work", "apps", "built", "exp", "experience"]):
                actions.append({
                    "type": "OPEN_PROJECT",
                    "projectId": "matchresume",
                    "url": "https://matchresume.web.app",
                    "title": "MatchResume — Live App",
                })

        # Post-process response adhering to persona rules
        clean_text = self._sanitize_persona_output(final_text)

        # Infer emotion
        emotion = "neutral"
        if actions:
            emotion = "excited"
            actions.insert(0, {"type": "SET_EXPRESSION", "expression": "excited"})
        elif re.search(r"^(hi|hello|hey|yo|namaste)\b", lower):
            emotion = "greeting"
            actions.append({"type": "SET_EXPRESSION", "expression": "greeting"})

        return {
            "protocolVersion": "1.0",
            "text": clean_text,
            "emotion": emotion,
            "speech": {"enabled": True},
            "actions": actions,
        }

    def _call_llm_round(self, messages: List[Dict[str, Any]], use_tools: bool = True) -> Dict[str, Any]:
        """Multi-provider failover LLM call (Groq approved models -> OpenRouter approved models)."""
        groq_key = os.getenv("GROQ_API_KEY")
        if groq_key:
            groq_models = list(dict.fromkeys([
                os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b"),
                "qwen/qwen3.8-27b",
                "qwen/qwen3.6-27b",
                "openai/gpt-oss-20b",
                "openai/gpt-oss-120b",
            ]))
            for model in groq_models:
                url = "https://api.groq.com/openai/v1/chat/completions"
                headers = {
                    "Authorization": f"Bearer {groq_key}",
                    "Content-Type": "application/json",
                }
                payload: Dict[str, Any] = {
                    "model": model,
                    "messages": messages,
                    "temperature": 0.3,
                    "max_completion_tokens": 2048,
                    "tools": PORTFOLIO_TOOLS,
                }
                if not use_tools:
                    payload["tool_choice"] = "none"

                try:
                    r = requests.post(url, json=payload, headers=headers, timeout=15)
                    if r.status_code == 200:
                        data = r.json()
                        choices = data.get("choices", [])
                        if choices and "message" in choices[0]:
                            msg = choices[0]["message"]
                            cnt = msg.get("content") or ""
                            has_tools = bool(msg.get("tool_calls")) or ("<tool_call>" in cnt)
                            if cnt.strip() or has_tools:
                                return msg
                            logger.warning("Groq (%s) returned empty content with no tool calls, trying next model", model)
                    else:
                        logger.warning("Groq (%s) returned %d: %s", model, r.status_code, r.text[:200])
                except Exception as err:
                    logger.warning("Groq (%s) request failed: %s", model, err)

        # OpenRouter Secondary Provider
        openrouter_key = os.getenv("OPENROUTER_API_KEY")
        if openrouter_key:
            openrouter_models = [
                os.getenv("OPENROUTER_MODEL", "openrouter/free"),
                "nvidia/nemotron-3.5-lightning:free",
            ]
            for model in openrouter_models:
                url = "https://openrouter.ai/api/v1/chat/completions"
                headers = {
                    "Authorization": f"Bearer {openrouter_key}",
                    "Content-Type": "application/json",
                }
                payload = {
                    "model": model,
                    "messages": messages,
                    "temperature": 0.3,
                    "max_tokens": 2048,
                    "tools": PORTFOLIO_TOOLS,
                }
                if not use_tools:
                    payload["tool_choice"] = "none"

                try:
                    r = requests.post(url, json=payload, headers=headers, timeout=15)
                    if r.status_code == 200:
                        data = r.json()
                        choices = data.get("choices", [])
                        if choices and "message" in choices[0]:
                            msg = choices[0]["message"]
                            cnt = msg.get("content") or ""
                            has_tools = bool(msg.get("tool_calls")) or ("<tool_call>" in cnt)
                            if cnt.strip() or has_tools:
                                return msg
                    logger.warning("OpenRouter (%s) returned %d: %s", model, r.status_code, r.text[:200])
                except Exception as err:
                    logger.warning("OpenRouter (%s) request failed: %s", model, err)

        raise RuntimeError("Live LLM inference failed across all providers.")

    def _sanitize_persona_output(self, text: str) -> str:
        """Enforce strict persona constraints: strip asterisks, trailing period, robotic phrases, tool tags, thinking tags."""
        cleaned = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL)
        cleaned = re.sub(r'</?think>', '', cleaned)
        cleaned = re.sub(r'<tool_call>.*?</tool_call>', '', cleaned, flags=re.DOTALL)
        cleaned = re.sub(r'<function=.*?</function>', '', cleaned, flags=re.DOTALL)
        cleaned = re.sub(r'\b(open_project_demo|search_portfolio_database|open_social_profile|download_resume)\s*\([^)]*\)', '', cleaned)
        cleaned = cleaned.strip()
        cleaned = cleaned.replace("*", "")
        cleaned = cleaned.replace("\u2011", "-").replace("\u2013", "-").replace("\u2014", "-")
        cleaned = RE_ROBOTIC_AI.sub("", cleaned).strip()
        cleaned = RE_TERMINAL_PERIOD.sub("", cleaned).strip()
        return cleaned
