/**
 * Centralized API Base URL Resolver
 * - Points directly to production Render backend (https://plshireaditya.onrender.com)
 * - Supports VITE_API_URL override if explicitly provided
 */
export function getApiBaseUrl(): string {
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // Use production backend
  return 'https://plshireaditya.onrender.com';
}

export const API_BASE = getApiBaseUrl();

