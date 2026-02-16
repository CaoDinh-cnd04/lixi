const mongoose = require('mongoose');

const denominationSchema = new mongoose.Schema({
  value: { type: Number, required: true },
  label: { type: String, required: true },
  percentage: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 100 }
});

const specialGiftSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: false },
  label: { type: String, default: 'Quà đặc biệt' },
  description: { type: String, default: 'Phong bì đặc biệt từ gia chủ' },
  amount: { type: Number, default: 0 }
}, { _id: false });

const configSchema = new mongoose.Schema({
  maxRecipients: { type: Number, required: true, default: 100 },
  denominations: [denominationSchema],
  specialGift: { type: specialGiftSchema, default: () => ({}) },
  eventStartTime: { type: Date, default: null },
  eventEndTime: { type: Date, default: null },
  isLocked: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Config', configSchema);
