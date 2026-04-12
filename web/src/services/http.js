import axios from 'axios';
import { API_BASE } from '../config.js';

const ACCESS = 'asc_access';
const REFRESH = 'asc_refresh';

export const http = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.request.use((config) => {
  const path = `${config.baseURL || ''}${config.url || ''}`;
  const isAuthEndpoint =
    path.includes('/auth/login') ||
    path.includes('/auth/register') ||
    path.includes('/auth/refresh');
  // Stale JWTs must not be sent to login/register — breaks sign-in after a bad session
  if (!isAuthEndpoint) {
    const token = localStorage.getItem(ACCESS);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

http.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (!original || original._retry || err.response?.status !== 401) {
      return Promise.reject(err);
    }
    if (original.url?.includes('/auth/refresh') || original.url?.includes('/auth/login')) {
      return Promise.reject(err);
    }
    const rt = localStorage.getItem(REFRESH);
    if (!rt) return Promise.reject(err);

    original._retry = true;
    try {
      const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken: rt });
      localStorage.setItem(ACCESS, data.accessToken);
      localStorage.setItem(REFRESH, data.refreshToken);
      if (data.user) {
        localStorage.setItem('asc_user', JSON.stringify(data.user));
      }
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return http(original);
    } catch {
      localStorage.removeItem(ACCESS);
      localStorage.removeItem(REFRESH);
      localStorage.removeItem('asc_user');
      return Promise.reject(err);
    }
  }
);

export function getStoredTokens() {
  return {
    accessToken: localStorage.getItem(ACCESS),
    refreshToken: localStorage.getItem(REFRESH),
  };
}

export function setStoredSession({ accessToken, refreshToken, user }) {
  if (accessToken) localStorage.setItem(ACCESS, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH, refreshToken);
  if (user) localStorage.setItem('asc_user', JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(ACCESS);
  localStorage.removeItem(REFRESH);
  localStorage.removeItem('asc_user');
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem('asc_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
