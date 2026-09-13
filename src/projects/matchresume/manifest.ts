import { ProjectManifest } from '../../types/projects';

export const matchResumeManifest: ProjectManifest = {
  id: 'matchresume',
  name: 'MatchResume',
  subtitle: 'AI-Powered Semantic Resume & Job Matcher',
  description:
    'An automated ATS optimizer and semantic resume matcher that compares candidate resumes against job descriptions using vector embeddings, returning deep gap analyses and tailored bullet-point recommendations.',
  links: {
    github: 'https://github.com/aditya-10k/matchresume',
    live: 'https://matchresumenow.vercel.app/',
  },
  technologies: ['LangGraph', 'FastAPI', 'Sentence Transformers', 'ChromaDB', 'PostgreSQL', 'RAG'],
  demos: [
    {
      id: 'matching',
      name: 'Interactive Semantic Matching Flow',
      description: 'Run real-time vector similarity scoring between a sample candidate CV and a tech job posting.',
    },
  ],
  metrics: [
    { label: 'ATS Match Score', value: '87%' },
    { label: 'Inference Latency', value: '420ms' },
    { label: 'Resumes Analyzed', value: '14,000+' },
  ],
  highlights: [
    'Cosine vector similarity on extracted skill embeddings',
    'Actionable bullet-point rewriting suggestions for ATS filters',
    'Radar chart skill-gap diagnostics',
  ],
};
