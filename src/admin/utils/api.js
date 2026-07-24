const BASE_URL = 'http://localhost:5001/api';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

/**
 * Small fetch wrapper used by every admin page.
 * - Attaches the Bearer token automatically
 * - Parses JSON and throws a readable ApiError on failure
 * - Emits an 'admin-unauthorized' window event on 401 so the layout can log the user out
 */
async function request(path, { method = 'GET', token, body, headers = {} } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (res.status === 401) {
    window.dispatchEvent(new CustomEvent('admin-unauthorized'));
  }

  if (!res.ok || (data && data.success === false)) {
    const message = data?.message || data?.errors?.[0]?.msg || `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }

  return data;
}

export const adminApi = {
  get: (path, token) => request(path, { token }),
  post: (path, body, token) => request(path, { method: 'POST', body, token }),
  put: (path, body, token) => request(path, { method: 'PUT', body, token }),
  patch: (path, body, token) => request(path, { method: 'PATCH', body, token }),
  delete: (path, token) => request(path, { method: 'DELETE', token })
};

export { ApiError, BASE_URL };
