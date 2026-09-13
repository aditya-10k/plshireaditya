import React, { useState } from 'react';
import { ExternalLink, X, CheckCircle2 } from 'lucide-react';
import { GithubIcon } from '../common/Icons';
import { Project } from '../../types';

interface ProjectCardProps {
  project: Project;
  onClose?: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* Mini Card as rendered in the main mockup */}
      <div className="w-72 sm:w-80 rounded-2xl bg-[#0f1422]/90 border border-white/10 shadow-2xl shadow-black/60 backdrop-blur-xl overflow-hidden group transition-all duration-300 hover:border-purple-500/40 hover:shadow-purple-500/10">
        
        {/* Header */}
        <div className="p-4 pb-3 flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-white text-base tracking-tight group-hover:text-purple-300 transition-colors">
              {project.title}
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              {project.subtitle}
            </p>
          </div>

          <a
            href={project.demoUrl || project.githubUrl || '#'}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            title="Open Link"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Preview Thumbnail */}
        <div 
          onClick={() => setShowModal(true)}
          className="relative px-3 cursor-pointer overflow-hidden"
        >
          <div className="relative rounded-xl overflow-hidden border border-white/5 bg-[#0a0d16]">
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-36 object-cover object-top transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/sprites/hero_cloud.png';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1422] via-transparent to-transparent opacity-60" />
            
            {/* Hover overlay hint */}
            <div className="absolute inset-0 bg-purple-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="px-3 py-1 bg-black/70 backdrop-blur-md rounded-full text-xs font-medium text-white border border-white/20">
                Click to inspect
              </span>
            </div>
          </div>
        </div>

        {/* Card Footer Button */}
        <div className="p-3">
          <button
            onClick={() => setShowModal(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-[#171e30] hover:bg-[#202942] border border-white/5 hover:border-purple-500/30 text-xs font-medium text-slate-200 hover:text-white transition-all duration-200 text-center shadow-inner"
          >
            View Project
          </button>
        </div>

      </div>

      {/* Detail Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-[#0d111d] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/50 overflow-hidden">
            
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
            
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Content */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Featured Project
                  </span>
                  {project.matchScore && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Match Score: {project.matchScore}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {project.title}
                </h2>
                <p className="text-sm text-slate-400">
                  {project.subtitle}
                </p>
              </div>

              {/* Preview Image */}
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full max-h-64 object-cover object-top"
                />
              </div>

              {/* Description */}
              <p className="text-sm text-slate-300 leading-relaxed">
                {project.description}
              </p>

              {/* Highlights */}
              {project.highlights && project.highlights.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Key Highlights
                  </h4>
                  <ul className="space-y-1.5">
                    {project.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-2 pt-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-800/80 text-slate-300 border border-white/5"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 transition-all"
                  >
                    <span>Live Demo</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-slate-200 hover:text-white border border-white/10 transition-all"
                  >
                    <GithubIcon className="w-4 h-4" />
                    <span>View Code</span>
                  </a>
                )}
              </div>

            </div>

          </div>
        </div>
      )}
    </>
  );
};
