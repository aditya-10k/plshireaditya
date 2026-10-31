import { useState, useEffect, useRef } from 'react';

/**
 * Hook to monitor live microphone volume and human speech for visual feedback.
 * Includes AudioContext resume safeguards and vocal frequency filtering.
 */
export function useMicVisualizer(isMicOn: boolean) {
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [isVoiceDetected, setIsVoiceDetected] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    let isCancelled = false;

    if (!isMicOn) {
      setAudioLevel(0);
      setIsVoiceDetected(false);
      setStream(null);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
        micStreamRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      return;
    }

    const initAudio = async () => {
      try {
        const userStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: false,
        });

        if (isCancelled) {
          userStream.getTracks().forEach((t) => t.stop());
          return;
        }

        micStreamRef.current = userStream;
        setStream(userStream);

        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioContextRef.current = ctx;

        // Auto-resume AudioContext on creation and user interactions
        if (ctx.state === 'suspended') {
          await ctx.resume().catch(() => {});
        }

        const resumeCtx = () => {
          if (ctx && ctx.state === 'suspended') {
            ctx.resume().catch(() => {});
          }
        };

        window.addEventListener('click', resumeCtx, { passive: true });
        window.addEventListener('touchstart', resumeCtx, { passive: true });

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.3;
        analyserRef.current = analyser;

        const source = ctx.createMediaStreamSource(userStream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        let silenceCount = 0;

        const checkVolume = () => {
          if (isCancelled || !analyserRef.current) return;

          if (ctx.state === 'suspended') {
            ctx.resume().catch(() => {});
          }

          analyserRef.current.getByteFrequencyData(dataArray);

          // Focus on human vocal frequencies (bins 2 to 45: ~150Hz - 3.8kHz)
          let voiceSum = 0;
          let voiceCount = 0;
          for (let i = 2; i < Math.min(45, dataArray.length); i++) {
            voiceSum += dataArray[i];
            voiceCount++;
          }
          const voiceAvg = voiceCount > 0 ? voiceSum / voiceCount : 0;

          // Normalized volume 0 to 1 for visualizer bar heights
          const normalized = Math.min(1, Math.max(0, (voiceAvg - 1.5) / 35));
          setAudioLevel(normalized);

          // Human speech activity threshold
          const isSpeech = voiceAvg > 5.5;
          if (isSpeech) {
            silenceCount = 0;
            setIsVoiceDetected(true);
          } else {
            silenceCount++;
            // 10 frames (~160ms) hysteresis prevents visualizer flickering between syllables
            if (silenceCount > 10) {
              setIsVoiceDetected(false);
            }
          }

          animationFrameRef.current = requestAnimationFrame(checkVolume);
        };

        checkVolume();
      } catch (err) {
        // Microphone access denied or not yet permitted
        setAudioLevel(0);
        setIsVoiceDetected(false);
        setStream(null);
      }
    };

    initAudio();

    return () => {
      isCancelled = true;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
        micStreamRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, [isMicOn]);

  return { audioLevel, isVoiceDetected, stream };
}
