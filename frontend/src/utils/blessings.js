/**
 * Câu chúc theo mệnh giá / tỉ lệ. Mệnh giá cao có câu chúc đặc biệt.
 */
const BLESSINGS_LOW = [
  'Lộc vừa tới, phúc đầy nhà!',
  'Tiền vô như nước, phát tài phát lộc!',
  'Năm mới an khang, tài lộc dồi dào!',
  'Chúc bạn sức khỏe, may mắn tràn đầy!',
  'Lì xì đỏ hồng, năm mới thịnh vượng!'
];

const BLESSINGS_MID = [
  'Tài lộc sum vầy, phúc thọ trường tồn!',
  'Vạn sự như ý, phát tài phát lộc!',
  'Năm mới đại cát đại lợi!',
  'Tiền vào như nước, của đến như mây!',
  'An khang thịnh vượng, vạn sự cát tường!'
];

const BLESSINGS_HIGH = [
  'Đại cát đại lợi – Lộc vàng đầy nhà!',
  'Hỷ sự liên miên – Phát tài phát lộc!',
  'Tấn tài tấn lộc – Năm mới thăng hoa!',
  'Vạn sự hanh thông – Tiền tài rủng rỉnh!',
  'Phúc lộc thọ tài – Đại cát đại lợi!'
];

const BLESSINGS_TOP = [
  '🎊 Trúng lớn! Lộc vàng rủng rỉnh – Năm mới đại phát! 🎊',
  '🌟 Đại cát đại lợi – Tài lộc ngập tràn nhà! 🌟',
  '✨ Phát tài phát lộc – Vạn sự như ý! ✨'
];

export function getBlessingForAmount(amount) {
  const n = Number(amount) || 0;
  const list =
    n >= 200000
      ? BLESSINGS_TOP
      : n >= 100000
        ? BLESSINGS_HIGH
        : n >= 50000
          ? BLESSINGS_MID
          : BLESSINGS_LOW;
  return list[Math.floor(Math.random() * list.length)];
}

export function isHighAmount(amount) {
  return (Number(amount) || 0) >= 50000;
}

export function isTopAmount(amount) {
  return (Number(amount) || 0) >= 100000;
}
