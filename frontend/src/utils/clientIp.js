/**
 * Lấy địa chỉ IP công khai của người dùng (từ trình duyệt) để giới hạn 1 IP = 1 lần nhận.
 * Dùng API bên ngoài (CORS). Nếu không lấy được (chặn firewall, lỗi mạng) trả về null.
 */
const IP_API_URLS = [
  'https://api.ipify.org?format=json',
  'https://api64.ipify.org?format=json'
];

let cachedIp = null;

export async function getClientIp() {
  if (cachedIp) return cachedIp;
  for (const url of IP_API_URLS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) continue;
      const data = await res.json();
      if (data && typeof data.ip === 'string') {
        cachedIp = data.ip;
        return cachedIp;
      }
    } catch (_) {
      continue;
    }
  }
  return null;
}
