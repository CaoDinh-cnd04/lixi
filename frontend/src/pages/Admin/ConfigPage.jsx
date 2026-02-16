import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getConfig, updateConfig } from '../../utils/api';
import './ConfigPage.css';

const defaultDenoms = [
  { value: 10000, label: '10k', percentage: 40, quantity: 40 },
  { value: 20000, label: '20k', percentage: 30, quantity: 30 },
  { value: 50000, label: '50k', percentage: 20, quantity: 20 },
  { value: 100000, label: '100k', percentage: 10, quantity: 10 }
];

export default function ConfigPage() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [maxRecipients, setMaxRecipients] = useState(100);
  const [denominations, setDenominations] = useState(defaultDenoms);
  const [specialGiftEnabled, setSpecialGiftEnabled] = useState(false);
  const [specialGiftLabel, setSpecialGiftLabel] = useState('Quà đặc biệt');
  const [specialGiftDescription, setSpecialGiftDescription] = useState('Phong bì đặc biệt từ gia chủ – tiền/quà may mắn');
  const [specialGiftAmount, setSpecialGiftAmount] = useState('');
  const [eventStartTime, setEventStartTime] = useState('');
  const [eventEndTime, setEventEndTime] = useState('');
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    getConfig()
      .then((data) => {
        setConfig(data);
        setMaxRecipients(Math.min(1000, Math.max(1, data.maxRecipients || 100)));
        setDenominations(
          data.denominations?.length
            ? data.denominations.map((d) => ({ ...d, quantity: d.quantity != null ? d.quantity : 50 }))
            : defaultDenoms
        );
        const sg = data.specialGift || {};
        setSpecialGiftEnabled(!!sg.enabled);
        setSpecialGiftLabel(sg.label || 'Quà đặc biệt');
        setSpecialGiftDescription(sg.description || '');
        setSpecialGiftAmount(sg.amount != null && sg.amount !== '' ? String(sg.amount) : '');
        setEventStartTime(data.eventStartTime ? new Date(data.eventStartTime).toISOString().slice(0, 16) : '');
        setEventEndTime(data.eventEndTime ? new Date(data.eventEndTime).toISOString().slice(0, 16) : '');
        setIsLocked(!!data.isLocked);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const totalPercent = denominations.reduce((s, d) => s + (Number(d.percentage) || 0), 0);
  const estimatedBudget = denominations.reduce(
    (s, d) => s + (Number(d.value) || 0) * Math.max(1, parseInt(d.quantity, 10) || 0),
    0
  );
  const isValid = Math.abs(totalPercent - 100) < 0.001;

  const updateDenom = (index, field, value) => {
    setDenominations((prev) => {
      const next = [...prev];
      if (!next[index]) return next;
      next[index] = { ...next[index], [field]: value };
      if (field === 'value') next[index].label = formatLabel(value);
      return next;
    });
  };

  function formatLabel(v) {
    const n = Number(v);
    if (n >= 1000000) return `${n / 1000000}M`;
    if (n >= 1000) return `${n / 1000}k`;
    return String(n);
  }

  const addDenom = () => {
    setDenominations((prev) => [...prev, { value: 50000, label: '50k', percentage: 0, quantity: 50 }]);
  };

  const removeDenom = (index) => {
    if (denominations.length <= 1) return;
    setDenominations((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) {
      setError('Tổng tỉ lệ phải bằng 100%');
      return;
    }
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await updateConfig(null, {
        maxRecipients: Math.min(1000, Math.max(1, Number(maxRecipients) || 100)),
        denominations: denominations.map((d) => ({
          value: Number(d.value) || 0,
          label: d.label || formatLabel(d.value),
          percentage: Number(d.percentage) || 0,
          quantity: Math.min(1000, Math.max(1, parseInt(d.quantity, 10) || 1))
        })),
        specialGift: {
          enabled: specialGiftEnabled,
          label: specialGiftLabel.trim() || 'Quà đặc biệt',
          description: specialGiftDescription.trim(),
          amount: specialGiftAmount === '' ? 0 : parseInt(specialGiftAmount, 10) || 0
        },
        eventStartTime: eventStartTime ? new Date(eventStartTime).toISOString() : null,
        eventEndTime: eventEndTime ? new Date(eventEndTime).toISOString() : null,
        isLocked
      });
      setSuccess('Đã lưu cấu hình.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Lỗi lưu cấu hình');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-wrap">
        <div className="loading-spinner" />
        <p>Đang tải cấu hình...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="config-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="admin-page-title">Cấu hình sự kiện</h1>

      {error && <div className="message-box error">{error}</div>}
      {success && <div className="message-box success">{success}</div>}

      <form onSubmit={handleSubmit} className="config-form">
        <section className="config-section">
          <h2>Số lượng & thời gian</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Số người tối đa được nhận lì xì (1–1000)</label>
              <input
                type="number"
                min={1}
                max={1000}
                value={maxRecipients}
                onChange={(e) => setMaxRecipients(e.target.value)}
              />
            </div>
          </div>
          <div className="form-row two">
            <div className="form-group">
              <label>Thời gian bắt đầu (tùy chọn)</label>
              <input
                type="datetime-local"
                value={eventStartTime}
                onChange={(e) => setEventStartTime(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Thời gian kết thúc (tùy chọn)</label>
              <input
                type="datetime-local"
                value={eventEndTime}
                onChange={(e) => setEventEndTime(e.target.value)}
              />
            </div>
          </div>
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={isLocked}
                onChange={(e) => setIsLocked(e.target.checked)}
              />
              Khóa sự kiện (dừng nhận lì xì)
            </label>
          </div>
        </section>

        <section className="config-section config-section-special">
          <h2>🎁 Quà lì xì đặc biệt từ gia chủ</h2>
          <p className="config-hint">Một phần quà đặc biệt (tiền/quà tặng) do admin xét – chỉ 1 người may mắn nhận. Khi trúng sẽ có animation đặc biệt.</p>
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={specialGiftEnabled}
                onChange={(e) => setSpecialGiftEnabled(e.target.checked)}
              />
              Bật quà đặc biệt (1 suất duy nhất)
            </label>
          </div>
          {specialGiftEnabled && (
            <>
              <div className="form-group">
                <label>Tên hiển thị quà đặc biệt</label>
                <input
                  type="text"
                  placeholder="VD: Phong bì đặc biệt từ gia chủ"
                  value={specialGiftLabel}
                  onChange={(e) => setSpecialGiftLabel(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Mô tả / lời chúc (hiển thị khi trúng)</label>
                <input
                  type="text"
                  placeholder="VD: Tiền/quà may mắn từ gia chủ"
                  value={specialGiftDescription}
                  onChange={(e) => setSpecialGiftDescription(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Giá trị (VNĐ, tùy chọn – để 0 nếu chỉ là quà tặng)</label>
                <input
                  type="number"
                  placeholder="0"
                  min={0}
                  value={specialGiftAmount}
                  onChange={(e) => setSpecialGiftAmount(e.target.value)}
                />
              </div>
            </>
          )}
        </section>

        <section className="config-section">
          <h2>Mệnh giá & tỉ lệ</h2>
          <p className="config-hint">Tỉ lệ: từ 0,01% đến 100%. Tổng tỉ lệ phải bằng 100%. Số lượng tờ: 1–1000.</p>
          <div className={`total-percent ${isValid ? 'ok' : 'err'}`}>
            Tổng tỉ lệ: {totalPercent.toFixed(2)}%
          </div>
          <div className="estimated-budget">
            Tổng ngân sách dự kiến: <strong>{estimatedBudget.toLocaleString('vi-VN')} VNĐ</strong>
          </div>

          {denominations.map((d, i) => (
            <div key={i} className="denom-row">
              <input
                type="number"
                placeholder="Mệnh giá"
                value={d.value ?? ''}
                onChange={(e) => updateDenom(i, 'value', e.target.value)}
                min={1000}
                step={1000}
              />
              <input
                type="text"
                placeholder="Nhãn"
                value={d.label ?? ''}
                onChange={(e) => updateDenom(i, 'label', e.target.value)}
                className="label-inp"
              />
              <input
                type="number"
                placeholder="Tỉ lệ %"
                value={d.percentage ?? ''}
                onChange={(e) => updateDenom(i, 'percentage', e.target.value)}
                min={0.01}
                max={100}
                step={0.01}
                className="pct-inp"
                title="0,01% – 100%"
              />
              <span className="denom-unit">%</span>
              <input
                type="number"
                placeholder="Số tờ"
                value={d.quantity ?? ''}
                onChange={(e) => updateDenom(i, 'quantity', e.target.value)}
                min={1}
                max={1000}
                className="qty-inp"
                title="Số lượng tờ 1–1000"
              />
              <button type="button" className="btn-remove" onClick={() => removeDenom(i)} title="Xóa">
                ×
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-secondary" onClick={addDenom}>
            + Thêm mệnh giá
          </button>
        </section>

        <button type="submit" className="btn btn-primary btn-large" disabled={saving || !isValid}>
          {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
        </button>
      </form>
    </motion.div>
  );
}
