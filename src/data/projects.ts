import { Project } from '../types';

export const PROJECTS: Project[] = [
  {
    id: 'matchresume',
    title: 'MatchResume',
    subtitle: 'AI Resume Matcher',
    description: 'An AI-powered ATS optimizer and semantic resume matcher that compares candidate CVs against target job descriptions, providing instant fit scores and keyword optimization.',
    image: '/projects/matchresume.png',
    tags: ['Next.js', 'Python', 'NLP', 'Vector Embeddings', 'FastAPI'],
    demoUrl: 'https://matchresumenow.vercel.app/',
    githubUrl: 'https://github.com/aditya-10k/matchresume',
    matchScore: '94%',
    highlights: [
      'Semantic matching using state-of-the-art embedding models',
      'Real-time skill gap analysis and tailored bullet point suggestions',
      'Interactive radar charts and ATS compatibility diagnostics'
    ],
    metrics: [
      { label: 'Accuracy', value: '94.2%' },
      { label: 'Resumes Analyzed', value: '12,500+' },
      { label: 'Avg Speed', value: '0.8s' }
    ],
    featured: true,
  },
  {
    id: 'larp-detector',
    title: 'Larp Detector',
    subtitle: 'Evidence Verification Engine',
    description: 'Automated verification engine that sanity-checks engineering resumes, cross-examines public GitHub receipts, extracts atomic claims, and calculates a deterministic score.',
    image: '/projects/matchresume.png',
    tags: ['Next.js 14', 'TypeScript', 'FastAPI', 'SQLAlchemy', 'Groq', 'PostgreSQL'],
    demoUrl: 'https://doyoularp.vercel.app',
    githubUrl: 'https://github.com/aditya-10k/doyoularp',
    highlights: [
      '13-stage verification pipeline extracting atomic claims from PDF resumes',
      'Live GitHub commit and repository receipt cross-examination',
      'Deterministic 0-100 verification score with humorous roast generation'
    ],
    metrics: [
      { label: 'Accuracy', value: '98.5%' },
      { label: 'Speed', value: '< 1.5s' }
    ],
    featured: true,
  },
  {
    id: 'batchshare',
    title: 'BatchShare',
    subtitle: 'Ephemeral Real-Time File & Text Sharing',
    description: 'Seamless cross-device text and file sharing platform featuring room-based ephemeral sessions, scheduled auto-expiry, STOMP WebSockets, Cloudinary file storage, and smart short URLs.',
    image: '/projects/matchresume.png',
    tags: ['Java 21', 'Spring Boot 3', 'Redis', 'WebSockets', 'Cloudinary', 'Flutter Web'],
    demoUrl: 'https://batchsharenow.web.app/',
    githubUrl: 'https://github.com/aditya-10k/batchshare',
    highlights: [
      'STOMP WebSocket protocol for zero-latency live room text synchronisation',
      'Redis TTL expiring room lifecycle and scheduled ephemeral cleanup',
      'Custom Base62 short URL generator (ShortCodeService) for instant room invites'
    ],
    metrics: [
      { label: 'Backend', value: 'Spring Boot 3' },
      { label: 'Protocol', value: 'STOMP WebSockets' }
    ],
    featured: true,
  },
  {
    id: 'jackdsql',
    title: 'JackDSQL',
    subtitle: 'Sandboxed SQL Assessment Engine',
    description: 'Interactive SQL challenge and evaluation backend with least-privilege PostgreSQL sandboxing, asynchronous RabbitMQ grading queues, and Redis-backed session management.',
    image: '/projects/matchresume.png',
    tags: ['Java 17', 'Spring Boot 3.4', 'PostgreSQL', 'RabbitMQ', 'Redis', 'Docker'],
    demoUrl: 'https://jackdsql.web.app/',
    githubUrl: 'https://github.com/aditya-10k/jackdsql',
    highlights: [
      'Dual-datasource sandboxing executing untrusted queries against least-privilege PostgreSQL roles',
      'Decoupled asynchronous grading pipeline powered by RabbitMQ message queues',
      'Redis-backed token, session, and rate-limiting store with strict TTL policies'
    ],
    metrics: [
      { label: 'Architecture', value: 'Microservices' },
      { label: 'Security', value: 'Sandbox Role' }
    ],
    featured: true,
  },
  {
    id: 'cricmanage',
    title: 'CricManage',
    subtitle: 'IPL Strategy & Draft Simulation Engine',
    description: 'Moneyball analytics and draft simulation engine for the Indian Premier League, powered by historical ball-by-ball analysis (2008–2026), dynamic ELO player valuations, and Spring Boot.',
    image: '/projects/matchresume.png',
    tags: ['Java', 'Spring Boot', 'Python', 'PostgreSQL', 'Flutter Web', 'Data Pipeline'],
    demoUrl: 'https://cricmanagernow.web.app',
    githubUrl: 'https://github.com/aditya-10k/crickmanager',
    highlights: [
      'Comprehensive 2008–2026 IPL ball-by-ball data pipeline with WPA/RPA metrics',
      'Dynamic player valuation and real-time draft auction room simulation',
      'Spring Boot REST backend paired with Flutter interactive web dashboard'
    ],
    metrics: [
      { label: 'Data Depth', value: '18 IPL Seasons' },
      { label: 'Valuation', value: 'ELO + WPA' }
    ],
    featured: true,
  },
  {
    id: 'stockresearchassistant',
    title: 'Stock Research Assistant',
    subtitle: 'AI Equity Research Terminal',
    description: 'Automated financial analytics platform querying yfinance APIs to extract valuation multiples, momentum indicators, and earnings trends for equity research.',
    image: '/projects/matchresume.png',
    tags: ['Python', 'Pandas', 'yfinance', 'Streamlit', 'NumPy'],
    demoUrl: 'https://stockresearchassistant.web.app/',
    githubUrl: 'https://github.com/aditya-10k/StockResearchAssistant',
    highlights: [
      'Automated balance sheet and DCF valuation modeling',
      'Historical price volatility and momentum technical indicators'
    ],
    metrics: [
      { label: 'Domain', value: 'Equity Analytics' }
    ],
    featured: false,
  }
];
