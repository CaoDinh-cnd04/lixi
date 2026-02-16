/**
 * Đường dẫn ảnh tiền theo mệnh giá.
 * Đặt file trong public/images với tên theo mệnh giá, ví dụ: 1000.jpg, 10000.jpg
 * Ưu tiên .jpg, fallback .png. Mệnh giá: 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000
 * Dùng base path (vd. /lixi/) để ảnh load đúng khi deploy GitHub Pages.
 */
const base = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '/';

function imagePath(path) {
  const b = base.endsWith('/') ? base : base + '/';
  return path.startsWith('/') ? b + path.slice(1) : b + path;
}

export function getMoneyImageSrc(amount) {
  const value = Number(amount);
  if (!value || value <= 0) return null;
  return imagePath(`images/${value}.jpg`);
}

export function getMoneyImageSrcJpg(amount) {
  const value = Number(amount);
  if (!value || value <= 0) return null;
  return imagePath(`images/${value}.jpg`);
}

/** Trả về URL ảnh (ưu tiên .jpg, fallback .png qua component) */
export function getMoneyImageUrls(amount) {
  const value = Number(amount);
  if (!value || value <= 0) return { jpg: null, png: null };
  return {
    jpg: imagePath(`images/${value}.jpg`),
    png: imagePath(`images/${value}.png`)
  };
}
