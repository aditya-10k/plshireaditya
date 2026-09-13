import React, { useState, useEffect } from 'react';
import { Play, CheckCircle2, FileText, Briefcase, Sparkles, RefreshCw } from 'lucide-react';

interface MatchResumeDemoProps {
  autoRun?: boolean;
}

export const MatchResumeDemo: React.FC<MatchResumeDemoProps> = ({ autoRun = false }) => {
  const [selectedResume, setSelectedResume] = useState<'aditya' | 'junior' | 'devops'>('aditya');
  const [selectedJob, setSelectedJob] = useState<'ai-staff' | 'frontend-lead'>('ai-staff');
  const [isMatching, setIsMatching] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const resumes = {
    aditya: {
      name: 'Aditya (Full-Stack & AI Engineer)',
      skills: ['Python', 'TypeScript', 'FastAPI', 'React', 'Vector Embeddings', 'PostgreSQL', 'Docker'],
      summary: 'Experienced full-stack engineer specializing in LLM/agentic systems, high-performance web applications, and NLP retrieval pipelines.',
    },
    junior: {
      name: 'Junior Web Developer',
      skills: ['JavaScript', 'HTML/CSS', 'React basics', 'Git'],
      summary: 'Aspiring web developer with experience building responsive personal projects and simple REST APIs.',
    },
    devops: {
      name: 'Cloud / Infrastructure Specialist',
      skills: ['Kubernetes', 'Terraform', 'AWS', 'Docker', 'CI/CD', 'Go'],
      summary: 'DevOps engineer focused on container orchestration, cloud resilience, and automated deployment pipelines.',
    },
  };

  const jobs = {
    'ai-staff': {
      title: 'Staff AI Systems Engineer @ NextGen Tech',
      requirements: ['Python', 'FastAPI', 'Vector Search', 'TypeScript', 'Distributed Systems', 'Agentic Workflows'],
      minimumFit: 80,
    },
    'frontend-lead': {
      title: 'Lead Frontend Architect @ ModernWeb',
      requirements: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'State Machines', 'Performance Tuning'],
      minimumFit: 75,
    },
  };

  const calculateScore = () => {
    if (selectedResume === 'aditya' && selectedJob === 'ai-staff') return 88;
    if (selectedResume === 'aditya' && selectedJob === 'frontend-lead') return 92;
    if (selectedResume === 'junior') return 48;
    return 64;
  };

  const currentScore = calculateScore();

  const handleRunMatch = () => {
    setIsMatching(true);
    setHasRun(false);

    setTimeout(() => {
      setIsMatching(false);
      setHasRun(true);
    }, 1200);
  };

  useEffect(() => {
    if (autoRun) {
      handleRunMatch();
    } else {
      setHasRun(true);
    }
  }, [autoRun]);

  return (
    <div className="space-y-6 text-slate-100">
      
      {/* Top Banner */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/20 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
          <span className="font-semibold text-purple-200">Interactive Live Demonstration</span>
        </div>
        <span className="text-[11px] text-slate-400">Sentence-Transformers v2.4 + Cosine Sim</span>
      </div>

      {/* Selectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        
        {/* Candidate Resume Selector */}
        <div className="p-4 rounded-2xl bg-[#0f1422] border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Select Candidate Resume:</span>
          </div>

          <div className="flex flex-col gap-1.5">
            {(Object.keys(resumes) as Array<keyof typeof resumes>).map((key) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedResume(key);
                  setHasRun(false);
                }}
                className={`text-left px-3 py-2 rounded-xl transition-all border text-xs ${
                  selectedResume === key
                    ? 'bg-blue-600/20 border-blue-500 text-blue-200 font-semibold'
                    : 'bg-[#141a2c]/60 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-[#182036]'
                }`}
              >
                {resumes[key].name}
              </button>
            ))}
          </div>

          <p className="text-[11px] text-slate-400 italic pt-1">
            &quot;{resumes[selectedResume].summary}&quot;
          </p>
        </div>

        {/* Target Job Selector */}
        <div className="p-4 rounded-2xl bg-[#0f1422] border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <Briefcase className="w-4 h-4 text-purple-400" />
            <span>Select Target Job Description:</span>
          </div>

          <div className="flex flex-col gap-1.5">
            {(Object.keys(jobs) as Array<keyof typeof jobs>).map((key) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedJob(key);
                  setHasRun(false);
                }}
                className={`text-left px-3 py-2 rounded-xl transition-all border text-xs ${
                  selectedJob === key
                    ? 'bg-purple-600/20 border-purple-500 text-purple-200 font-semibold'
                    : 'bg-[#141a2c]/60 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-[#182036]'
                }`}
              >
                {jobs[key].title}
              </button>
            ))}
          </div>

          <div className="pt-1">
            <span className="text-[11px] text-slate-400 block mb-1">Required keywords:</span>
            <div className="flex flex-wrap gap-1">
              {jobs[selectedJob].requirements.map((req) => (
                <span key={req} className="px-2 py-0.5 rounded-md bg-[#182036] text-[10px] text-slate-300">
                  {req}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Trigger Action Button */}
      <div className="flex justify-center">
        <button
          onClick={handleRunMatch}
          disabled={isMatching}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:to-pink-500 text-white font-semibold text-xs shadow-lg shadow-purple-900/30 transition-all active:scale-95 disabled:opacity-50"
        >
          {isMatching ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Calculating Embeddings &amp; Cosine Distance...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Run Semantic Similarity Match</span>
            </>
          )}
        </button>
      </div>

      {/* Results Surface */}
      {hasRun && (
        <div className="p-5 rounded-3xl bg-[#0b0e17] border border-white/10 space-y-4 animate-fadeIn">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-3 border-b border-white/10">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Semantic Match Score
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className={`text-4xl font-extrabold tracking-tight ${
                  currentScore >= 80 ? 'text-emerald-400' : currentScore >= 60 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {currentScore}%
                </span>
                <span className="text-xs text-slate-400">
                  {currentScore >= 80 ? 'Exceptional Fit (Top 5%)' : currentScore >= 60 ? 'Moderate Fit' : 'Skill Gap Detected'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">ATS Parse Score</span>
                <span className="text-sm font-semibold text-white">96.8%</span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Breakdown Pills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Strong Alignment Vector Keys:</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {resumes[selectedResume].skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 rounded-md text-[11px] bg-emerald-950/40 border border-emerald-500/30 text-emerald-200"
                  >
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Bullet Point Optimization:</span>
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed bg-[#131929] p-3 rounded-xl border border-white/5">
                {currentScore >= 80
                  ? 'Strong overlap. Recommend restructuring bullet #2 to quantify throughput scale (e.g., "processed 1.2M queries at 45ms latency") to maximize ATS ranking.'
                  : 'Candidate lacks explicit experience in required distributed orchestration. Recommend highlighting relevant concurrency models or side projects.'}
              </p>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
