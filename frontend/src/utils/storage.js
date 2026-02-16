/**
 * Lưu trữ toàn bộ dữ liệu trên localStorage (không cần backend).
 * Dùng trên MỘT thiết bị (VD: tablet tại sự kiện) để cấu hình và nhận lì xì.
 */

const CONFIG_KEY = 'lixi_config';
const RECIPIENTS_KEY = 'lixi_recipients';

const defaultConfig = {
  maxRecipients: 100,
  denominations: [
    { value: 10000, label: '10k', percentage: 40, quantity: 40 },
    { value: 20000, label: '20k', percentage: 30, quantity: 30 },
    { value: 50000, label: '50k', percentage: 20, quantity: 20 },
    { value: 100000, label: '100k', percentage: 10, quantity: 10 }
  ],
  specialGift: { enabled: false, label: 'Quà đặc biệt', description: '', amount: 0 },
  eventStartTime: null,
  eventEndTime: null,
  isLocked: false,
  updatedAt: new Date().toISOString()
};

function readJson(key, fallback) {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('localStorage write error', e);
  }
}

export function getConfig() {
  const c = readJson(CONFIG_KEY, null);
  if (!c) return { ...defaultConfig };
  return {
    ...defaultConfig,
    ...c,
    denominations: c.denominations?.length ? c.denominations : defaultConfig.denominations,
    specialGift: c.specialGift != null ? { ...defaultConfig.specialGift, ...c.specialGift } : defaultConfig.specialGift
  };
}

export function saveConfig(config) {
  const toSave = {
    ...config,
    updatedAt: new Date().toISOString()
  };
  writeJson(CONFIG_KEY, toSave);
  return toSave;
}

export function getRecipients() {
  return readJson(RECIPIENTS_KEY, []);
}

export function addRecipient(recipient) {
  const list = getRecipients();
  list.push({
    ...recipient,
    receivedAt: new Date().toISOString()
  });
  writeJson(RECIPIENTS_KEY, list);
  return list;
}

/** Xóa một người nhận theo SĐT khỏi danh sách. Sau khi xóa, người đó có thể quét và nhận lì xì lại. */
export function removeRecipientByPhone(phone) {
  const phoneStr = String(phone || '').replace(/\s/g, '');
  const list = getRecipients().filter((r) => String(r.phone || '').replace(/\s/g, '') !== phoneStr);
  writeJson(RECIPIENTS_KEY, list);
  return list;
}

/**
 * Random chọn mệnh giá theo tỉ lệ %.
 * Chỉ chọn trong các mệnh giá còn số lượng tờ (đã phát < quantity).
 * recipients: danh sách đã nhận để đếm số tờ từng mệnh giá.
 * config: optional, nếu có specialGift.enabled thì thêm 1 suất quà đặc biệt vào pool.
 */
export function pickRandomDenomination(denominations, recipients = [], config = null) {
  const countByLabel = {};
  recipients.forEach((r) => {
    const l = r.denominationLabel || String(r.amount);
    countByLabel[l] = (countByLabel[l] || 0) + 1;
  });
  let pool = (denominations || []).filter((d) => {
    const q = Math.max(1, parseInt(d.quantity, 10) || 999);
    return (countByLabel[d.label] || 0) < q;
  });
  const sg = config?.specialGift;
  if (sg?.enabled && sg?.label && (countByLabel[sg.label] || 0) < 1) {
    pool = [...pool, { value: sg.amount || 0, label: sg.label, percentage: 1, quantity: 1, isSpecialGift: true, specialGiftDescription: sg.description || '' }];
  }
  if (!pool.length) return null;
  const totalPct = pool.reduce((s, d) => s + (d.percentage || 0), 0);
  if (totalPct <= 0) return pool[0];
  const r = Math.random() * totalPct;
  let acc = 0;
  for (const d of pool) {
    acc += d.percentage || 0;
    if (r < acc) return d;
  }
  return pool[pool.length - 1];
}

/** Thống kê từ danh sách recipients */
export function getStatsFromRecipients(recipients, config) {
  const maxRecipients = config?.maxRecipients ?? 100;
  const totalRecipients = recipients.length;
  const totalMoney = recipients.reduce((s, r) => s + (r.amount || 0), 0);
  const byDenomination = {};
  recipients.forEach((r) => {
    const label = r.denominationLabel || String(r.amount);
    if (!byDenomination[label]) {
      byDenomination[label] = { label, amount: r.amount, count: 0, total: 0 };
    }
    byDenomination[label].count += 1;
    byDenomination[label].total += r.amount || 0;
  });
  const estimatedBudget = (config?.denominations || []).reduce(
    (s, d) => s + (d.value || 0) * Math.max(1, parseInt(d.quantity, 10) || 0),
    0
  );
  return {
    totalRecipients,
    totalMoney,
    maxRecipients,
    estimatedBudget,
    isLocked: config?.isLocked ?? false,
    byDenomination: Object.values(byDenomination).sort((a, b) => (a.amount || 0) - (b.amount || 0))
  };
}
