/**
 * Lấy URL gốc dùng cho mã QR để điện thoại quét mở được (không dùng localhost).
 * - Đang chạy trên localhost → thử lấy IP mạng nội bộ (LAN) qua WebRTC để QR trỏ tới http://192.168.x.x:5173
 * - Đã deploy (domain thật) → dùng luôn origin
 */

function isLocalhost() {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host === '';
}

/**
 * Lấy địa chỉ IP mạng nội bộ (LAN) qua WebRTC. Trả về null nếu không lấy được.
 * @returns {Promise<string|null>}
 */
export function getLocalNetworkIP() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.RTCPeerConnection) {
      resolve(null);
      return;
    }
    const pc = new RTCPeerConnection({ iceServers: [] });
    const noop = () => {};
    pc.createDataChannel('');
    pc.createOffer().then((offer) => pc.setLocalDescription(offer)).catch(noop);
    pc.onicecandidate = (e) => {
      if (!e || !e.candidate || !e.candidate.candidate) {
        pc.close();
        resolve(null);
        return;
      }
      const m = e.candidate.candidate.match(/^candidate:.+ (\d+\.\d+\.\d+\.\d+) \d+ typ/);
      if (m && m[1]) {
        const ip = m[1];
        if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
          pc.close();
          resolve(ip);
        }
      }
    };
    setTimeout(() => {
      pc.close();
      resolve(null);
    }, 3000);
  });
}

/**
 * Base URL dùng cho QR. Khi đang localhost thì dùng http://LAN_IP:port nếu lấy được.
 * @returns {Promise<string>}
 */
export async function getBaseUrlForQr() {
  if (typeof window === 'undefined') return '';
  const origin = window.location.origin;
  const port = window.location.port || (window.location.protocol === 'https:' ? '443' : '80');
  const protocol = window.location.protocol;

  if (!isLocalhost()) {
    return origin;
  }

  const localIP = await getLocalNetworkIP();
  if (localIP) {
    const qrPort = port === '80' || port === '443' ? '' : `:${port}`;
    return `${protocol}//${localIP}${qrPort}`;
  }

  return origin;
}
