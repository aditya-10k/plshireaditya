import React from 'react';

interface QuickPromptsProps {
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
}

const PROMPTS = [
  'Tell me abt doyoularp',
  'Tell me about your projects',
  'Show me your GitHub',
  'Why did you build this?',
];

export const QuickPrompts: React.FC<QuickPromptsProps> = ({
  onSelectPrompt,
  disabled = false,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
      {PROMPTS.map((prompt) => (
        <button
          key={prompt}
          type="button"
          onClick={() => onSelectPrompt(prompt)}
          disabled={disabled}
          className="px-3 py-1.5 rounded-full text-xs font-normal transition-all duration-200 active:scale-95 disabled:opacity-50 backdrop-blur-md border bg-white/60 dark:bg-slate-900/50 hover:bg-white/90 dark:hover:bg-slate-800/80 border-slate-200/70 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-sm"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
};
