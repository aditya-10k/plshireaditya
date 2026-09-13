import React from 'react';
import { ArrowRight, Bot, Code2, Sparkles, Shield } from 'lucide-react';
import { NavTab } from '../types';
import { PROJECTS } from '../data/projects';

interface HomePageProps {
  setActiveTab: (tab: NavTab) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ setActiveTab }) => {
  return (
    <div className="relative max-w-7xl mx-auto px-6 py-12 space-y-16">
      
      {/* Hero Section */}
      <div className="relative text-center max-w-3xl mx-auto space-y-6 pt-6">
        
        {/* Glowing badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-300">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Available for High-Impact Roles &amp; Projects</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
          Hi, I&apos;m <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Aditya</span>.
          <br />
          Full-Stack &amp; AI Engineer.
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
          I build intelligent digital experiences, agentic AI systems, and responsive full-stack applications. Powered by curiosity, clean code, and high-octane caffeine.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={() => setActiveTab('chat')}
            className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:to-pink-500 text-sm font-semibold text-white shadow-xl shadow-purple-900/30 hover:scale-105 transition-all duration-200"
          >
            <Bot className="w-4 h-4" />
            <span>Talk with Aditya AI</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#121624] hover:bg-[#1a2136] border border-white/10 text-sm font-semibold text-slate-200 hover:text-white transition-all duration-200"
          >
            <span>View All Projects</span>
          </button>
        </div>

      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
        
        {/* Card 1 */}
        <div className="p-6 rounded-3xl bg-[#0f1422]/80 border border-white/10 hover:border-purple-500/30 transition-all duration-300 group">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
            <Bot className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Agentic &amp; NLP Systems</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Architecting intelligent workflow orchestrators, vector memory search, and semantic AI tools like MatchResume.
          </p>
        </div>

        {/* Card 2 */}
        <div className="p-6 rounded-3xl bg-[#0f1422]/80 border border-white/10 hover:border-blue-500/30 transition-all duration-300 group">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
            <Code2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Modern Full-Stack</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            High-performance web apps built with React, TypeScript, Tailwind, FastAPI, and robust distributed architectures.
          </p>
        </div>

        {/* Card 3 */}
        <div className="p-6 rounded-3xl bg-[#0f1422]/80 border border-white/10 hover:border-emerald-500/30 transition-all duration-300 group">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Web3 &amp; Security</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Smart contract security auditing, EVM bytecode static analysis, and decentralized protocol integrations.
          </p>
        </div>

      </div>

      {/* Featured Project Showcase Teaser */}
      <div className="rounded-3xl bg-gradient-to-r from-[#121626] to-[#151228] border border-white/10 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-xl">
          <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
            Flagship Project
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            MatchResume — AI Resume Matcher
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Semantic ATS resume analysis engine scoring CV match rates with sub-second vector similarity models and automated keyword tailoring.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {PROJECTS[0].tags.map((t) => (
              <span key={t} className="px-2.5 py-1 rounded-md text-xs bg-black/40 text-slate-300 border border-white/5">
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="shrink-0">
          <button
            onClick={() => setActiveTab('chat')}
            className="px-6 py-3 rounded-full bg-white text-slate-900 font-semibold text-sm hover:bg-slate-200 transition-colors shadow-lg"
          >
            Ask AI About MatchResume →
          </button>
        </div>
      </div>

    </div>
  );
};
