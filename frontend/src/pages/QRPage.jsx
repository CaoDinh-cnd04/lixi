import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getQr } from '../utils/api';
import './QRPage.css';

export default function QRPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getQr()
      .then(setData)
      .catch((e) => setError(e.message || 'Không tạo được QR'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="qr-page loading-wrap">
        <div className="loading-spinner" />
        <p>Đang tạo mã QR...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="qr-page">
        <div className="message-box error">{error}</div>
      </div>
    );
  }

  return (
    <motion.div
      className="qr-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="page-title">
        <span className="title-icon">📱</span>
        Quét mã nhận lì xì
      </h1>
      <p className="qr-desc">Quét mã QR bằng camera điện thoại để mở trang nhận lì xì</p>
      {data.receiveUrl && (data.receiveUrl.includes('192.168.') || data.receiveUrl.includes('10.')) && (
        <p className="qr-hint">📶 Điện thoại cần cùng WiFi với máy đang chạy web</p>
      )}
      <div className="qr-wrap">
        <img src={data.qrDataUrl} alt="QR Code" className="qr-image" />
      </div>
      <p className="qr-url-label">Hoặc truy cập link:</p>
      <a href={data.receiveUrl} className="qr-link" target="_blank" rel="noopener noreferrer">
        {data.receiveUrl}
      </a>
    </motion.div>
  );
}
