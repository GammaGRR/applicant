const TOKEN_KEY = 'access_token';

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    let segment = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const pad = segment.length % 4;
    if (pad) segment += '='.repeat(4 - pad);
    const json = atob(segment);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function isExpired(payload: Record<string, unknown>): boolean {
  const exp = payload.exp;
  if (typeof exp !== 'number') return false;
  return exp * 1000 <= Date.now();
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
}

export function hasValidSession(): boolean {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return false;
  const payload = decodeJwtPayload(token);
  if (!payload) {
    clearAuthSession();
    return false;
  }
  if (isExpired(payload)) {
    clearAuthSession();
    return false;
  }
  return true;
}

export function getUserFromToken(): Record<string, unknown> | null {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload) {
    clearAuthSession();
    return null;
  }
  if (isExpired(payload)) {
    clearAuthSession();
    return null;
  }
  return payload;
}

export function normalizePublicEntry() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return;
  const payload = decodeJwtPayload(token);
  if (!payload || isExpired(payload)) clearAuthSession();
}
