import React, { useState, useRef } from 'react';
import { Mic, MicOff, ArrowUp, Loader2 } from 'lucide-react';
import { transcribeAudio } from '../../agent/agentClient';

interface InputBarProps {
  onSendMessage: (text: string) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
  disabled?: boolean;
}

export const InputBar: React.FC<InputBarProps> = ({
  onSendMessage,
  isListening,
  setIsListening,
  disabled = false,
}) => {
  const [inputText, setInputText] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        fallbackSpeechRecognition();
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all audio tracks to release microphone
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (audioBlob.size > 1000) {
          setIsTranscribing(true);
          try {
            const transcript = await transcribeAudio(audioBlob);
            if (transcript) {
              setInputText(transcript);
              onSendMessage(transcript);
            }
          } catch (err) {
            console.warn('[InputBar] Whisper transcription failed, falling back:', err);
          } finally {
            setIsTranscribing(false);
          }
        }
      };

      mediaRecorder.start(250); // Collect data every 250ms
      setIsListening(true);
    } catch (err) {
      console.warn('[InputBar] getUserMedia error:', err);
      fallbackSpeechRecognition();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsListening(false);
  };

  const fallbackSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsListening(false);
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = navigator.language || 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
          onSendMessage(transcript);
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const toggleMic = () => {
    if (disabled || isTranscribing) return;

    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isListening) {
      stopRecording();
      return;
    }
    if (!inputText.trim() || disabled || isTranscribing) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const hasContent = inputText.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={`relative flex items-center gap-2.5 px-4 py-2.5 rounded-full transition-all duration-300 backdrop-blur-xl border ${
          isListening
            ? 'border-cyan-500/80 ring-2 ring-cyan-500/30 bg-cyan-950/30 shadow-lg'
            : isTranscribing
            ? 'border-indigo-500/60 ring-2 ring-indigo-500/20 bg-indigo-950/20 shadow-lg'
            : 'bg-white/70 dark:bg-slate-900/60 border-slate-200/80 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/20 focus-within:border-slate-400 dark:focus-within:border-white/25'
        }`}
      >
        {/* Minimalist Microphone */}
        <button
          type="button"
          onClick={toggleMic}
          disabled={disabled || isTranscribing}
          className={`p-1.5 rounded-full transition-all duration-200 flex items-center justify-center ${
            isListening
              ? 'text-red-500 animate-pulse bg-red-500/10 scale-110'
              : isTranscribing
              ? 'text-indigo-400 animate-spin'
              : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
          title={isListening ? 'Click to finish speaking' : 'Voice input'}
        >
          {isTranscribing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isListening ? (
            <MicOff className="w-4 h-4 text-red-500" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            isTranscribing
              ? 'Transcribing speech...'
              : isListening
              ? 'Listening... Click mic to stop and send'
              : 'Ask or type something...'
          }
          disabled={disabled || isTranscribing}
          className="w-full bg-transparent text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none disabled:opacity-50"
        />

        {/* Minimalist Send Arrow */}
        <button
          type="submit"
          disabled={(!hasContent && !isListening) || disabled || isTranscribing}
          className={`p-1.5 rounded-full transition-all duration-200 flex items-center justify-center ${
            (hasContent || isListening) && !disabled && !isTranscribing
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
              : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
          }`}
          title={isListening ? 'Send recorded voice' : 'Send'}
        >
          <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>
    </form>
  );
};
