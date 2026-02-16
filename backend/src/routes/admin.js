const express = require('express');
const router = express.Router();

router.get('/verify', (req, res) => {
  const key = (req.headers['x-admin-key'] || req.query.code || '').trim();
  const secret = (process.env.ADMIN_SECRET || 'admin').trim();
  if (key && key === secret) {
    return res.json({ success: true });
  }
  res.status(401).json({ success: false, message: 'Mã admin không đúng' });
});

module.exports = router;
