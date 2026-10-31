import React, { useState, useRef, useEffect } from 'react';
import { X, Send, MessageSquare } from 'lucide-react';
import { Message } from '../../types';

interface MeetChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  onSendMessage: (text: string) => void;
  isThinking: boolean;
  onSelectPrompt: (prompt: string) => void;
  inFlow?: boolean;
}

export const MeetChatDrawer: React.FC<MeetChatDrawerProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  isThinking,
  onSelectPrompt,
  inFlow = false,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || isThinking) return;
    onSendMessage(text);
    setInputText('');
  };

  if (!isOpen) return null;

  return (
    <aside
      className={
        inFlow
          ? 'h-full w-full bg-[#1e1f20] rounded-2xl border border-white/[0.08] shadow-2xl flex flex-col justify-between overflow-hidden select-none font-sans'
          : 'fixed inset-0 sm:hidden z-50 bg-[#1e1f20] flex flex-col justify-between select-none font-sans'
      }
    >
      {/* Drawer Header matching Photo 4 */}
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between shrink-0">
        <h2 className="text-base font-normal text-white tracking-tight">In-call messages</h2>
        <button
          onClick={onClose}
          className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Close chat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Notice Card matching Photo 4 */}
      <div className="px-4 pt-3 pb-2 shrink-0">
        <div className="p-3 rounded-xl bg-[#282a2d] border border-white/5 text-xs text-slate-300 space-y-1 leading-relaxed">
          <div className="flex items-center gap-2 font-medium text-white text-[13px]">
            <MessageSquare className="w-4 h-4 text-[#8ab4f8]" />
            <span>Continuous chat is turned off</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Messages are visible to participants in this meeting and won't be saved when the call ends.
          </p>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="px-4 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        {[
          'Walk me through your projects',
          'Show me JackDSQL',
          'Show me MatchResume',
          'Tell me about SVKM EduConnect',
        ].map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(prompt)}
            disabled={isThinking}
            className="shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-cyan-300 border border-cyan-500/20 transition-all disabled:opacity-40"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Scrollable Message History */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-2 space-y-3 font-sans text-sm">
        {messages.map((m) => {
          const isMe = m.sender === 'user';
          return (
            <div key={m.id} className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${isMe ? 'text-[#8ab4f8]' : 'text-emerald-400'}`}>
                  {isMe ? 'You' : 'Aditya Kathe'}
                </span>
                <span className="text-[10px] text-slate-500">{m.timestamp}</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#282a2d] text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap border border-white/5">
                {m.text}
              </div>
            </div>
          );
        })}

        {isThinking && (
          <div className="space-y-1">
            <span className="text-xs font-semibold text-emerald-400">Aditya Kathe</span>
            <div className="p-3 rounded-2xl bg-[#282a2d] flex items-center gap-2 text-xs text-slate-400 border border-white/5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>Aditya is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar Form matching Photo 4 */}
      <form
        onSubmit={handleSubmit}
        className="p-3 border-t border-white/[0.06] bg-[#1e1f20] shrink-0"
      >
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#282a2d] border border-white/10 focus-within:border-[#8ab4f8] transition-colors">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Send a message"
            disabled={isThinking}
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isThinking}
            className="p-1.5 rounded-full text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
            title="Send message"
          >
            <Send className="w-4 h-4 text-[#8ab4f8]" />
          </button>
        </div>
      </form>
    </aside>
  );
};
