import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPublicConfig, submitReceive, checkReceived } from '../utils/api';
import { getClientIp } from '../utils/clientIp';
import Envelope from '../components/Envelope';
import MoneyImage from '../components/MoneyImage';
import Countdown from '../components/Countdown';
import playLixiSound from '../utils/sound';
import { getBlessingForAmount, isHighAmount } from '../utils/blessings';
import { celebrateTop, celebrateSpecialGift } from '../utils/celebration';
import './NhanLixi.css';

const LIXI_STORAGE_KEY = 'lixi_received';

function getStoredResult() {
  try {
    const s = localStorage.getItem(LIXI_STORAGE_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

function setStoredResult(data) {
  try {
    localStorage.setItem(LIXI_STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function ResultScreen({ amount, label, blessing, isHigh }) {
  return (
    <motion.div
      key="result"
      className={`result-block ${isHigh ? 'result-block--premium' : ''}`}
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
    >
      <motion.div
        className="result-envelope-wrap"
        initial={{ scale: 0.75, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.6, ease: 'easeOut' }}
      >
        <Envelope open amount={amount} label={label} />
      </motion.div>
      <motion.div
        className="result-money-wrap"
        initial={{ scale: 0.2, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 180, damping: 16, mass: 0.8 }}
      >
        <MoneyImage amount={amount} label={label} showAmount={false} />
      </motion.div>
      <motion.p
        className="result-congrats"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75, duration: 0.5 }}
      >
        Chúc mừng bạn đã nhận được
      </motion.p>
      <motion.div
        className="result-amount"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9, duration: 0.55, ease: 'easeOut' }}
      >
        <span className="amount-value">{amount?.toLocaleString('vi-VN')}</span>
        <span className="amount-label">VNĐ</span>
      </motion.div>
      <motion.p
        className="result-blessing"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.5 }}
      >
        {blessing}
      </motion.p>
      <motion.p
        className="result-wish"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.35, duration: 0.45 }}
      >
        Chúc bạn năm mới an khang, thịnh vượng! 🧧
      </motion.p>
      {isHigh && (
        <>
          <motion.div
            className="result-glow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            aria-hidden
          />
          <div className="result-bloom" aria-hidden />
        </>
      )}
    </motion.div>
  );
}

function SpecialGiftResultScreen({ label, description, amount }) {
  return (
    <motion.div
      key="special-gift"
      className="result-block result-block--special-gift"
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
    >
      <div className="special-gift-bg" aria-hidden />
      <motion.div
        className="special-gift-badge"
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 14 }}
      >
        🎁
      </motion.div>
      <motion.p
        className="special-gift-title"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
      >
        Quà lì xì đặc biệt từ gia chủ
      </motion.p>
      <motion.p
        className="special-gift-label"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        {label}
      </motion.p>
      {description && (
        <motion.p
          className="special-gift-desc"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65, duration: 0.45 }}
        >
          {description}
        </motion.p>
      )}
      {amount != null && amount > 0 && (
        <motion.div
          className="special-gift-amount"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, type: 'spring', stiffness: 180 }}
        >
          <span className="amount-value">{Number(amount).toLocaleString('vi-VN')}</span>
          <span className="amount-label">VNĐ</span>
        </motion.div>
      )}
      <motion.p
        className="special-gift-wish"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.4 }}
      >
        Chúc bạn năm mới an khang, thịnh vượng! 🧧✨
      </motion.p>
    </motion.div>
  );
}

