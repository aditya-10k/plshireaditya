/**
 * Dual-Mode Neural & Client TTS Adapter
 * 1. Primary: Studio Neural Voice via backend /api/tts (Sarvam AI / Cartesia / Edge-TTS)
 *    - Authentic native Indian English / Hinglish voice (speaker: aditya)
 *    - True continuous audio with perfect mathematical ontimeupdate progress synchronization
 * 2. Fallback: Resilient Web Speech API with Chromium GC and pause protections
 */

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

declare global {
  interface Window {
    __ttsActiveUtterances?: Set<SpeechSynthesisUtterance>;
  }
}

if (typeof window !== 'undefined') {
  window.__ttsActiveUtterances = window.__ttsActiveUtterances || new Set();
}

class TTSAdapter {
  private currentAudio: HTMLAudioElement | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  public isEnabled: boolean = true;
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private resumeTimer: any = null;
  private cancelTimeout: any = null;
  private currentSessionId: number = 0;
  private currentBlobUrl: string | null = null;

  constructor() {
    this.initVoices();
  }

  private initVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.cachedVoices = window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.cachedVoices = window.speechSynthesis.getVoices();
      };
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    if (this.cachedVoices.length === 0) {
      this.cachedVoices = window.speechSynthesis.getVoices();
    }
    return this.cachedVoices;
  }

  public getBestVoice(): SpeechSynthesisVoice | null {
    const voices = this.getVoices();
    if (!voices || voices.length === 0) return null;

    const indianVoice = voices.find((v) => {
      const name = v.name.toLowerCase();
      const lang = v.lang.toLowerCase();
      return (
        lang === 'en-in' ||
        lang === 'en_in' ||
        name.includes('india') ||
        name.includes('prabhat') ||
        name.includes('neerja') ||
        name.includes('ravi') ||
        name.includes('heera')
      );
    });
    if (indianVoice) return indianVoice;

    const naturalVoice = voices.find((v) => {
      const name = v.name.toLowerCase();
      const lang = v.lang.toLowerCase();
      return lang.startsWith('en') && (name.includes('natural') || name.includes('online') || name.includes('google'));
    });
    if (naturalVoice) return naturalVoice;

    return voices.find((v) => v.lang.toLowerCase().startsWith('en')) || voices[0] || null;
  }

  public speak(
    text: string,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: () => void,
    onBoundary?: (charIndex: number) => void
  ) {
    this.stop();

    if (!this.isEnabled) {
      onEnd?.();
      return;
    }

    const cleanText = text
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[*_#`~\[\]()]/g, '')
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F270}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) {
      onEnd?.();
      return;
    }

    const sessionId = ++this.currentSessionId;

    // 1. Primary: Full-length Studio Neural Voice via backend POST /api/tts
    const fetchAndPlay = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/tts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: cleanText }),
        });

        if (this.currentSessionId !== sessionId) return;

        if (!response.ok) {
          throw new Error(`TTS server returned ${response.status}`);
        }

        const blob = await response.blob();
        if (this.currentSessionId !== sessionId) return;

        if (!blob || blob.size < 500) {
          throw new Error('TTS returned empty audio');
        }

        const blobUrl = URL.createObjectURL(blob);
        this.currentBlobUrl = blobUrl;
        const audio = new Audio(blobUrl);
        audio.playbackRate = 1.08;
        this.currentAudio = audio;

        let started = false;
        audio.onplay = () => {
          if (this.currentSessionId !== sessionId) return;
          started = true;
          onStart?.();
        };

        audio.ontimeupdate = () => {
          if (this.currentSessionId !== sessionId) return;
          if (audio.duration && audio.duration > 0) {
            const progress = audio.currentTime / audio.duration;
            const charIndex = Math.min(cleanText.length, Math.floor(progress * cleanText.length));
            onBoundary?.(charIndex);
          }
        };

        audio.onended = () => {
          if (this.currentBlobUrl === blobUrl) {
            URL.revokeObjectURL(blobUrl);
            this.currentBlobUrl = null;
          }
          if (this.currentSessionId === sessionId) {
            this.currentAudio = null;
            onEnd?.();
          }
        };

        audio.onerror = () => {
          if (this.currentBlobUrl === blobUrl) {
            URL.revokeObjectURL(blobUrl);
            this.currentBlobUrl = null;
          }
          if (this.currentSessionId !== sessionId) return;
          if (!started) {
            console.info('[TTSAdapter] Backend neural voice unavailable, falling back to Web Speech API');
            this.currentAudio = null;
            this.speakWithBrowserSpeech(cleanText, onStart, onEnd, onError, onBoundary);
          } else {
            this.currentAudio = null;
            onError?.();
          }
        };

        await audio.play();
      } catch (err) {
        if (this.currentSessionId !== sessionId) return;
        console.info('[TTSAdapter] Backend neural voice fetch failed, falling back to Web Speech API:', err);
        this.speakWithBrowserSpeech(cleanText, onStart, onEnd, onError, onBoundary);
      }
    };

    fetchAndPlay();
  }

  private speakWithBrowserSpeech(
    cleanText: string,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: () => void,
    onBoundary?: (charIndex: number) => void
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }

    try {
      window.speechSynthesis.cancel();

      this.cancelTimeout = setTimeout(() => {
        try {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }

          const utterance = new SpeechSynthesisUtterance(cleanText);
          this.currentUtterance = utterance;

          if (window.__ttsActiveUtterances) {
            window.__ttsActiveUtterances.add(utterance);
          }

          const selectedVoice = this.getBestVoice();
          if (selectedVoice) {
            utterance.voice = selectedVoice;
            utterance.lang = selectedVoice.lang;
          } else {
            utterance.lang = navigator.language || 'en-US';
          }

          utterance.rate = 1.15;
          utterance.pitch = 1.0;

          this.startHeartbeat();

          utterance.onstart = () => {
            onStart?.();
          };

          utterance.onboundary = (e) => {
            if (e.name === 'word' || typeof e.charIndex === 'number') {
              onBoundary?.(e.charIndex);
            }
          };

          const cleanup = () => {
            this.stopHeartbeat();
            if (window.__ttsActiveUtterances) {
              window.__ttsActiveUtterances.delete(utterance);
            }
            if (this.currentUtterance === utterance) {
              this.currentUtterance = null;
            }
          };

          utterance.onend = () => {
            cleanup();
            onEnd?.();
          };

          utterance.onerror = (e) => {
            cleanup();
            if (e.error !== 'interrupted' && e.error !== 'canceled') {
              console.warn('[TTSAdapter] Speech error:', e.error);
            }
            onError?.();
          };

          window.speechSynthesis.speak(utterance);
        } catch {
          this.stopHeartbeat();
          this.currentUtterance = null;
          onError?.();
        }
      }, 40);
    } catch {
      this.currentUtterance = null;
      onError?.();
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.resumeTimer = setInterval(() => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (window.speechSynthesis.speaking && window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }
    }, 2500);
  }

  private stopHeartbeat() {
    if (this.resumeTimer) {
      clearInterval(this.resumeTimer);
      this.resumeTimer = null;
    }
  }

  public stop() {
    this.currentSessionId++;
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (_) {}
      this.currentAudio = null;
    }
    if (this.cancelTimeout) {
      clearTimeout(this.cancelTimeout);
      this.cancelTimeout = null;
    }
    this.stopHeartbeat();
    if (this.currentUtterance) {
      if (typeof window !== 'undefined' && window.__ttsActiveUtterances) {
        window.__ttsActiveUtterances.delete(this.currentUtterance);
      }
      this.currentUtterance = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public isSpeaking(): boolean {
    return (
      (this.currentAudio !== null && !this.currentAudio.paused) ||
      this.currentUtterance !== null
    );
  }

  public toggleSound(): boolean {
    this.isEnabled = !this.isEnabled;
    if (!this.isEnabled) {
      this.stop();
    }
    return this.isEnabled;
  }

  public setSoundEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  public isAvailable(): boolean {
    return true;
  }
}

export const tts = new TTSAdapter();
