import React, { useMemo } from 'react';
import './TetBlossoms.css';

/** Các bộ câu đối / câu chúc (trái: 2 dòng, phải: 2 dòng). Mỗi người random 1 bộ. */
const COUPLET_SETS = [
  { left: ['Tân xuân phúc lộc', 'An khang thịnh vượng'], right: ['Lì xì may mắn', 'Tấn tài tấn lộc'] },
  { left: ['Phước lộc đầy nhà', 'Năm mới an khang'], right: ['Vạn sự như ý', 'Tấn tài tấn lộc'] },
  { left: ['Xuân sang phúc đến', 'Tết đến tình thân'], right: ['Lộc vàng đầy túi', 'Phát tài phát lộc'] },
  { left: ['Mừng xuân hạnh phúc', 'Đón Tết bình an'], right: ['Cung chúc tân xuân', 'Vạn sự cát tường'] },
  { left: ['Gia đình hòa thuận', 'Con cháu sum vầy'], right: ['Sức khỏe dồi dào', 'Tiền tài như nước'] },
  { left: ['Năm mới thắng lợi', 'Công việc hanh thông'], right: ['Hoa đào khoe sắc', 'Lì xì đầy tay'] },
  { left: ['Chúc mừng năm mới', 'Vạn sự như ý'], right: ['Phúc lộc sum vầy', 'Tài lộc phát tài'] },
  { left: ['Xuân về nhà đẹp', 'Tết đến lộc sang'], right: ['An khang thịnh vượng', 'Phát tài phát lộc'] },
];

/** Đồng tiền vàng cổ (viền kép, lỗ vuông, sáng viền) */
function Coin({ className }) {
  return (
    <span className={className} aria-hidden>
      <svg viewBox="0 0 64 64" className="tet-coin__svg">
        <defs>
          <linearGradient id="coin-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffe082" />
            <stop offset="25%" stopColor="#ffd54f" />
            <stop offset="50%" stopColor="#ffc107" />
            <stop offset="75%" stopColor="#d4a84b" />
            <stop offset="100%" stopColor="#b8860b" />
          </linearGradient>
          <linearGradient id="coin-rim" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffeb3b" />
            <stop offset="100%" stopColor="#c49000" />
          </linearGradient>
          <filter id="coin-shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodOpacity="0.35" />
          </filter>
        </defs>
        <circle cx="32" cy="32" r="30" fill="url(#coin-gold)" filter="url(#coin-shadow)" />
        <circle cx="32" cy="32" r="30" fill="none" stroke="url(#coin-rim)" strokeWidth="3" />
        <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(184,134,11,0.4)" strokeWidth="0.8" />
        <path d="M26 26h12v12H26z" fill="#1a1008" transform="rotate(45 32 32)" />
        <path d="M26 26h12v12H26z" fill="none" stroke="rgba(184,134,11,0.45)" strokeWidth="0.5" transform="rotate(45 32 32)" />
      </svg>
    </span>
  );
}

/** Tách 2 dòng thành danh sách từ (trên xuống dưới) */
function linesToWords(lines) {
  return lines.flatMap((line) => line.split(/\s+/).filter(Boolean));
}

/** Một bên câu đối: 1 khung đỏ, từng từ trôi xuống (stagger) */
function CoupletSide({ lines, isRight }) {
  const words = useMemo(() => linesToWords(lines), [lines]);
  const baseDelay = 0.15; // giây giữa mỗi từ

  return (
    <div className={`tet-couplet ${isRight ? 'tet-couplet--right' : 'tet-couplet--left'}`} aria-hidden>
      <div className="tet-couplet__inner">
        <div className="tet-couplet__flow">
          {words.map((word, i) => (
            <span
              key={`${word}-${i}`}
              className="tet-couplet__word"
              style={{ animationDelay: `${i * baseDelay}s` }}
            >
              {word}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Chọn ngẫu nhiên một bộ câu đối (cố định theo phiên, không trùng tỉ lệ đều) */
function useRandomCouplet() {
  return useMemo(() => {
    const i = Math.floor(Math.random() * COUPLET_SETS.length);
    return COUPLET_SETS[i];
  }, []);
}

export default function TetBlossoms() {
  const couplet = useRandomCouplet();
  return (
    <>
      <CoupletSide lines={couplet.left} isRight={false} />
      <CoupletSide lines={couplet.right} isRight />
      <Coin className="tet-coin tet-coin--1" />
      <Coin className="tet-coin tet-coin--2" />
      <Coin className="tet-coin tet-coin--3" />
      <Coin className="tet-coin tet-coin--4" />
      <Coin className="tet-coin tet-coin--5" />
      <Coin className="tet-coin tet-coin--6" />
    </>
  );
}
