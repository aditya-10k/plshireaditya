import React from 'react';
import { X, MonitorUp, Smartphone, FileText, ArrowRight } from 'lucide-react';
import { PROJECTS } from '../../data/projects';

interface MeetPresentPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (url: string, title: string, isMobile?: boolean) => void;
}

export const MeetPresentPickerModal: React.FC<MeetPresentPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectProject,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-3xl bg-[#202124] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MonitorUp className="w-5 h-5 text-[#8ab4f8]" />
            <h3 className="text-base font-medium text-white tracking-tight">
              Present a Project or Document
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Presentable Projects */}
        <div className="p-6 overflow-y-auto space-y-3">
          <p className="text-xs text-slate-400 mb-2">
            Select a project or verified resume to share directly onto the center Google Meet presentation stage:
          </p>

          {/* Resume Option */}
          <button
            onClick={() => {
              onSelectProject('/Aditya_Kathe_Resume.pdf', 'Aditya Kathe — Resume PDF', false);
              onClose();
            }}
            className="w-full p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-between transition-all group text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                  Aditya Kathe — Verified Resume
                </div>
                <div className="text-xs text-slate-400">Complete SDE & AI Systems Document (PDF)</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </button>

          {/* Project Cards */}
          {PROJECTS.map((proj) => {
            const isJack = proj.id === 'jackdsql';
            return (
              <button
                key={proj.id}
                onClick={() => {
                  onSelectProject(proj.demoUrl || '', `${proj.title} — Live App`, isJack);
                  onClose();
                }}
                className="w-full p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-between transition-all group text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[#8ab4f8]">
                    {isJack ? <Smartphone className="w-5 h-5" /> : <MonitorUp className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white group-hover:text-[#8ab4f8] transition-colors">
                        {proj.title}
                      </span>
                      {isJack && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          Mobile Orientation
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 line-clamp-1">{proj.subtitle}</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
