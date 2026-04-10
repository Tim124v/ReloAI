export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
export const TOKEN_KEY = 'token';

const getStoredToken = () => (typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null);

const buildUrl = (path: string) => {
  if (/^https?:\/\//.test(path)) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${normalizedPath}`;
};

type ApiFetchOptions = RequestInit & { rawResponse?: boolean };

export async function apiFetch(path: string, options: ApiFetchOptions = {}) {
  const token = getStoredToken();
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path), { ...options, headers });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message =
      (payload && typeof payload === 'object' && ('error' in payload || 'message' in payload)
        ? ((payload as { error?: string; message?: string }).error ||
          (payload as { error?: string; message?: string }).message)
        : null) || `Request failed (${response.status})`;

    throw Object.assign(new Error(message), {
      status: response.status,
      data: payload,
    });
  }

  if (options.rawResponse) return response;
  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  get: <T>(path: string) => apiFetch(path) as Promise<T>,
  post: <T>(path: string, body: unknown) =>
    apiFetch(path, { method: 'POST', body: JSON.stringify(body) }) as Promise<T>,
};
