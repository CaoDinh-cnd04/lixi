import React, { useState } from 'react';
import { getMoneyImageUrls } from '../utils/moneyImage';
import './MoneyImage.css';

/**
 * Hiển thị ảnh tiền theo mệnh giá (khi mở lì xì).
 * Thử .jpg trước, nếu lỗi thì thử .png; không có ảnh thì hiện tờ tiền giả (fallback) + animation rung.
 */
export default function MoneyImage({ amount, label, showAmount = true }) {
  const urls = getMoneyImageUrls(amount);
  const [tryPng, setTryPng] = useState(false);
  const [imgError, setImgError] = useState(false);

  const src = tryPng ? urls.png : urls.jpg;
  const hasUrl = urls.jpg || urls.png;
  const useFallback = !hasUrl || imgError;

  if (useFallback) {
    return (
      <div className="money-image money-image--fallback money-image--shake">
        <div className="money-image__bill">
          <span className="money-image__bill-value">{amount?.toLocaleString('vi-VN')}</span>
          <span className="money-image__bill-label">{label || 'VNĐ'}</span>
          <span className="money-image__bill-decoration">🧧</span>
        </div>
        {showAmount && (
          <div className="money-image__caption">
            <span className="money-image__amount">{amount?.toLocaleString('vi-VN')}</span>
            <span className="money-image__label">{label || 'VNĐ'}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="money-image money-image--shake">
      <img
        src={src}
        alt={`Tiền ${amount?.toLocaleString('vi-VN')} VNĐ`}
        className="money-image__img"
        onError={() => {
          if (!tryPng && urls.png) setTryPng(true);
          else setImgError(true);
        }}
      />
      {showAmount && (
        <div className="money-image__caption">
          <span className="money-image__amount">{amount?.toLocaleString('vi-VN')}</span>
          <span className="money-image__label">{label || 'VNĐ'}</span>
        </div>
      )}
    </div>
  );
}
