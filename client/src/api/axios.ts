// Custom fetch wrapper — replaces axios while keeping the same interface.
// Handles: base URL, Authorization header, credentials (cookies), 401→refresh→retry.

const BASE = '/api';

// Error thrown for non-2xx responses. Carries the HTTP status and the
// server-provided message (parsed from the JSON body when available), so the
// UI can show a meaningful message and branch on the status code.
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

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

  // Endpoints where a 401 means "wrong credentials / bad token in the body",
  // NOT an expired access token. For these we must NOT run the refresh-and-retry
  // dance — otherwise e.g. a wrong-password login triggers a redirect to /login
  // that wipes the error message before it can be shown.
  const isAuthEntryPoint =
    path.includes('/auth/login') ||
    path.includes('/auth/register') ||
    path.includes('/auth/refresh') ||
    path.includes('/auth/forgot-password') ||
    path.includes('/auth/reset-password');

  // 401 → try to refresh the access token, then retry the original request
  if (res.status === 401 && !isAuthEntryPoint) {
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
    const raw = await res.text().catch(() => '');
    let message = res.statusText;
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { message?: string; error?: string };
        message = parsed.message || parsed.error || raw;
      } catch {
        message = raw;
      }
    }
    throw new ApiError(res.status, message);
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
