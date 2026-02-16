/**
 * Bảo vệ trang Admin: chỉ ai có mã admin mới vào quản lý được.
 * Mã admin lưu trong localStorage (lần đầu tạo, các lần sau nhập đúng mã mới vào).
 */

const STORAGE_SECRET = 'lixi_admin_secret';
const SESSION_KEY = 'lixi_admin_session';

export function hasStoredSecret() {
  try {
    return !!localStorage.getItem(STORAGE_SECRET);
  } catch {
    return false;
  }
}

export function createSecret(code) {
  const trimmed = String(code).trim();
  if (!trimmed) return false;
  try {
    localStorage.setItem(STORAGE_SECRET, trimmed);
    return true;
  } catch {
    return false;
  }
}

export function verifySecret(code) {
  try {
    const stored = localStorage.getItem(STORAGE_SECRET);
    return stored !== null && stored === String(code).trim();
  } catch {
    return false;
  }
}

export function setSession() {
  try {
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch {}
}

export function clearSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {}
}

export function isLoggedIn() {
  try {
    return !!sessionStorage.getItem(SESSION_KEY);
  } catch {
    return false;
  }
}

/** Xóa mã admin (sau khi xóa, lần vào /admin tiếp theo phải tạo mã mới) */
export function resetSecret() {
  try {
    localStorage.removeItem(STORAGE_SECRET);
    sessionStorage.removeItem(SESSION_KEY);
  } catch {}
}
