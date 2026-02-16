const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');

router.get('/', async (req, res) => {
  try {
    let base = (req.query.baseUrl || req.headers['x-qr-base-url'] || '').trim();
    const fallback = process.env.FRONTEND_URL || 'http://localhost:5173';
    if (!base || !/^https?:\/\/[^/]+/i.test(base)) base = fallback;
    base = base.replace(/\/$/, '');
    const receiveUrl = `${base}/nhan-lixi`;
    const qrDataUrl = await QRCode.toDataURL(receiveUrl, { width: 400, margin: 2 });
    res.json({ success: true, data: { qrDataUrl, receiveUrl } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
