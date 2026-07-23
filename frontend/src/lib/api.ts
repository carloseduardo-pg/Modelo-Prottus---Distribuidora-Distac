const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

/** Cliente HTTP com cookies (JWT httpOnly). */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (res.status === 401 && path !== '/auth/login' && path !== '/auth/refresh') {
    const refreshed = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (refreshed.ok) {
      const retry = await fetch(`${API_BASE}${path}`, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      });
      if (!retry.ok) {
        const err = await retry.json().catch(() => ({}));
        throw new Error(err.message || 'Falha na requisição');
      }
      return retry.json() as Promise<T>;
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = Array.isArray(err.message)
      ? err.message.join(', ')
      : err.message || 'Falha na requisição';
    throw new Error(msg);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export function loginRequest(email: string, password: string) {
  return apiFetch<{ user: AuthUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function logoutRequest() {
  return apiFetch<{ ok: boolean }>('/auth/logout', { method: 'POST' });
}

export function meRequest() {
  return apiFetch<AuthUser>('/auth/me');
}
