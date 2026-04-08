const TOKEN_KEY = 'relo_token';

const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null);

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw Object.assign(new Error(err.error || err.message || 'Request failed'), {
      status: res.status,
      data: err,
    });
  }

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
};

export { TOKEN_KEY };
