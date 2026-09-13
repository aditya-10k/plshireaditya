import { ProjectManifest } from '../types/projects';
import { matchResumeManifest } from './matchresume/manifest';
import { larpDetectorManifest } from './larpdetector/manifest';

export const batchShareManifest: ProjectManifest = {
  id: 'batchshare',
  name: 'BatchShare',
  subtitle: 'Ephemeral Real-Time File & Text Sharing',
  description:
    'Seamless cross-device text and file sharing platform featuring room-based ephemeral sessions, scheduled auto-expiry, STOMP WebSockets, and Cloudinary file storage.',
  links: {
    github: 'https://github.com/aditya-10k/batchshare',
    live: 'https://batchsharenow.web.app/',
  },
  technologies: ['Java 21', 'Spring Boot 3', 'Redis', 'WebSockets (STOMP)', 'Cloudinary', 'Flutter Web'],
  metrics: [
    { label: 'Backend', value: 'Spring Boot 3' },
    { label: 'Protocol', value: 'STOMP WebSockets' },
  ],
  highlights: ['Zero-latency live room text synchronisation', 'Redis TTL expiring room lifecycle', 'Base62 short URL generator'],
};

export const jackdsqlManifest: ProjectManifest = {
  id: 'jackdsql',
  name: 'JackDSQL',
  subtitle: 'Sandboxed SQL Assessment Engine',
  description:
    'Interactive SQL practice platform with 270 SQL challenges, isolated least-privilege PostgreSQL sandboxing, asynchronous RabbitMQ grading queues, and Redis-backed session management.',
  links: {
    github: 'https://github.com/aditya-10k/jackdsql',
    live: 'https://jackdsql.web.app/',
  },
  technologies: ['Java 17', 'Spring Boot 3.4', 'PostgreSQL 15', 'RabbitMQ', 'Redis', 'Docker', 'Flutter'],
  metrics: [
    { label: 'Challenges', value: '270 SQL Problems' },
    { label: 'Architecture', value: 'Dual-DB Sandbox' },
  ],
  highlights: ['Isolated least-privilege PostgreSQL sandbox roles', 'Asynchronous grading via RabbitMQ message queues', 'Flutter SQL editor with AI error hints'],
};

export const cricManageManifest: ProjectManifest = {
  id: 'cricmanage',
  name: 'CricManage',
  subtitle: 'IPL Strategy & Draft Simulation Engine',
  description:
    'Cricket analytics product transforming historical ball-by-ball data into Expected Runs and Win Probability via gradient boosting and calibrated logistic regression, backed by Spring Boot and Flutter Web.',
  links: {
    github: 'https://github.com/aditya-10k/crickmanager',
    live: 'https://cricmanagernow.web.app',
  },
  technologies: ['Spring Boot', 'Flutter', 'PostgreSQL', 'Docker', 'Python', 'Machine Learning'],
  metrics: [
    { label: 'Data Depth', value: '18 IPL Seasons' },
    { label: 'Valuation Model', value: 'ELO + WPA' },
  ],
  highlights: ['Ball-by-ball ML feature engineering pipeline', 'Spring Boot REST APIs and tournament simulator', 'Firebase-hosted Flutter Web draft room'],
};

export const stockAssistantManifest: ProjectManifest = {
  id: 'stockresearchassistant',
  name: 'Stock Research Assistant',
  subtitle: 'Multi-Agent Equity Research System',
  description:
    'Multi-agent financial intelligence system using LangGraph to coordinate specialized agents for market analysis, financial statements, news synthesis, and verifiable investment report generation.',
  links: {
    github: 'https://github.com/aditya-10k/StockResearchAssistant',
    live: 'https://stockresearchassistant.web.app/',
  },
  technologies: ['FastAPI', 'LangGraph', 'LLMs', 'PostgreSQL', 'RAG', 'pgvector', 'Python', 'Docker'],
  metrics: [
    { label: 'Architecture', value: 'LangGraph Multi-Agent' },
    { label: 'RAG Pipeline', value: 'pgvector Dense Search' },
  ],
  highlights: ['Specialized agent coordination for filings and news', 'Verification guardrails with source attribution', 'PostgreSQL pgvector document store'],
};

export const PROJECT_REGISTRY: Record<string, ProjectManifest> = {
  matchresume: matchResumeManifest,
  'larp-detector': larpDetectorManifest,
  doyoularp: larpDetectorManifest,
  batchshare: batchShareManifest,
  jackdsql: jackdsqlManifest,
  cricmanage: cricManageManifest,
  stockresearchassistant: stockAssistantManifest,
};

export const getProjectManifest = (id: string): ProjectManifest | undefined => {
  return PROJECT_REGISTRY[id.toLowerCase()];
};

export const getAllProjects = (): ProjectManifest[] => {
  return Object.values(PROJECT_REGISTRY);
};

