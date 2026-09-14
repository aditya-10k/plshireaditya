import { AgentResponse } from '../types/agent';
import { API_BASE } from '../config/api';

/**
 * Dedicated Agent Client (Protocol 1.0)
 * Connects directly to the dedicated Python Persona & Intelligence Engine.
 * No dummy failsafes: queries the real live backend directly.
 */
export async function queryAgent(
  prompt: string,
  history?: Array<{ role: string; content: string }>
): Promise<AgentResponse> {
  const cleanPrompt = prompt.trim();
  if (!cleanPrompt) {
    return {
      protocolVersion: '1.0',
      text: 'bol bhai kya dekhna he?',
      emotion: 'thinking',
      speech: { enabled: true },
      actions: [{ type: 'SET_EXPRESSION', expression: 'thinking' }],
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000); // 35s timeout to allow Render free tier cold-start waking

  try {
    const payload: { prompt: string; history?: Array<{ role: string; content: string }> } = {
      prompt: cleanPrompt,
    };
    if (history && history.length > 0) {
      payload.history = history;
    }

    const res = await fetch(`${API_BASE}/api/agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data: AgentResponse = await res.json();
      return data;
    } else {
      const errDetail = await res.text();
      throw new Error(`Backend error (${res.status}): ${errDetail}`);
    }
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Inference timed out after 35 seconds. The backend may still be warming up from cold start.');
    }
    throw new Error(`Failed to connect to backend at ${API_BASE}. Make sure the FastAPI server is running: ${err.message || err}`);
  }
}

/**
 * Speech-To-Text Transcriber using Groq Whisper-large-v3-turbo
 * Uploads recorded audio blob to dedicated backend /api/transcribe endpoint.
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.webm');

  const res = await fetch(`${API_BASE}/api/transcribe`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Transcription failed (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.text ? data.text.trim() : '';
}
