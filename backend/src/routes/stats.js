const express = require('express');
const router = express.Router();
const Recipient = require('../models/Recipient');
const Config = require('../models/Config');
const { authAdmin } = require('../middleware/auth');

router.get('/', authAdmin, async (req, res) => {
  try {
    const [totalRecipients, totalAmount, byDenomination, config] = await Promise.all([
      Recipient.countDocuments(),
      Recipient.aggregate([{ $group: { _id: null, sum: { $sum: '$amount' } } }]),
      Recipient.aggregate([
        { $group: { _id: '$denominationLabel', amount: { $first: '$amount' }, count: { $sum: 1 } } },
        { $sort: { amount: 1 } }
      ]),
      Config.findOne().sort({ updatedAt: -1 })
    ]);
    const totalMoney = totalAmount[0]?.sum || 0;
    const maxRecipients = config?.maxRecipients || 0;
    const estimatedBudget = (config?.denominations || []).reduce(
      (s, d) => s + (d.value || 0) * Math.max(1, parseInt(d.quantity, 10) || 0),
      0
    );
    res.json({
      success: true,
      data: {
        totalRecipients,
        totalMoney,
        maxRecipients,
        estimatedBudget,
        isLocked: config?.isLocked ?? false,
        byDenomination: byDenomination.map((d) => ({
          label: d._id,
          amount: d.amount,
          count: d.count,
          total: d.amount * d.count
        }))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/list', authAdmin, async (req, res) => {
  try {
    const list = await Recipient.find()
      .select('name age phone amount denominationLabel receivedAt')
      .sort({ receivedAt: -1 })
      .limit(500)
      .lean();
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
