import { useState, useRef, useEffect } from 'react';
import { transcribeAudio } from '../agent/agentClient';

interface UseMeetVoiceInputOptions {
  onTranscript: (text: string) => void;
  isEnabled: boolean;
  sharedStream?: MediaStream | null;
}

/**
 * Continuous Voice Input with Dual-Engine:
 * 1. Primary: Browser SpeechRecognition with 1.2s silence auto-commit (instant, zero network latency)
 * 2. Fallback: MediaRecorder + Groq Whisper-large-v3-turbo on backend /api/transcribe (resilient across network / platform restrictions)
 */
export const useMeetVoiceInput = ({
  onTranscript,
  isEnabled,
  sharedStream,
}: UseMeetVoiceInputOptions) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const isEnabledRef = useRef<boolean>(isEnabled);
  const onTranscriptRef = useRef(onTranscript);
  const sharedStreamRef = useRef<MediaStream | null>(sharedStream || null);

  const isListeningWantedRef = useRef<boolean>(false);
  const silenceTimerRef = useRef<any>(null);
  const accumulatedTextRef = useRef<string>('');
  const recognitionRef = useRef<any>(null);
  const useFallbackRef = useRef<boolean>(false);

  // VAD MediaRecorder fallback refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const internalStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const vadIntervalRef = useRef<any>(null);
  const hasSpokenRef = useRef<boolean>(false);
  const lastSpeechTimeRef = useRef<number>(0);

  useEffect(() => {
    isEnabledRef.current = isEnabled;
    if (!isEnabled && isListeningWantedRef.current) {
      stopListening();
    }
  }, [isEnabled]);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    sharedStreamRef.current = sharedStream || null;
  }, [sharedStream]);

  const commitTranscript = (text: string) => {
    const clean = text.trim();
    if (clean.length >= 2) {
      onTranscriptRef.current(clean);
    }
    accumulatedTextRef.current = '';
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    // Cleanly abort current recognition session so interim buffers are wiped and no duplicate turns fire
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (_) {}
    }
  };

  const startListening = () => {
    if (!isEnabledRef.current) return;
    isListeningWantedRef.current = true;

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognitionClass && !useFallbackRef.current) {
      startBrowserSpeechRecognition(SpeechRecognitionClass);
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
        recognitionRef.current = null;
      }

      const recognition = new SpeechRecognitionClass();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      // Prefer user's browser language, fallback to en-IN for Indian English & tech terms
      try {
        recognition.lang = navigator.language || 'en-IN';
      } catch (_) {
        recognition.lang = 'en-US';
      }

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        if (!isEnabledRef.current || !isListeningWantedRef.current) return;

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
          accumulatedTextRef.current = (
            accumulatedTextRef.current + ' ' + finalChunk
          ).trim();
        }

        const candidateText = (accumulatedTextRef.current + ' ' + interim).trim();

        if (candidateText) {
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }

          // Automatically commit after 1.2s silence pause
          silenceTimerRef.current = setTimeout(() => {
            if (isEnabledRef.current && isListeningWantedRef.current && candidateText) {
              commitTranscript(candidateText);
            }
          }, 1200);
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error === 'no-speech' || e.error === 'aborted') return;

        // If SpeechRecognition hits network/driver/permission issues in deployed environment, smoothly switch to Whisper VAD
        if (
          e.error === 'network' ||
          e.error === 'audio-capture' ||
          e.error === 'not-allowed' ||
          e.error === 'service-not-allowed'
        ) {
          useFallbackRef.current = true;
          try {
            recognition.abort();
          } catch (_) {}
          recognitionRef.current = null;
          startMediaRecorderVAD();
        }
      };

      recognition.onend = () => {
        // Only restart if listening is actively desired and not switched to fallback
        if (isListeningWantedRef.current && isEnabledRef.current && !useFallbackRef.current) {
          try {
            recognition.start();
          } catch (_) {}
        } else {
          setIsRecording(false);
        }
      };

      recognition.start();
      setIsRecording(true);
    } catch (_) {
      useFallbackRef.current = true;
      startMediaRecorderVAD();
    }
  };

  const startMediaRecorderVAD = async () => {
    try {
      // Use existing shared stream from visualizer to avoid dual microphone locks on Windows
      let stream = sharedStreamRef.current;
      if (!stream || !stream.active) {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        internalStreamRef.current = stream;
      }

      audioChunksRef.current = [];

      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      if (ctx.state === 'suspended') {
        await ctx.resume().catch(() => {});
      }

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.3;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
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

        if (audioBlob.size > 2500 && hasSpokenRef.current) {
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

        // Restart recording segment if user is still unmuted
        if (
          isListeningWantedRef.current &&
          isEnabledRef.current &&
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state === 'inactive'
        ) {
          try {
            mediaRecorderRef.current.start(250);
          } catch (_) {}
        }
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      hasSpokenRef.current = false;

      // Monitor frequency data every 100ms for Voice Activity
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      vadIntervalRef.current = setInterval(() => {
        if (!analyserRef.current || !isEnabledRef.current || !isListeningWantedRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let voiceSum = 0;
        let voiceCount = 0;
        for (let i = 2; i < Math.min(45, dataArray.length); i++) {
          voiceSum += dataArray[i];
          voiceCount++;
        }
        const voiceAvg = voiceCount > 0 ? voiceSum / voiceCount : 0;
        const now = Date.now();

        if (voiceAvg > 5.5) {
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
    isListeningWantedRef.current = false;

    if (accumulatedTextRef.current && accumulatedTextRef.current.trim()) {
      commitTranscript(accumulatedTextRef.current);
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

    if (internalStreamRef.current) {
      internalStreamRef.current.getTracks().forEach((track) => track.stop());
      internalStreamRef.current = null;
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
