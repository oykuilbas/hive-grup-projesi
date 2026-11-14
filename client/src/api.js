// Shared helper for all requests to the backend.
// Use it instead of calling fetch directly:
//
//   import { api } from '../api';
//   const tasks = await api.get(`/children/${childId}/tasks`);
//   await api.post(`/children/${childId}/tasks`, { title, dueDate });
//
// It adds the login token, sends and reads JSON, and throws an Error with the
// server's message when the response is not successful.

const TOKEN_KEY = 'hive_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

// Sent when the server answers 401 (token missing, invalid or expired),
// so that the app can return to the login page.
export const UNAUTHORIZED_EVENT = 'hive:unauthorized';

async function request(method, path, body) {
  const headers = {};
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Could not reach the server. Is the backend running?');
  }

  // 204 No Content has no body.
  const data = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && path !== '/auth/login') {
      setToken(null);
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    const error = new Error((data && data.error) || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }

  return data;
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body ?? {}),
  patch: (path, body) => request('PATCH', path, body ?? {}),
  delete: (path) => request('DELETE', path),
};
