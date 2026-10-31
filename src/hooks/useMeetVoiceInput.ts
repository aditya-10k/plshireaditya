import { useState, useRef, useEffect } from 'react';
import { transcribeAudio } from '../agent/agentClient';

interface UseMeetVoiceInputOptions {
  onTranscript: (text: string) => void;
  isEnabled: boolean;
}

/**
 * Continuous Voice Input with Voice Activity Detection (VAD) & Silence Auto-Commit.
 * Automatically processes speech after 1.2s pause without requiring the user to mute.
 */
export const useMeetVoiceInput = ({ onTranscript, isEnabled }: UseMeetVoiceInputOptions) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const isEnabledRef = useRef<boolean>(isEnabled);
  const onTranscriptRef = useRef(onTranscript);
  const silenceTimerRef = useRef<any>(null);
  const accumulatedTranscriptRef = useRef<string>('');
  const recognitionRef = useRef<any>(null);

  // VAD MediaRecorder fallback refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const vadIntervalRef = useRef<any>(null);
  const hasSpokenRef = useRef<boolean>(false);
  const lastSpeechTimeRef = useRef<number>(0);

  useEffect(() => {
    isEnabledRef.current = isEnabled;
  }, [isEnabled]);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  const commitTranscript = (text: string) => {
    const clean = text.trim();
    if (clean.length > 2) {
      onTranscriptRef.current(clean);
    }
    accumulatedTranscriptRef.current = '';
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  const startListening = () => {
    if (!isEnabledRef.current) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      startBrowserSpeechRecognition(SpeechRecognition);
    } else {
      startMediaRecorderVAD();
    }
  };

  const startBrowserSpeechRecognition = (SpeechRecognitionClass: any) => {
    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }

      const recognition = new SpeechRecognitionClass();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Optimal for Indian English, English, and Hinglish speech

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        if (!isEnabledRef.current) return;

        let interim = '';
        let finalChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          const transcript = item[0]?.transcript || '';
          if (item.isFinal) {
            finalChunk += transcript + ' ';
          } else {
            interim += transcript;
          }
        }

        if (finalChunk) {
          accumulatedTranscriptRef.current = (
            accumulatedTranscriptRef.current + ' ' + finalChunk
          ).trim();
        }

        const candidateText = (accumulatedTranscriptRef.current + ' ' + interim).trim();

        // Reset silence timer on every detected speech fragment
        if (candidateText) {
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }

          // Automatically commit after 1.2 seconds of silence (no muting needed)
          silenceTimerRef.current = setTimeout(() => {
            if (isEnabledRef.current && candidateText) {
              commitTranscript(candidateText);
            }
          }, 1200);
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error === 'no-speech' || e.error === 'aborted') return;
        console.warn('[useMeetVoiceInput] recognition warning:', e.error);
      };

      recognition.onend = () => {
        // Auto-restart continuous recognition if mic is still unmuted
        if (isEnabledRef.current) {
          try {
            recognition.start();
          } catch (_) {}
        } else {
          setIsRecording(false);
        }
      };

      recognition.start();
    } catch (err) {
      console.warn('[useMeetVoiceInput] Failed to start SpeechRecognition, fallback to VAD:', err);
      startMediaRecorderVAD();
    }
  };

  const startMediaRecorderVAD = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];

      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        audioChunksRef.current = [];

        if (audioBlob.size > 2000 && hasSpokenRef.current) {
          setIsTranscribing(true);
          try {
            const transcript = await transcribeAudio(audioBlob);
            if (transcript && transcript.trim()) {
              commitTranscript(transcript.trim());
            }
          } catch (err) {
            console.warn('[useMeetVoiceInput] Whisper VAD transcription error:', err);
          } finally {
            setIsTranscribing(false);
          }
        }

        hasSpokenRef.current = false;

        // Restart recording segment if still enabled
        if (isEnabledRef.current && mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
          try {
            mediaRecorderRef.current.start(250);
          } catch (_) {}
        }
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      hasSpokenRef.current = false;

      // Monitor volume level every 100ms for Voice Activity Detection
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      vadIntervalRef.current = setInterval(() => {
        if (!analyserRef.current || !isEnabledRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        const avg = sum / dataArray.length;
        const normalized = avg / 60;
        const now = Date.now();

        if (normalized > 0.08) {
          hasSpokenRef.current = true;
          lastSpeechTimeRef.current = now;
        } else if (hasSpokenRef.current && now - lastSpeechTimeRef.current > 1200) {
          // 1.2s silence after speech detected -> auto-commit audio segment
          hasSpokenRef.current = false;
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            try {
              mediaRecorderRef.current.stop();
            } catch (_) {}
          }
        }
      }, 100);
    } catch (err) {
      console.warn('[useMeetVoiceInput] getUserMedia VAD error:', err);
      setIsRecording(false);
    }
  };

  const stopListening = () => {
    // If pending transcript exists when stopping, commit it immediately
    if (accumulatedTranscriptRef.current && accumulatedTranscriptRef.current.trim()) {
      commitTranscript(accumulatedTranscriptRef.current);
    }

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (vadIntervalRef.current) {
      clearInterval(vadIntervalRef.current);
      vadIntervalRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (_) {}
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (_) {}
      mediaRecorderRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }

    setIsRecording(false);
  };

  return {
    isRecording,
    isTranscribing,
    startListening,
    stopListening,
  };
};
