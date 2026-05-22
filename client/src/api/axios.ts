// Custom fetch wrapper — replaces axios while keeping the same interface.
// Handles: base URL, Authorization header, credentials (cookies), 401→refresh→retry.

const BASE = '/api';

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  params?: Record<string, string | undefined>,
): Promise<T> {
  // Build URL with optional query params
  let url = BASE + path;
  if (params) {
    const qs = new URLSearchParams(
      Object.entries(params).filter((e): e is [string, string] => e[1] !== undefined),
    ).toString();
    if (qs) url += '?' + qs;
  }

  // Build headers
  const headers: Record<string, string> = {};
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  // Don't set Content-Type for FormData — browser sets it automatically with the boundary
  if (body !== undefined && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const init: RequestInit = {
    method,
    headers,
    credentials: 'include',
    body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  };

  let res = await fetch(url, init);

  // 401 → try to refresh the access token, then retry the original request
  if (res.status === 401 && !path.includes('/auth/refresh')) {
    try {
      const refreshRes = await fetch(`${BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (refreshRes.ok) {
        const { token } = (await refreshRes.json()) as { token: string };
        setAccessToken(token);
        headers['Authorization'] = `Bearer ${token}`;
        res = await fetch(url, { ...init, headers });
      } else {
        setAccessToken(null);
        window.location.href = '/login';
        throw new Error('Session expired');
      }
    } catch {
      setAccessToken(null);
      window.location.href = '/login';
      throw new Error('Session expired');
    }
  }

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status}: ${msg}`);
  }

  // Parse JSON only if there is a body (204 No Content returns nothing)
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

const api = {
  get:    <T>(path: string, params?: Record<string, string | undefined>) =>
            request<T>('GET', path, undefined, params),
  post:   <T>(path: string, body?: unknown) => request<T>('POST',   path, body),
  put:    <T>(path: string, body?: unknown) => request<T>('PUT',    path, body),
  patch:  <T>(path: string, body?: unknown) => request<T>('PATCH',  path, body),
  delete: <T = unknown>(path: string)       => request<T>('DELETE', path),
};

export default api;
