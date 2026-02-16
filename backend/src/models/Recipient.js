const mongoose = require('mongoose');
const crypto = require('crypto');

const recipientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  age: { type: Number, required: true, min: 1, max: 120 },
  phone: { type: String, required: true, trim: true },
  phoneHash: { type: String, required: true },
  nameAgeHash: { type: String, required: true },
  amount: { type: Number, required: true },
  denominationLabel: { type: String, required: true },
  isSpecialGift: { type: Boolean, default: false },
  ipHash: { type: String, default: '' },
  receivedAt: { type: Date, default: Date.now }
}, { timestamps: true });

recipientSchema.index({ phoneHash: 1 });
recipientSchema.index({ nameAgeHash: 1 });
recipientSchema.index({ ipHash: 1 });

function hash(s) {
  return crypto.createHash('sha256').update(String(s)).digest('hex');
}

recipientSchema.statics.hashPhone = (phone) => hash((phone || '').trim().toLowerCase());
recipientSchema.statics.hashNameAge = (name, age) => hash(`${(name || '').trim().toLowerCase()}-${age}`);
recipientSchema.statics.hashIp = (ip) => hash(ip || 'unknown');

module.exports = mongoose.model('Recipient', recipientSchema);
