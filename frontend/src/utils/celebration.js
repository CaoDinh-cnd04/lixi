/**
 * Hiệu ứng ăn mừng: pháo hoa, hoa nở (confetti nhiều đợt, màu vàng đỏ).
 */
import confetti from 'canvas-confetti';

function fire(particleRatio, opts) {
  confetti({
    origin: { y: 0.55, x: 0.5 },
    spread: 80,
    ...opts,
    particleCount: Math.floor(200 * particleRatio)
  });
}

/** Pháo hoa nhiều đợt cho mệnh giá cao */
export function fireworkBurst() {
  const colors = ['#c41e3a', '#d4a84b', '#ffd700', '#fff'];
  fire(0.5, { spread: 100, scalar: 1.2, colors });
  setTimeout(() => fire(0.4, { spread: 120, scalar: 1, colors }), 150);
  setTimeout(() => fire(0.3, { spread: 60, scalar: 0.9, colors }), 300);
}

/** Hoa nở: confetti tỏa tròn từ giữa (nhiều góc) */
export function flowerBloom() {
  const count = 8;
  const colors = ['#d4a84b', '#c41e3a', '#ffeb3b', '#fff'];
  for (let i = 0; i < count; i++) {
    const angle = (360 / count) * i - 90;
    setTimeout(() => {
      confetti({
        particleCount: 40,
        angle,
        spread: 55,
        origin: { x: 0.5, y: 0.6 },
        colors,
        scalar: 1.1,
        drift: 0
      });
    }, i * 80);
  }
}

/** Một đợt confetti đơn giản (mệnh giá trung bình) */
export function lightConfetti() {
  fire(0.4, { spread: 70, colors: ['#c41e3a', '#d4a84b'] });
}

/** Full: pháo hoa + hoa nở (mệnh giá rất cao) */
export function celebrateTop(amount) {
  const n = Number(amount) || 0;
  if (n >= 200000) {
    fireworkBurst();
    setTimeout(flowerBloom, 400);
  } else if (n >= 100000) {
    fireworkBurst();
    setTimeout(() => lightConfetti(), 500);
  } else if (n >= 50000) {
    fireworkBurst();
  } else {
    lightConfetti();
  }
}

/** Bùng nổ đặc biệt cho quà lì xì từ gia chủ – Tết: nhiều đợt pháo hoa + hoa nở + confetti liên tục */
export function celebrateSpecialGift() {
  const colors = ['#c41e3a', '#d4a84b', '#ffd700', '#ff6b35', '#fff', '#f9d71c'];
  const end = Date.now() + 4000;
  const frame = () => {
    if (Date.now() > end) return;
    confetti({
      particleCount: 6,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors
    });
    confetti({
      particleCount: 6,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors
    });
    requestAnimationFrame(frame);
  };
  frame();
  fire(1, { spread: 160, scalar: 1.3, colors });
  setTimeout(() => fire(0.9, { spread: 140, scalar: 1.2, colors }), 100);
  setTimeout(() => fire(0.8, { spread: 120, scalar: 1.1, colors }), 200);
  setTimeout(() => fireworkBurst, 250);
  setTimeout(() => flowerBloom(), 400);
  setTimeout(() => fire(0.7, { spread: 100, colors }), 600);
  setTimeout(() => fire(0.6, { spread: 80, colors }), 1200);
  setTimeout(() => fire(0.5, { spread: 90, origin: { y: 0.4, x: 0.5 }, colors }), 1800);
  setTimeout(() => fire(0.4, { spread: 70, colors }), 2500);
}
