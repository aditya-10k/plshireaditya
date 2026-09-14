/**
 * Centralized API Base URL Resolver
 * - Honors VITE_API_URL if provided
 * - Automatically falls back to live Render backend on production hosts
 * - Defaults to localhost:8000 in local dev
 */
export function getApiBaseUrl(): string {
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    return 'https://plshireaditya.onrender.com';
  }

  return 'http://localhost:8000';
}

export const API_BASE = getApiBaseUrl();
