const express = require('express');
const router = express.Router();
const Config = require('../models/Config');
const { authAdmin } = require('../middleware/auth');

const defaultDenoms = [
  { value: 10000, label: '10k', percentage: 40, quantity: 40 },
  { value: 20000, label: '20k', percentage: 30, quantity: 30 },
  { value: 50000, label: '50k', percentage: 20, quantity: 20 },
  { value: 100000, label: '100k', percentage: 10, quantity: 10 }
];

router.get('/public', async (req, res) => {
  try {
    let config = await Config.findOne().sort({ updatedAt: -1 });
    if (!config) {
      config = await Config.create({ maxRecipients: 100, denominations: defaultDenoms });
    }
    res.json({
      success: true,
      data: {
        maxRecipients: config.maxRecipients,
        denominations: config.denominations,
        specialGift: config.specialGift || {},
        eventStartTime: config.eventStartTime,
        eventEndTime: config.eventEndTime,
        isLocked: config.isLocked
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/', authAdmin, async (req, res) => {
  try {
    let config = await Config.findOne().sort({ updatedAt: -1 });
    if (!config) {
      config = await Config.create({ maxRecipients: 100, denominations: defaultDenoms });
    }
    res.json({ success: true, data: config });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/', authAdmin, async (req, res) => {
  try {
    const { maxRecipients, denominations, specialGift, eventStartTime, eventEndTime, isLocked } = req.body;
    if (denominations && denominations.length) {
      const total = denominations.reduce((s, d) => s + (d.percentage || 0), 0);
      if (Math.abs(total - 100) > 0.01) {
        return res.status(400).json({ success: false, message: 'Tổng tỉ lệ phải bằng 100%' });
      }
    }
    let config = await Config.findOne().sort({ updatedAt: -1 });
    if (!config) config = new Config({ maxRecipients: 100, denominations: defaultDenoms });
    if (maxRecipients != null) config.maxRecipients = maxRecipients;
    if (denominations) config.denominations = denominations;
    if (specialGift !== undefined) {
      config.specialGift = {
        enabled: !!specialGift?.enabled,
        label: String(specialGift?.label || 'Quà đặc biệt').trim() || 'Quà đặc biệt',
        description: String(specialGift?.description || '').trim(),
        amount: typeof specialGift?.amount === 'number' ? specialGift.amount : (parseInt(specialGift?.amount, 10) || 0)
      };
    }
    if (eventStartTime !== undefined) config.eventStartTime = eventStartTime || null;
    if (eventEndTime !== undefined) config.eventEndTime = eventEndTime || null;
    if (typeof isLocked === 'boolean') config.isLocked = isLocked;
    config.updatedAt = new Date();
    await config.save();
    res.json({ success: true, data: config });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
