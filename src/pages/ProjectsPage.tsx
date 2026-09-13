import React, { useState } from 'react';
import { ExternalLink, Sparkles, Bot, Search } from 'lucide-react';
import { GithubIcon } from '../components/common/Icons';
import { PROJECTS } from '../data/projects';
import { NavTab } from '../types';

interface ProjectsPageProps {
  setActiveTab: (tab: NavTab) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ setActiveTab }) => {
  const [filter, setFilter] = useState<'all' | 'ai' | 'web3' | 'fullstack'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = PROJECTS.filter((p) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'ai' && (p.tags.includes('NLP') || p.tags.includes('LangChain'))) ||
      (filter === 'web3' && (p.tags.includes('Solidity') || p.tags.includes('EVM'))) ||
      (filter === 'fullstack' && p.tags.includes('React'));

    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      
      {/* Header */}
      <div className="space-y-4 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-300">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Showcase</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
          Featured Projects &amp; Lab Work
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          Production systems, AI experiments, and open-source packages engineered by Aditya.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Category filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {[
            { id: 'all', label: 'All Projects' },
            { id: 'ai', label: 'AI & NLP' },
            { id: 'web3', label: 'Web3 & Security' },
            { id: 'fullstack', label: 'Full Stack' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                filter === item.id
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                  : 'bg-[#121626] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#121626] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="rounded-3xl bg-[#0f1422] border border-white/10 overflow-hidden flex flex-col justify-between group hover:border-purple-500/40 transition-all duration-300 shadow-xl"
          >
            <div>
              {/* Image */}
              <div className="relative h-48 overflow-hidden bg-black/50">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f1422] via-transparent to-transparent" />
                {project.matchScore && (
                  <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                    ATS Match: {project.matchScore}
                  </span>
                )}
              </div>

              {/* Body */}
              <div className="p-6 space-y-3">
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-xs font-medium text-slate-400">
                    {project.subtitle}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3">
                  {project.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#161d30] text-slate-300 border border-white/5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-6 pt-0 flex items-center justify-between border-t border-white/5 mt-4">
              <button
                onClick={() => setActiveTab('chat')}
                className="flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Ask AI in Chat</span>
              </button>

              <div className="flex items-center gap-2">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    title="GitHub"
                  >
                    <GithubIcon className="w-4 h-4" />
                  </a>
                )}
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    title="Live Demo"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
