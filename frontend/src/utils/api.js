/**
 * Layer dữ liệu: dùng Backend khi có VITE_API_URL, không thì dùng localStorage.
 */
import { hasBackend, request, requestAdmin } from './apiClient';

export { hasBackend };
import {
  getConfig as getConfigStorage,
  saveConfig,
  getRecipients,
  addRecipient,
  pickRandomDenomination,
  getStatsFromRecipients
} from './storage';

const ADMIN_KEY_STORAGE = 'lixi_admin_key';

function getAdminKey() {
  try {
    return sessionStorage.getItem(ADMIN_KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

export function setAdminKeyForApi(key) {
  try {
    if (key) sessionStorage.setItem(ADMIN_KEY_STORAGE, key);
    else sessionStorage.removeItem(ADMIN_KEY_STORAGE);
  } catch {}
}

export function verifyAdmin(code) {
  if (!hasBackend()) return Promise.resolve(false);
  return request('/admin/verify', {
    method: 'GET',
    headers: { 'X-Admin-Key': code }
  })
    .then((r) => r.success === true)
    .catch(() => false);
}

export function getPublicConfig() {
  if (hasBackend()) {
    return request('/config/public').then((r) => r.data);
  }
  return Promise.resolve(getConfigStorage());
}

export function submitReceive(name, age, phone, ip = null) {
  if (hasBackend()) {
    return request('/receive', {
      method: 'POST',
      body: JSON.stringify({ name: name.trim(), age: Number(age), phone: String(phone).trim(), ip: ip || '' })
    }).then((r) => r.data);
  }
  const config = getConfigStorage();
  const recipients = getRecipients();
  const nameTrim = String(name).trim();
  const ageNum = parseInt(age, 10);
  const phoneStr = String(phone).replace(/\s/g, '');
  if (recipients.length >= (config.maxRecipients || 100)) return Promise.reject(new Error('Đã đủ số lượng người nhận lì xì'));
  const byPhone = recipients.find((r) => String(r.phone).replace(/\s/g, '') === phoneStr);
  if (byPhone) return Promise.reject(new Error('Bạn đã nhận lì xì trước đó'));
  const byNamePhone = recipients.find((r) => r.name === nameTrim && String(r.phone).replace(/\s/g, '') === phoneStr);
  if (byNamePhone) return Promise.reject(new Error('Họ tên và số điện thoại này đã được sử dụng nhận lì xì'));
  const byNameAge = recipients.find((r) => r.name === nameTrim && r.age === ageNum);
  if (byNameAge) return Promise.reject(new Error('Thông tin (họ tên + độ tuổi) đã được sử dụng nhận lì xì'));
  if (ip && ip.trim()) {
    const byIp = recipients.find((r) => r.ip && r.ip === ip.trim());
    if (byIp) return Promise.reject(new Error('Mỗi mạng/thiết bị chỉ được nhận lì xì 1 lần'));
  }
  const picked = pickRandomDenomination(config.denominations, recipients, config);
  if (!picked) return Promise.reject(new Error('Đã hết lượt lì xì hoặc chưa cấu hình mệnh giá'));
  const newRecipient = {
    name: nameTrim,
    age: ageNum,
    phone: phoneStr,
    amount: picked.value,
    denominationLabel: picked.label,
    ...(picked.isSpecialGift ? { isSpecialGift: true } : {}),
    ...(ip && ip.trim() ? { ip: ip.trim() } : {})
  };
  addRecipient(newRecipient);
  if (getRecipients().length >= (config.maxRecipients || 100)) saveConfig({ ...config, isLocked: true });
  return Promise.resolve({
    amount: picked.value,
    label: picked.label,
    isSpecialGift: !!picked.isSpecialGift,
    specialGiftDescription: picked.specialGiftDescription || undefined
  });
}

export function checkReceived(phone) {
  if (hasBackend()) {
    return request(`/receive/check?phone=${encodeURIComponent(phone || '')}`).then((r) => r.data);
  }
  const recipients = getRecipients();
  const phoneStr = String(phone).replace(/\s/g, '');
  const r = recipients.find((x) => String(x.phone).replace(/\s/g, '') === phoneStr);
  return Promise.resolve(r ? { received: true, amount: r.amount, label: r.denominationLabel, isSpecialGift: !!r.isSpecialGift } : { received: false });
}

export async function getQr() {
  const { getBaseUrlForQr } = await import('./qrBaseUrl.js');
  const base = await getBaseUrlForQr();
  const baseClean = base ? base.replace(/\/$/, '') : '';
  if (hasBackend()) {
    const url = baseClean ? `/qr?baseUrl=${encodeURIComponent(baseClean)}` : '/qr';
    const r = await request(url);
    return r.data;
  }
  const receiveUrl = `${baseClean || window.location.origin}/nhan-lixi`;
  const QRCode = (await import('qrcode')).default;
  const qrDataUrl = await QRCode.toDataURL(receiveUrl, { width: 400, margin: 2 });
  return { qrDataUrl, receiveUrl };
}

export function getConfig() {
  if (hasBackend()) {
    const key = getAdminKey();
    return requestAdmin('/config', key).then((r) => r.data);
  }
  return Promise.resolve(getConfigStorage());
}

export function updateConfig(_, body) {
  if (hasBackend()) {
    const key = getAdminKey();
    return requestAdmin('/config', key, { method: 'PUT', body: JSON.stringify(body) }).then((r) => r.data);
  }
  const current = getConfigStorage();
  const updated = {
    ...current,
    ...body,
    maxRecipients: body.maxRecipients ?? current.maxRecipients,
    denominations: body.denominations ?? current.denominations,
    specialGift: body.specialGift !== undefined ? { ...(current.specialGift || {}), ...body.specialGift } : (current.specialGift || {}),
    eventStartTime: body.eventStartTime ?? current.eventStartTime,
    eventEndTime: body.eventEndTime ?? current.eventEndTime,
    isLocked: typeof body.isLocked === 'boolean' ? body.isLocked : current.isLocked
  };
  saveConfig(updated);
  return Promise.resolve(updated);
}

export function getStats() {
  if (hasBackend()) {
    const key = getAdminKey();
    return requestAdmin('/stats', key).then((r) => r.data);
  }
  const config = getConfigStorage();
  const recipients = getRecipients();
  return Promise.resolve(getStatsFromRecipients(recipients, config));
}

export function getStatsList() {
  if (hasBackend()) {
    const key = getAdminKey();
    return requestAdmin('/stats/list', key).then((r) => r.data);
  }
  const list = getRecipients().slice().reverse().slice(0, 500).map((r) => ({ name: r.name, age: r.age, phone: r.phone, amount: r.amount, denominationLabel: r.denominationLabel, receivedAt: r.receivedAt }));
  return Promise.resolve(list);
}
