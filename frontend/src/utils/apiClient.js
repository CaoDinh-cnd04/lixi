/**
 * Gọi API backend khi có VITE_API_URL. Dùng cho mọi request lên server.
 * Khi mở từ mạng (vd: 192.168.1.11:5173), tự dùng cùng host + cổng 5000 để API tới đúng máy chạy backend.
 */
function getApiBase() {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `${window.location.protocol}//${window.location.hostname}:5000/api`;
  }
  const url = import.meta.env.VITE_API_URL;
  return url ? `${url.replace(/\/$/, '')}/api` : '';
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
