export const BASE_URL = (process.env.RAGA_API_BASE || '').replace(/\/+$/, '');

export function apiHeaders() {
  const key = process.env.RAGA_API_KEY;
  return { 'x-api-key': key ?? '', 'Content-Type': 'application/json' };
}

export function assertEnv() {
  if (!BASE_URL) throw new Error('RAGA_API_BASE not set');
  if (!process.env.RAGA_API_KEY) throw new Error('RAGA_API_KEY not set');
}
