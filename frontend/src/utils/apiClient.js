/**
 * Gọi API backend khi có VITE_API_URL. Dùng cho mọi request lên server.
 * Chỉ dùng host:5000 khi đang ở mạng nội bộ (192.168.x, 10.x) để điện thoại quét QR gọi đúng máy.
 * Trên GitHub Pages / domain công khai: chỉ dùng VITE_API_URL (build time); không set thì không gọi backend.
 */
function getApiBase() {
  const raw = import.meta.env.VITE_API_URL;
  const url = typeof raw === 'string' ? raw.trim() : '';
  const base = url ? `${url.replace(/\/$/, '')}/api` : '';
  if (typeof window === 'undefined') return base;
  const host = window.location.hostname;
  const isLocalhost = host === 'localhost' || host === '127.0.0.1';
  const isLan = /^192\.168\.\d+\.\d+$|^10\.\d+\.\d+\.\d+$|^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/.test(host);
  if (isLan && !base) return `${window.location.protocol}//${host}:5000/api`;
  return base;
}
const BASE = getApiBase();

export const hasBackend = () => !!BASE;

export async function request(path, options = {}) {
  const url = `${BASE}${path}`;
  const headers = { ...options.headers };
  if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Lỗi kết nối');
  return data;
}

export async function requestAdmin(path, adminKey, options = {}) {
  return request(path, {
    ...options,
    headers: { ...options.headers, 'X-Admin-Key': adminKey }
  });
}
