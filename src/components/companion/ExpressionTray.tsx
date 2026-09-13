import React, { useState } from 'react';
import { Smile, X, ChevronUp, ChevronDown } from 'lucide-react';
import { EmotionState } from '../../types';

interface ExpressionTrayProps {
  currentEmotion: EmotionState;
  onSelectEmotion: (emotion: EmotionState) => void;
}

const ALL_EMOTIONS: { id: EmotionState; label: string }[] = [
  { id: 'idle', label: 'Idle' },
  { id: 'happy', label: 'Happy' },
  { id: 'excited', label: 'Excited' },
  { id: 'thinking', label: 'Thinking' },
  { id: 'curious', label: 'Curious' },
  { id: 'listening', label: 'Listening' },
  { id: 'speaking', label: 'Speaking' },
  { id: 'surprised', label: 'Surprised' },
  { id: 'confused', label: 'Confused' },
  { id: 'realizing', label: 'Realizing' },
  { id: 'agreeing', label: 'Agreeing' },
  { id: 'disagreeing', label: 'Disagreeing' },
  { id: 'skeptical', label: 'Skeptical' },
  { id: 'sad', label: 'Sad' },
  { id: 'frustrated', label: 'Frustrated' },
  { id: 'laughing', label: 'Laughing' },
  { id: 'serious', label: 'Serious' },
  { id: 'sleepy', label: 'Sleepy' },
  { id: 'focused', label: 'Focused' },
  { id: 'greeting', label: 'Greeting' },
];

export const ExpressionTray: React.FC<ExpressionTrayProps> = ({
  currentEmotion,
  onSelectEmotion,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 left-6 z-40">
      {/* Toggle Pill */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#141928]/90 hover:bg-[#1f263c] border border-white/10 text-xs font-medium text-slate-300 hover:text-white shadow-xl backdrop-blur-md transition-all group"
      >
        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
        <span>Expression: <span className="capitalize text-purple-300 font-semibold">{currentEmotion}</span></span>
        {isOpen ? (
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
        ) : (
          <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
        )}
      </button>

      {/* Grid Drawer */}
      {isOpen && (
        <div className="absolute bottom-12 left-0 w-80 p-4 rounded-3xl bg-[#0e1220]/95 border border-white/10 shadow-2xl backdrop-blur-xl animate-fadeIn z-50">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <div className="flex items-center gap-1.5">
              <Smile className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-semibold text-white">20 Avatar Expressions</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-1">
            {ALL_EMOTIONS.map((item) => {
              const isSelected = currentEmotion === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectEmotion(item.id);
                  }}
                  className={`flex flex-col items-center p-2 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-purple-600/20 border-purple-500 shadow-md shadow-purple-500/20'
                      : 'bg-[#161c2e]/60 border-white/5 hover:border-white/20 hover:bg-[#1f263c]'
                  }`}
                >
                  <img
                    src={`/sprites/${item.id}.png`}
                    alt={item.label}
                    className="w-10 h-8 object-contain"
                  />
                  <span className={`text-[10px] mt-1 font-medium capitalize truncate w-full text-center ${
                    isSelected ? 'text-purple-300' : 'text-slate-400'
                  }`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
