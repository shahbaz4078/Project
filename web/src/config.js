/** API base — in dev, Vite proxies `/api` → backend (see vite.config.js). */
export const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? '/api/v1'
    : typeof window !== 'undefined'
      ? `${window.location.origin}/api/v1`
      : '/api/v1');

/** Socket.IO must target the Node server directly (not the Vite dev server). */
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';