export default function NhanLixi() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', age: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [alreadyReceived, setAlreadyReceived] = useState(null);
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [countdownEnd, setCountdownEnd] = useState(false);

  const stored = getStoredResult();

  const loadConfig = useCallback(async () => {
    try {
      setError('');
      const data = await getPublicConfig();
      setConfig(data);
      if (data.isLocked) setError('Sự kiện đã kết thúc.');
    } catch (e) {
      setError(e.message || 'Không tải được cấu hình.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    if (stored) {
      setResult({
        amount: stored.amount,
        label: stored.label,
        isSpecialGift: !!stored.isSpecialGift,
        specialGiftDescription: stored.specialGiftDescription
      });
      setAlreadyReceived(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting || !config || config.isLocked) return;
    setError('');
    const name = form.name.trim();
    const age = parseInt(form.age, 10);
    const phone = String(form.phone).replace(/\s/g, '');
    if (!name || name.length < 2) {
      setError('Vui lòng nhập họ tên (tối thiểu 2 ký tự).');
      return;
    }
    if (isNaN(age) || age < 1 || age > 120) {
      setError('Độ tuổi phải từ 1 đến 120.');
      return;
    }
    if (!phone || phone.length < 9) {
      setError('Vui lòng nhập số điện thoại hợp lệ.');
      return;
    }
    setSubmitting(true);
    try {
      let ip = null;
      try {
        ip = await getClientIp();
      } catch (_) {
        ip = null;
      }
      const data = await submitReceive(name, age, phone, ip);
      setStoredResult(data);
      setResult({
        amount: data.amount,
        label: data.label,
        blessing: getBlessingForAmount(data.amount),
        isSpecialGift: !!data.isSpecialGift,
        specialGiftDescription: data.specialGiftDescription
      });
      setEnvelopeOpen(true);
      playLixiSound();
      if (data.isSpecialGift) {
        setTimeout(() => celebrateSpecialGift(), 400);
      } else {
        setTimeout(() => celebrateTop(data.amount), 500);
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      const msg = err.message || '';
      if (
        msg.includes('đã nhận') ||
        msg.includes('đã được sử dụng') ||
        msg.includes('chỉ được nhận')
      ) {
        setAlreadyReceived(true);
        const check = await checkReceived(phone).catch(() => ({}));
        if (check.received) setResult({ amount: check.amount, label: check.label, isSpecialGift: !!check.isSpecialGift });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="nhan-lixi loading-wrap">
        <div className="loading-spinner" />
        <p>Đang tải...</p>
      </div>
    );
  }

  const now = Date.now();
  const startMs = config?.eventStartTime ? new Date(config.eventStartTime).getTime() : 0;
  const endMs = config?.eventEndTime ? new Date(config.eventEndTime).getTime() : 0;
  const eventNotStarted = startMs && now < startMs;
  const eventEnded = endMs && now >= startMs && now >= endMs;

  return (
    <div className="nhan-lixi">
      <motion.div
        className="nhan-lixi-inner"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="page-title">
          <span className="title-icon">🧧</span>
          Nhận Lì Xì
        </h1>

        {config?.eventStartTime && (
          <Countdown
            endTime={config.eventEndTime}
            startTime={config.eventStartTime}
            onEnd={() => setCountdownEnd(true)}
          />
        )}

        {eventNotStarted && !countdownEnd && (
          <div className="message-box info">
            Sự kiện chưa bắt đầu. Vui lòng quay lại sau.
          </div>
        )}

        {eventEnded && (
          <div className="message-box error">Sự kiện đã kết thúc.</div>
        )}

        {error && (
          <div className={`message-box ${alreadyReceived ? 'info' : 'error'}`}>
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {alreadyReceived && result ? (
            result.isSpecialGift ? (
              <motion.div
                key="received-special"
                className="received-block result-block--special-gift"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="received-title">Bạn đã nhận quà đặc biệt trước đó</p>
                <p className="special-gift-label received-special-label">{result.label}</p>
                {result.amount > 0 && (
                  <div className="received-amount">
                    <span className="amount-value">{result.amount.toLocaleString('vi-VN')}</span>
                    <span className="amount-label">VNĐ</span>
                  </div>
                )}
                <p className="received-sub">Cảm ơn bạn đã tham gia. Chúc bạn năm mới an khang! 🧧</p>
              </motion.div>
            ) : (
              <motion.div
                key="received"
                className="received-block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="received-title">Bạn đã nhận lì xì trước đó</p>
                <MoneyImage amount={result.amount} label={result.label} showAmount={true} />
                <div className="received-amount">
                  <span className="amount-value">{result.amount.toLocaleString('vi-VN')}</span>
                  <span className="amount-label">VNĐ</span>
                </div>
                <p className="received-sub">Cảm ơn bạn đã tham gia. Chúc bạn năm mới an khang!</p>
              </motion.div>
            )
          ) : result && envelopeOpen ? (
            result.isSpecialGift ? (
              <SpecialGiftResultScreen
                label={result.label}
                description={result.specialGiftDescription}
                amount={result.amount}
              />
            ) : (
              <ResultScreen
                amount={result.amount}
                label={result.label}
                blessing={result.blessing || getBlessingForAmount(result.amount)}
                isHigh={isHighAmount(result.amount)}
              />
            )
          ) : !config?.isLocked && !eventNotStarted && !eventEnded ? (
            <motion.form
              key="form"
              className="receive-form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {!envelopeOpen && (
                <div className="envelope-preview">
                  <Envelope open={false} />
                </div>
              )}
              <p className="form-desc">Điền thông tin để nhận lì xì may mắn</p>
              <div className="form-group">
                <label htmlFor="name">Họ và tên *</label>
                <input
                  id="name"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  maxLength={50}
                  disabled={submitting}
                  autoComplete="name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="age">Độ tuổi *</label>
                <input
                  id="age"
                  type="number"
                  placeholder="25"
                  min={1}
                  max={120}
                  value={form.age}
                  onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                  disabled={submitting}
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Số điện thoại *</label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="0901234567"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  disabled={submitting}
                  autoComplete="tel"
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-large"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="btn-spinner" />
                    Đang xử lý...
                  </>
                ) : (
                  'Mở bao lì xì'
                )}
              </button>
            </motion.form>
          ) : (
            <div className="message-box info">Sự kiện tạm thời đã đủ số lượng hoặc đã kết thúc.</div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
