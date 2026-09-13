import React from 'react';
import { Mail, Sparkles, Cpu } from 'lucide-react';
import { GithubIcon } from '../components/common/Icons';
import { NavTab } from '../types';

interface AboutPageProps {
  setActiveTab: (tab: NavTab) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ setActiveTab }) => {
  const skills = [
    {
      category: 'Languages',
      items: ['TypeScript', 'JavaScript', 'Python', 'Solidity', 'SQL', 'HTML/CSS'],
    },
    {
      category: 'AI & Machine Learning',
      items: ['NLP & Embeddings', 'FastAPI', 'LangChain', 'Prompt Engineering', 'Vector Databases (Pinecone/Chroma)', 'PyTorch basics'],
    },
    {
      category: 'Frontend & UI Engineering',
      items: ['React', 'Next.js', 'Tailwind CSS', 'Framer Motion', 'State Machines', 'Responsive UI/UX'],
    },
    {
      category: 'Backend & Web3 Systems',
      items: ['Node.js', 'Express', 'Redis', 'Docker', 'EVM / Smart Contracts', 'Foundry & Hardhat'],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
      
      {/* Header Bio */}
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-300">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>About Aditya</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
          Engineering intelligent systems with personality and craft.
        </h1>

        <div className="text-sm sm:text-base text-slate-300 leading-relaxed space-y-4">
          <p>
            I&apos;m Aditya, a software engineer obsessed with building high-impact tools that bridge artificial intelligence, full-stack design, and decentralized technology.
          </p>
          <p>
            Whether it&apos;s crafting semantic NLP models that match talent to opportunities (like <span className="text-purple-300 font-semibold">MatchResume</span>), static analysis analyzers for EVM contracts, or whimsical glowing AI companions that bring websites to life, I believe software should not only be bulletproof—it should be unforgettable to use.
          </p>
        </div>

        {/* Social / Contact Links */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <a
            href="https://github.com/aditya-10k"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#121626] hover:bg-[#1a2136] border border-white/10 text-xs font-semibold text-slate-200 hover:text-white transition-all shadow-sm"
          >
            <GithubIcon className="w-4 h-4 text-purple-400" />
            <span>GitHub (@aditya-10k)</span>
          </a>

          <a
            href="mailto:contact@aditya.dev"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#121626] hover:bg-[#1a2136] border border-white/10 text-xs font-semibold text-slate-200 hover:text-white transition-all shadow-sm"
          >
            <Mail className="w-4 h-4 text-blue-400" />
            <span>Email Me</span>
          </a>
        </div>
      </div>

      {/* Tech Stack Matrix */}
      <div className="space-y-6 pt-6 border-t border-white/5">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Cpu className="w-5 h-5 text-purple-400" />
          <span>Technical Toolkit &amp; Competencies</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {skills.map((skillGroup) => (
            <div
              key={skillGroup.category}
              className="p-5 rounded-2xl bg-[#0f1422] border border-white/10 space-y-3"
            >
              <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                {skillGroup.category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {skillGroup.items.map((item) => (
                  <span
                    key={item}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#161c2e] text-slate-300 border border-white/5"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Philosophy / CTA */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-purple-950/40 via-[#101424] to-blue-950/40 border border-purple-500/20 text-center space-y-4">
        <h3 className="text-xl font-bold text-white">
          Have an idea or looking to hire?
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
          I&apos;m always excited to collaborate on groundbreaking products, AI agent infrastructure, and challenging engineering problems.
        </p>
        <button
          onClick={() => setActiveTab('chat')}
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-xs font-semibold text-white shadow-lg transition-all"
        >
          Chat with the AI Companion →
        </button>
      </div>

    </div>
  );
};
