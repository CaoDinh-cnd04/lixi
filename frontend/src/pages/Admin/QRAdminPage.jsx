import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getQr } from '../../utils/api';
import '../../pages/QRPage.css';

export default function QRAdminPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getQr()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-wrap">
        <div className="loading-spinner" />
        <p>Đang tạo mã QR...</p>
      </div>
    );
  }

  if (error) {
    return <div className="message-box error">{error}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="admin-page-title">Mã QR sự kiện</h1>
      <div className="message-box info admin-notice">
        <strong>Đã bật Backend:</strong> Danh sách người nhận từ mọi thiết bị (điện thoại quét QR, máy tính, tablet…) đều được lưu trên server và hiển thị tại đây. Bạn có thể mở Admin trên máy khác vẫn thấy đầy đủ.
      </div>
      <p className="qr-desc">Dùng mã QR này cho người tham gia mở trang nhận lì xì. Mỗi người quét một lần, nhận một kết quả.</p>
      <div className="qr-wrap" style={{ margin: '0 auto 1rem' }}>
        <img src={data.qrDataUrl} alt="QR Code" className="qr-image" />
      </div>
      <p className="qr-url-label">Link nhận lì xì:</p>
      <a href={data.receiveUrl} className="qr-link" target="_blank" rel="noopener noreferrer">
        {data.receiveUrl}
      </a>
    </motion.div>
  );
}
