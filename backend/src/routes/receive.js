const express = require('express');
const router = express.Router();
const Config = require('../models/Config');
const Recipient = require('../models/Recipient');
const validator = require('validator');
const { receiveLimiter } = require('../middleware/rateLimit');

function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || '';
}

const SPECIAL_GIFT_LABEL = '__special_gift__';

function pickRandom(denominations, recipients, specialGift) {
  const countByLabel = {};
  recipients.forEach((r) => {
    const l = r.isSpecialGift ? SPECIAL_GIFT_LABEL : (r.denominationLabel || String(r.amount));
    countByLabel[l] = (countByLabel[l] || 0) + 1;
  });
  let pool = denominations.filter((d) => {
    const q = Math.max(1, parseInt(d.quantity, 10) || 999);
    return (countByLabel[d.label] || 0) < q;
  });
  if (specialGift && specialGift.enabled && specialGift.label && (countByLabel[SPECIAL_GIFT_LABEL] || 0) < 1) {
    pool = [...pool, {
      value: specialGift.amount || 0,
      label: SPECIAL_GIFT_LABEL,
      percentage: 1,
      quantity: 1,
      isSpecialGift: true,
      specialGiftLabel: specialGift.label,
      specialGiftDescription: specialGift.description || ''
    }];
  }
  if (pool.length === 0) return null;
  const totalPct = pool.reduce((s, d) => s + (d.percentage || 0), 0);
  if (totalPct <= 0) return pool[0];
  let r = Math.random() * totalPct;
  for (const d of pool) {
    r -= d.percentage || 0;
    if (r <= 0) return d;
  }
  return pool[pool.length - 1];
}

router.post('/', receiveLimiter, async (req, res) => {
  try {
    const { name, age, phone, ip: clientIp } = req.body;
    const ip = clientIp && String(clientIp).trim() ? String(clientIp).trim() : getClientIp(req);
    const nameTrim = String(name || '').trim();
    const ageNum = parseInt(age, 10);
    const phoneStr = String(phone || '').replace(/\s/g, '');

    if (!nameTrim || nameTrim.length < 2) {
      return res.status(400).json({ success: false, message: 'Họ tên không hợp lệ (tối thiểu 2 ký tự)' });
    }
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      return res.status(400).json({ success: false, message: 'Độ tuổi phải từ 1 đến 120' });
    }
    const validPhone = /^[0-9]{9,11}$/.test(phoneStr) || validator.isMobilePhone(phoneStr, 'vi-VN');
    if (!phoneStr || !validPhone) {
      return res.status(400).json({ success: false, message: 'Số điện thoại không hợp lệ' });
    }

    let config = await Config.findOne().sort({ updatedAt: -1 });
    if (!config) {
      return res.status(503).json({ success: false, message: 'Chưa cấu hình sự kiện' });
    }
    if (config.isLocked) {
      return res.status(403).json({ success: false, message: 'Sự kiện đã kết thúc' });
    }
    const now = new Date();
    if (config.eventStartTime && now < config.eventStartTime) {
      return res.status(403).json({ success: false, message: 'Sự kiện chưa bắt đầu' });
    }
    if (config.eventEndTime && now > config.eventEndTime) {
      return res.status(403).json({ success: false, message: 'Sự kiện đã kết thúc' });
    }

    const count = await Recipient.countDocuments();
    if (count >= config.maxRecipients) {
      return res.status(403).json({ success: false, message: 'Đã đủ số lượng người nhận lì xì' });
    }

    const phoneHash = Recipient.hashPhone(phoneStr);
    const nameAgeHash = Recipient.hashNameAge(nameTrim, ageNum);
    const ipHash = ip ? Recipient.hashIp(ip) : '';

    if (await Recipient.findOne({ phoneHash })) {
      return res.status(409).json({ success: false, message: 'Bạn đã nhận lì xì trước đó' });
    }
    if (await Recipient.findOne({ nameAgeHash })) {
      return res.status(409).json({ success: false, message: 'Thông tin (họ tên + độ tuổi) đã được sử dụng nhận lì xì' });
    }
    const byNamePhone = await Recipient.findOne({
      name: nameTrim,
      phoneHash
    });
    if (byNamePhone) {
      return res.status(409).json({ success: false, message: 'Họ tên và số điện thoại này đã được sử dụng nhận lì xì' });
    }
    if (ipHash && (await Recipient.findOne({ ipHash }))) {
      return res.status(409).json({ success: false, message: 'Mỗi mạng/thiết bị chỉ được nhận lì xì 1 lần' });
    }

    const specialGift = config.specialGift || {};
    let recipients = await Recipient.find().lean();
    let picked = pickRandom(config.denominations, recipients, specialGift);
    if (!picked) {
      return res.status(503).json({ success: false, message: 'Đã hết lượt lì xì hoặc chưa cấu hình mệnh giá' });
    }

    let isSpecialGift = !!picked.isSpecialGift;
    let displayLabel = isSpecialGift ? (specialGift.label || 'Quà đặc biệt') : picked.label;

    // Kiểm tra lại số lượng tờ ngay trước khi tạo (tránh race: 2 request cùng lúc chọn 1 mệnh giá)
    const quantityForPicked = Math.max(1, parseInt(picked.quantity, 10) || 1);
    let countForLabel = await Recipient.countDocuments({ denominationLabel: displayLabel });
    if (countForLabel >= quantityForPicked) {
      recipients = await Recipient.find().lean();
      const picked2 = pickRandom(config.denominations, recipients, specialGift);
      if (!picked2) {
        return res.status(503).json({ success: false, message: 'Đã hết lượt lì xì hoặc chưa cấu hình mệnh giá' });
      }
      const displayLabel2 = picked2.isSpecialGift ? (specialGift.label || 'Quà đặc biệt') : picked2.label;
      const q2 = Math.max(1, parseInt(picked2.quantity, 10) || 1);
      const count2 = await Recipient.countDocuments({ denominationLabel: displayLabel2 });
      if (count2 >= q2) {
        return res.status(503).json({ success: false, message: 'Đã hết lượt lì xì. Vui lòng thử lại.' });
      }
      picked = picked2;
      displayLabel = displayLabel2;
      isSpecialGift = !!picked.isSpecialGift;
    }

    await Recipient.create({
      name: nameTrim,
      age: ageNum,
      phone: phoneStr,
      phoneHash,
      nameAgeHash,
      amount: picked.value,
      denominationLabel: displayLabel,
      isSpecialGift,
      ipHash
    });

    const newCount = await Recipient.countDocuments();
    if (newCount >= config.maxRecipients) {
      config.isLocked = true;
      config.updatedAt = new Date();
      await config.save();
    }

    res.json({
      success: true,
      data: {
        amount: picked.value,
        label: displayLabel,
        isSpecialGift,
        specialGiftDescription: isSpecialGift ? (specialGift.description || '') : undefined
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/check', async (req, res) => {
  try {
    const phone = req.query.phone || '';
    const phoneHash = Recipient.hashPhone(phone);
    const r = await Recipient.findOne({ phoneHash }).select('amount denominationLabel isSpecialGift').lean();
    res.json({
      success: true,
      data: r ? {
        received: true,
        amount: r.amount,
        label: r.denominationLabel,
        isSpecialGift: !!r.isSpecialGift
      } : { received: false }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
