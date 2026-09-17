"""
TTS Voice Service using Multi-Provider Neural Engines:
1. ElevenLabs (eleven_multilingual_v2 - Indian English / Hindi female voice, primary)
2. Sarvam AI (bulbul:v3 - Native Indian English & Hinglish, speaker: priya, secondary)
3. Cartesia Sonic (Sub-100ms ultra-low latency streaming)
4. Microsoft Edge-TTS (en-IN-NeerjaNeural Indian female fallback)
Includes local disk caching for instant sub-10ms repeat responses.
"""

from __future__ import annotations

import asyncio
import base64
import hashlib
import io
import logging
import os
import re
import wave
from pathlib import Path
from typing import List, Optional, Tuple

import edge_tts
import requests

logger = logging.getLogger(__name__)

CACHE_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "cache" / "audio"
DEFAULT_VOICE = os.getenv("EDGE_TTS_VOICE", "en-IN-NeerjaNeural")

# Remove emojis and markdown formatting before synthesizing
RE_EMOJI = re.compile(
    r"[\U00010000-\U0010ffff\u2600-\u26ff\u2700-\u27bf]",
    flags=re.UNICODE,
)


class TTSService:
    """
    Studio-grade Neural Speech Synthesis with multi-provider failover.
    Primary: ElevenLabs (eleven_multilingual_v2 with female voice)
    Secondary: Sarvam AI (bulbul:v3 with speaker 'priya')
    Tertiary: Microsoft Edge-TTS (en-IN-NeerjaNeural)
    """

    def __init__(self, cache_dir: Optional[Path] = None):
        self.cache_dir = cache_dir or CACHE_DIR
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.elevenlabs_key = os.getenv(
            "ELEVENLABS_API_KEY",
            "sk_b33f6930ca489b84b892fab4e94580366844e366da327c86",
        )
        self.elevenlabs_voice_id = os.getenv("ELEVENLABS_VOICE_ID", "pFZP5JQG7iQjIQuC4Bku")
        self.sarvam_key = os.getenv("SARVAM_API_KEY")
        self.sarvam_speaker = os.getenv("SARVAM_SPEAKER", "priya")
        self.cartesia_key = os.getenv("CARTESIA_API_KEY")

    def _get_cache_path(self, text: str, ext: str = "mp3", voice: str = "") -> Path:
        """Derive deterministic cache path from text and voice tag."""
        h = hashlib.md5(f"{voice}_{text.strip()}".encode("utf-8")).hexdigest()
        return self.cache_dir / f"{h}.{ext}"

    def clean_text_for_speech(self, text: str) -> str:
        """Strip markdown links, URLs, emojis, and code brackets before synthesizing."""
        cleaned = re.sub(r"https?://\S+", "", text)
        cleaned = re.sub(r"[*_#`~\[\]()]", "", cleaned)
        cleaned = RE_EMOJI.sub("", cleaned)
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        return cleaned

    def _chunk_text(self, text: str, max_chunk_len: int = 450) -> List[str]:
        """
        Split text into natural grammatical sentences/chunks of <= max_chunk_len characters.
        Sarvam AI inputs allow up to 500 characters per item.
        """
        sentences = re.split(r"(?<=[.?!])\s+", text.strip())
        chunks: List[str] = []
        current = ""

        for s in sentences:
            s = s.strip()
            if not s:
                continue
            if len(s) > max_chunk_len:
                words = s.split(" ")
                for w in words:
                    if len(current) + len(w) + 1 > max_chunk_len:
                        if current:
                            chunks.append(current)
                        current = w
                    else:
                        current = f"{current} {w}".strip()
            else:
                if len(current) + len(s) + 1 > max_chunk_len:
                    if current:
                        chunks.append(current)
                    current = s
                else:
                    current = f"{current} {s}".strip()

        if current:
            chunks.append(current)

        return chunks if chunks else [text[:max_chunk_len]]

    def _concat_wav_bytes(self, wav_list: List[bytes]) -> bytes:
        """Seamlessly concatenate multiple WAV streams into a single valid WAV file."""
        if not wav_list:
            return b""
        if len(wav_list) == 1:
            return wav_list[0]

        out_io = io.BytesIO()
        try:
            with wave.open(io.BytesIO(wav_list[0]), "rb") as first_wav:
                params = first_wav.getparams()
                with wave.open(out_io, "wb") as out_wav:
                    out_wav.setparams(params)
                    out_wav.writeframes(first_wav.readframes(first_wav.getnframes()))
                    for next_bytes in wav_list[1:]:
                        try:
                            with wave.open(io.BytesIO(next_bytes), "rb") as next_wav:
                                out_wav.writeframes(next_wav.readframes(next_wav.getnframes()))
                        except Exception as err:
                            logger.warning("Error concatenating WAV frame: %s", err)
            return out_io.getvalue()
        except Exception as err:
            logger.warning("Failed to concatenate WAV streams: %s", err)
            return wav_list[0]

    async def synthesize(self, text: str) -> Tuple[bytes, str]:
        """
        Synthesize speech from text and return (raw_bytes, media_type).
        Order:
        1. ElevenLabs (Multilingual v2 - Indian / multilingual female voice, primary)
        2. Sarvam AI (bulbul:v3 - priya Indian woman voice, secondary)
        3. Cartesia Sonic (optional ultra-low latency streaming)
        4. Microsoft Edge-TTS (en-IN-NeerjaNeural Indian woman fallback)
        """
        clean_text = self.clean_text_for_speech(text)
        if not clean_text:
            clean_text = "ha bolo"

        # Check local disk cache for ElevenLabs first
        cached_mp3 = self._get_cache_path(clean_text, "mp3", self.elevenlabs_voice_id)
        if cached_mp3.exists() and cached_mp3.stat().st_size > 1000:
            return cached_mp3.read_bytes(), "audio/mpeg"

        # 1. Primary: ElevenLabs (eleven_multilingual_v2)
        if self.elevenlabs_key:
            try:
                loop = asyncio.get_event_loop()

                def _call_elevenlabs():
                    url = f"https://api.elevenlabs.io/v1/text-to-speech/{self.elevenlabs_voice_id}"
                    headers = {
                        "xi-api-key": self.elevenlabs_key,
                        "Content-Type": "application/json",
                        "Accept": "audio/mpeg",
                    }
                    payload = {
                        "text": clean_text,
                        "model_id": "eleven_multilingual_v2",
                        "voice_settings": {
                            "stability": 0.5,
                            "similarity_boost": 0.75,
                        },
                    }
                    return requests.post(url, headers=headers, json=payload, timeout=12)

                r = await loop.run_in_executor(None, _call_elevenlabs)
                if r.status_code == 200 and len(r.content) > 1000:
                    cached_mp3.write_bytes(r.content)
                    return r.content, "audio/mpeg"
                logger.warning("ElevenLabs returned %d: %s, falling back to Sarvam AI", r.status_code, r.text[:150])
            except Exception as err:
                logger.warning("ElevenLabs synthesis error: %s, falling back to Sarvam AI", err)

        # Check local disk cache for Sarvam AI
        cached_wav = self._get_cache_path(clean_text, "wav", f"sarvam_{self.sarvam_speaker}")
        if cached_wav.exists() and cached_wav.stat().st_size > 1000:
            return cached_wav.read_bytes(), "audio/wav"

        # 2. Secondary: Sarvam AI (bulbul:v3 with speaker 'priya' for authentic Indian English/Hinglish)
        if self.sarvam_key:
            try:
                loop = asyncio.get_event_loop()
                chunks = self._chunk_text(clean_text, max_chunk_len=450)
                # Sarvam API accepts maximum 3 items per inputs array
                batches = [chunks[i:i + 3] for i in range(0, len(chunks), 3)]

                def _call_sarvam_all() -> List[bytes]:
                    headers = {
                        "api-subscription-key": self.sarvam_key,
                        "Content-Type": "application/json",
                    }
                    wavs: List[bytes] = []
                    for batch in batches:
                        payload = {
                            "inputs": batch,
                            "target_language_code": "en-IN",
                            "speaker": self.sarvam_speaker,
                            "pitch": 0,
                            "pace": 1.18,
                            "loudness": 1.5,
                            "speech_sample_rate": 22050,
                            "enable_preprocessing": True,
                            "model": "bulbul:v3",
                        }
                        r = requests.post(
                            "https://api.sarvam.ai/text-to-speech",
                            headers=headers,
                            json=payload,
                            timeout=15,
                        )
                        if r.status_code == 200:
                            data = r.json()
                            audios = data.get("audios", [])
                            if audios and len(audios[0]) > 500:
                                wavs.append(base64.b64decode(audios[0]))
                            else:
                                logger.warning("Sarvam AI returned empty audio in batch")
                                return []
                        else:
                            logger.warning("Sarvam AI batch returned %d: %s", r.status_code, r.text[:150])
                            return []
                    return wavs

                audio_wavs = await loop.run_in_executor(None, _call_sarvam_all)
                if audio_wavs:
                    combined_wav = self._concat_wav_bytes(audio_wavs)
                    if len(combined_wav) > 1000:
                        cached_wav.write_bytes(combined_wav)
                        return combined_wav, "audio/wav"
            except Exception as err:
                logger.warning("Sarvam AI synthesis error: %s, falling back to Edge-TTS", err)

        # 3. Tertiary: Cartesia Sonic (<100ms ultra-low latency)
        if self.cartesia_key:
            try:
                loop = asyncio.get_event_loop()

                def _call_cartesia():
                    url = "https://api.cartesia.ai/tts/bytes"
                    headers = {
                        "X-API-Key": self.cartesia_key,
                        "Cartesia-Version": "2024-06-10",
                        "Content-Type": "application/json",
                    }
                    payload = {
                        "model_id": "sonic-english",
                        "transcript": clean_text[:500],
                        "voice": {
                            "mode": "id",
                            "id": "a0e99841-438c-4a64-b679-ae501e7d6091",
                        },
                        "output_format": {
                            "container": "wav",
                            "encoding": "pcm_s16le",
                            "sample_rate": 24000,
                        },
                    }
                    return requests.post(url, headers=headers, json=payload, timeout=6)

                r = await loop.run_in_executor(None, _call_cartesia)
                if r.status_code == 200 and len(r.content) > 1000:
                    cache_path = self._get_cache_path(clean_text, "wav", "cartesia")
                    cache_path.write_bytes(r.content)
                    return r.content, "audio/wav"
                logger.warning("Cartesia returned %d: %s", r.status_code, r.text[:150])
            except Exception as err:
                logger.warning("Cartesia synthesis error: %s", err)

        # 4. Quaternary: Microsoft Edge-TTS (en-IN-NeerjaNeural female fallback)
        try:
            cached_edge = self._get_cache_path(clean_text, "mp3", DEFAULT_VOICE)
            if cached_edge.exists() and cached_edge.stat().st_size > 1000:
                return cached_edge.read_bytes(), "audio/mpeg"

            communicate = edge_tts.Communicate(clean_text, DEFAULT_VOICE, rate="+16%")
            chunks = []
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    chunks.append(chunk["data"])
            audio_bytes = b"".join(chunks)
            if audio_bytes:
                cached_edge.write_bytes(audio_bytes)
                return audio_bytes, "audio/mpeg"
        except Exception as err:
            logger.warning("Edge-TTS synthesis error: %s", err)

        return b"", "audio/wav"
