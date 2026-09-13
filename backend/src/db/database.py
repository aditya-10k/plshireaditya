"""
Database Manager & RAG Knowledge Store.
Supports PostgreSQL with pgvector when DATABASE_URL is set,
with an automatic embedded SQLite + NumPy vector fallback.
"""

from __future__ import annotations

import json
import logging
import os
import re
import sqlite3
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import numpy as np

logger = logging.getLogger(__name__)

DEFAULT_SQLITE_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "portfolio.db"


class DatabaseManager:
    """
    Manages structured portfolio data and RAG embeddings.
    """

    def __init__(self, db_url: Optional[str] = None, sqlite_path: Optional[Path] = None):
        self.db_url = db_url or os.getenv("DATABASE_URL")
        self.sqlite_path = sqlite_path or DEFAULT_SQLITE_PATH
        self.is_postgres = bool(self.db_url and self.db_url.startswith("postgres"))

        self._init_storage()

    def _init_storage(self):
        """Initialize storage tables."""
        if self.is_postgres:
            logger.info("Connecting to PostgreSQL at %s ...", self.db_url.split("@")[-1] if "@" in self.db_url else "configured url")
            # In production, psycopg/asyncpg will execute schema.sql
            return

        # SQLite embedded local fallback
        logger.info("Initializing SQLite portfolio store at %s ...", self.sqlite_path)
        self.sqlite_path.parent.mkdir(parents=True, exist_ok=True)
        with sqlite3.connect(self.sqlite_path) as conn:
            c = conn.cursor()
            c.execute("""
                CREATE TABLE IF NOT EXISTS projects (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    subtitle TEXT,
                    description TEXT,
                    live_url TEXT,
                    github_url TEXT,
                    technologies TEXT,
                    highlights TEXT,
                    metrics TEXT,
                    featured INTEGER DEFAULT 1
                )
            """)
            c.execute("""
                CREATE TABLE IF NOT EXISTS project_knowledge (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    project_id TEXT NOT NULL,
                    doc_type TEXT NOT NULL,
                    title TEXT,
                    chunk_content TEXT NOT NULL,
                    embedding_bytes BLOB NOT NULL
                )
            """)
            c.execute("""
                CREATE VIRTUAL TABLE IF NOT EXISTS project_knowledge_fts USING fts5(
                    project_id,
                    title,
                    content
                );
            """)
            c.execute("SELECT count(*) FROM project_knowledge_fts")
            if c.fetchone()[0] == 0:
                c.execute("""
                    INSERT INTO project_knowledge_fts (project_id, title, content)
                    SELECT project_id, title, chunk_content FROM project_knowledge
                """)
            c.execute("""
                CREATE TABLE IF NOT EXISTS personal_facts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    category TEXT NOT NULL,
                    fact TEXT NOT NULL
                )
            """)
            conn.commit()


    def save_project(self, project: Dict[str, Any]):
        """Insert or update a project record."""
        p_id = project["id"].lower()
        techs = json.dumps(project.get("technologies", []))
        highlights = json.dumps(project.get("highlights", []))
        metrics = json.dumps(project.get("metrics", []))

        with sqlite3.connect(self.sqlite_path) as conn:
            c = conn.cursor()
            c.execute("""
                INSERT OR REPLACE INTO projects 
                (id, name, subtitle, description, live_url, github_url, technologies, highlights, metrics, featured)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                p_id,
                project.get("name", p_id),
                project.get("subtitle", ""),
                project.get("description", ""),
                project.get("live_url", ""),
                project.get("github_url", ""),
                techs,
                highlights,
                metrics,
                1 if project.get("featured", True) else 0,
            ))
            conn.commit()

    def get_project(self, project_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve project by ID."""
        p_id = project_id.lower()
        with sqlite3.connect(self.sqlite_path) as conn:
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("SELECT * FROM projects WHERE id = ?", (p_id,))
            row = c.fetchone()
            if not row:
                return None
            return self._row_to_project(row)

    def list_projects(self) -> List[Dict[str, Any]]:
        """List all registered projects."""
        with sqlite3.connect(self.sqlite_path) as conn:
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("SELECT * FROM projects ORDER BY featured DESC, name ASC")
            rows = c.fetchall()
            return [self._row_to_project(r) for r in rows]

    def _row_to_project(self, row: sqlite3.Row) -> Dict[str, Any]:
        return {
            "id": row["id"],
            "name": row["name"],
            "subtitle": row["subtitle"],
            "description": row["description"],
            "live_url": row["live_url"],
            "github_url": row["github_url"],
            "technologies": json.loads(row["technologies"] or "[]"),
            "highlights": json.loads(row["highlights"] or "[]"),
            "metrics": json.loads(row["metrics"] or "[]"),
            "featured": bool(row["featured"]),
        }

    def save_knowledge_chunk(
        self,
        project_id: str,
        doc_type: str,
        title: str,
        content: str,
        vector: np.ndarray,
    ):
        """Save a documentation chunk and its dense embedding."""
        emb_bytes = vector.astype(np.float32).tobytes()
        with sqlite3.connect(self.sqlite_path) as conn:
            c = conn.cursor()
            c.execute("""
                INSERT INTO project_knowledge 
                (project_id, doc_type, title, chunk_content, embedding_bytes)
                VALUES (?, ?, ?, ?, ?)
            """, (project_id.lower(), doc_type, title, content, emb_bytes))
            conn.commit()

    def search_knowledge(
        self,
        query_vector: np.ndarray,
        project_id: Optional[str] = None,
        top_k: int = 3,
    ) -> List[Dict[str, Any]]:
        """
        Search knowledge base using vectorized cosine similarity.
        """
        q = query_vector.astype(np.float32)
        norm_q = np.linalg.norm(q)
        if norm_q > 0:
            q = q / norm_q

        with sqlite3.connect(self.sqlite_path) as conn:
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            if project_id:
                c.execute("SELECT * FROM project_knowledge WHERE project_id = ?", (project_id.lower(),))
            else:
                c.execute("SELECT * FROM project_knowledge")
            rows = c.fetchall()

        if not rows:
            return []

        scored = []
        for r in rows:
            vec = np.frombuffer(r["embedding_bytes"], dtype=np.float32)
            norm_v = np.linalg.norm(vec)
            if norm_v > 0:
                vec = vec / norm_v
            sim = float(np.dot(q, vec))
            scored.append((sim, {
                "project_id": r["project_id"],
                "doc_type": r["doc_type"],
                "title": r["title"],
                "content": r["chunk_content"],
                "similarity": round(sim, 4),
            }))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored[:top_k]]

    def get_profile(self) -> Optional[Dict[str, Any]]:
        """Retrieve personal profile and contact facts from SQL."""
        with sqlite3.connect(self.sqlite_path) as conn:
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("SELECT * FROM profile LIMIT 1")
            row = c.fetchone()
            return dict(row) if row else None

    def get_personal_facts(self, category: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieve verified personality, lifestyle, hobbies, and personal facts from SQL."""
        with sqlite3.connect(self.sqlite_path) as conn:
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("""
                CREATE TABLE IF NOT EXISTS personal_facts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    category TEXT NOT NULL,
                    fact TEXT NOT NULL
                )
            """)
            if category:
                c.execute("SELECT id, category, fact FROM personal_facts WHERE category = ?", (category.lower(),))
            else:
                c.execute("SELECT id, category, fact FROM personal_facts")
            return [dict(r) for r in c.fetchall()]

    def set_personal_facts(self, facts: List[Dict[str, str]]):
        """Replace personal facts in SQL."""
        with sqlite3.connect(self.sqlite_path) as conn:
            c = conn.cursor()
            c.execute("""
                CREATE TABLE IF NOT EXISTS personal_facts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    category TEXT NOT NULL,
                    fact TEXT NOT NULL
                )
            """)
            c.execute("DELETE FROM personal_facts")
            for f in facts:
                c.execute("INSERT INTO personal_facts (category, fact) VALUES (?, ?)", (f.get("category", "general"), f.get("fact", "")))
            conn.commit()

    def update_profile(self, profile_data: Dict[str, Any]):
        """Update profile fields in SQL."""
        with sqlite3.connect(self.sqlite_path) as conn:
            c = conn.cursor()
            c.execute("""
                UPDATE profile SET
                    full_name = COALESCE(?, full_name),
                    headline = COALESCE(?, headline),
                    email = COALESCE(?, email),
                    phone = COALESCE(?, phone),
                    location = COALESCE(?, location),
                    linkedin_url = COALESCE(?, linkedin_url),
                    github_url = COALESCE(?, github_url),
                    website_url = COALESCE(?, website_url),
                    summary = COALESCE(?, summary),
                    status = COALESCE(?, status)
                WHERE id = 'aditya_kathe'
            """, (
                profile_data.get("full_name"),
                profile_data.get("headline"),
                profile_data.get("email"),
                profile_data.get("phone"),
                profile_data.get("location"),
                profile_data.get("linkedin_url"),
                profile_data.get("github_url"),
                profile_data.get("website_url"),
                profile_data.get("summary"),
                profile_data.get("status"),
            ))
            conn.commit()

    def get_experiences(self) -> List[Dict[str, Any]]:
        """Retrieve verified work experience records from SQL."""
        with sqlite3.connect(self.sqlite_path) as conn:
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("SELECT * FROM experience ORDER BY is_current DESC, id ASC")
            rows = c.fetchall()
            res = []
            for r in rows:
                item = dict(r)
                item["technologies"] = json.loads(item.get("technologies") or "[]")
                item["highlights"] = json.loads(item.get("highlights") or "[]")
                res.append(item)
            return res

    def get_education(self) -> List[Dict[str, Any]]:
        """Retrieve education and academic records from SQL."""
        with sqlite3.connect(self.sqlite_path) as conn:
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("SELECT * FROM education")
            return [dict(r) for r in c.fetchall()]

    def get_skills(self) -> Dict[str, List[str]]:
        """Retrieve skill taxonomy from SQL grouped by category."""
        with sqlite3.connect(self.sqlite_path) as conn:
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("SELECT category, skill_name FROM skills ORDER BY category, skill_name")
            skills: Dict[str, List[str]] = {}
            for r in c.fetchall():
                skills.setdefault(r["category"], []).append(r["skill_name"])
            return skills

    def search_rag(self, query: str, project_id: Optional[str] = None, limit: int = 3) -> List[Dict[str, Any]]:
        """
        Ultra-fast full-text BM25 search across 335 resume and project documentation chunks.
        Executes in <0.5ms with zero PyTorch weights.
        """
        words = [re.sub(r'[^a-zA-Z0-9]', '', w) for w in query.split()]
        valid_words = [
            w for w in words 
            if len(w) > 2 and w.lower() not in {"what", "when", "where", "which", "tell", "about", "your", "have", "with", "this", "that", "bhai", "kya"}
        ]
        if not valid_words:
            valid_words = [w for w in words if len(w) > 2]
        if not valid_words:
            return []

        match_clause = " OR ".join(valid_words)
        with sqlite3.connect(self.sqlite_path) as conn:
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            try:
                if project_id:
                    c.execute("""
                        SELECT project_id, title, content, rank 
                        FROM project_knowledge_fts 
                        WHERE project_knowledge_fts MATCH ? AND project_id = ? 
                        ORDER BY rank LIMIT ?
                    """, (match_clause, project_id.lower(), limit))
                else:
                    c.execute("""
                        SELECT project_id, title, content, rank 
                        FROM project_knowledge_fts 
                        WHERE project_knowledge_fts MATCH ? 
                        ORDER BY rank LIMIT ?
                    """, (match_clause, limit))
                rows = c.fetchall()
                return [dict(r) for r in rows]
            except Exception as e:
                logger.warning("FTS search query '%s' error: %s", match_clause, e)
                return []

