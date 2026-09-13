import React from 'react';
import { X } from 'lucide-react';
import { GithubIcon, ExternalLinkIcon } from '../common/Icons';
import { ProjectManifest } from '../../types/projects';
import { MatchResumeDemo } from '../../projects/matchresume/MatchResumeDemo';

interface ProjectWindowProps {
  project: ProjectManifest;
  demoId?: string;
  onClose: () => void;
}

export const ProjectWindow: React.FC<ProjectWindowProps> = ({
  project,
  demoId,
  onClose,
}) => {
  return (
    <div className="w-full rounded-3xl bg-[#0d121e]/95 border border-white/10 shadow-2xl backdrop-blur-2xl overflow-hidden animate-fadeIn transition-all">
      
      {/* Window Title Bar */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#111728]/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="font-bold text-white text-base tracking-tight">
              {project.name}
            </h3>
          </div>
          {project.subtitle && (
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {project.subtitle}
            </p>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {project.links.github && (
            <a
              href={project.links.github}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title="GitHub Repository"
            >
              <GithubIcon className="w-4 h-4" />
            </a>
          )}
          {project.links.live && (
            <a
              href={project.links.live}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Live Link"
            >
              <ExternalLinkIcon className="w-4 h-4" />
            </a>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-1"
            title="Close Project Window"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Window Body */}
      <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
        
        {/* Project Description */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {project.description}
        </p>

        {/* Technology Badges */}
        <div className="flex flex-wrap gap-1.5">
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#161e33] text-slate-300 border border-white/5"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Embed Live Demo if project is MatchResume */}
        {project.id === 'matchresume' ? (
          <div className="pt-2 border-t border-white/10">
            <MatchResumeDemo autoRun={demoId === 'matching'} />
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-[#0f1422] border border-white/10 text-center space-y-2">
            <h4 className="text-sm font-semibold text-white">Larp Detector On-Chain Verification</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Inspect on-chain transactions and GitHub commit velocity to authenticate developer claims.
            </p>
          </div>
        )}

      </div>

    </div>
  );
};
