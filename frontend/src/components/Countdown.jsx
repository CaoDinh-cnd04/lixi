import React, { useState, useEffect } from 'react';
import './Countdown.css';

export default function Countdown({ startTime, endTime, onEnd }) {
  const [now, setNow] = useState(Date.now());
  const start = startTime ? new Date(startTime).getTime() : 0;
  const end = endTime ? new Date(endTime).getTime() : 0;

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const notStarted = start && now < start;
  const ended = end && now >= end;
  if (ended) {
    if (onEnd) onEnd();
    return null;
  }
  if (!end || end <= now) {
    if (end && onEnd) onEnd();
    return null;
  }

  const targetTime = notStarted ? start : end;
  const diff = Math.max(0, targetTime - now);
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  const secs = Math.floor((diff % (60 * 1000)) / 1000);

  return (
    <div className="countdown">
      <p className="countdown-label">
        {notStarted ? 'Sự kiện bắt đầu sau' : 'Sự kiện kết thúc sau'}
      </p>
      <div className="countdown-grid">
        {days > 0 && (
          <>
            <div className="countdown-item">
              <span className="countdown-value">{String(days).padStart(2, '0')}</span>
              <span className="countdown-unit">Ngày</span>
            </div>
            <span className="countdown-sep">:</span>
          </>
        )}
        <div className="countdown-item">
          <span className="countdown-value">{String(hours).padStart(2, '0')}</span>
          <span className="countdown-unit">Giờ</span>
        </div>
        <span className="countdown-sep">:</span>
        <div className="countdown-item">
          <span className="countdown-value">{String(mins).padStart(2, '0')}</span>
          <span className="countdown-unit">Phút</span>
        </div>
        <span className="countdown-sep">:</span>
        <div className="countdown-item">
          <span className="countdown-value">{String(secs).padStart(2, '0')}</span>
          <span className="countdown-unit">Giây</span>
        </div>
      </div>
    </div>
  );
}
