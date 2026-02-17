const STORAGE_BACKEND_URL = 'lixi_backend_url';

/** Đọc URL backend: ưu tiên tham số ?api= trên URL (để máy quét QR dùng đúng backend), rồi mới đến localStorage. */
function getStoredBackendUrl() {
  if (typeof window === 'undefined') return '';
  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('api');
    if (fromUrl && typeof fromUrl === 'string' && /^https?:\/\//i.test(fromUrl.trim())) {
      const u = fromUrl.trim().replace(/\/api\/?$/, '').replace(/\/$/, '');
      if (u) {
        localStorage.setItem(STORAGE_BACKEND_URL, u);
        return u;
      }
    }
    const u = localStorage.getItem(STORAGE_BACKEND_URL);
    return typeof u === 'string' ? u.trim() : '';
  } catch {
    return '';
  }
}

/**
 * Trả về base URL API: ưu tiên URL cấu hình trên trang (localStorage), sau đó VITE_API_URL (build), cuối là LAN :5000.
 */
function getApiBase() {
  const stored = getStoredBackendUrl();
  if (stored) {
    const clean = stored.replace(/\/api\/?$/, '').replace(/\/$/, '');
    if (/^https?:\/\//i.test(clean)) return `${clean}/api`;
  }
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

function getBase() {
  return getApiBase();
}

export const hasBackend = () => !!getBase();

/** Lưu URL backend (vd. https://xxx.ngrok.io) để Frontend GitHub Pages gọi Backend chạy trên máy bạn */
export function setBackendUrl(url) {
  if (typeof window === 'undefined') return;
  const u = (url || '').trim().replace(/\/api\/?$/, '').replace(/\/$/, '');
  try {
    if (u) localStorage.setItem(STORAGE_BACKEND_URL, u);
    else localStorage.removeItem(STORAGE_BACKEND_URL);
  } catch (_) {}
}

export function getBackendUrl() {
  return getStoredBackendUrl();
}

export async function request(path, options = {}) {
  const url = `${getBase()}${path}`;
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
