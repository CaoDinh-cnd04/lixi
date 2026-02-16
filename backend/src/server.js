require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { apiLimiter } = require('./middleware/rateLimit');

const configRoutes = require('./routes/config');
const receiveRoutes = require('./routes/receive');
const statsRoutes = require('./routes/stats');
const adminRoutes = require('./routes/admin');
const qrRoutes = require('./routes/qr');

connectDB();

const app = express();
app.use(express.json({ limit: '10kb' }));
// Cho phép cả localhost và IP LAN (điện thoại quét QR cùng WiFi)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  /^http:\/\/192\.168\.\d+\.\d+:5173$/,
  /^http:\/\/10\.\d+\.\d+\.\d+:5173$/,
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.some(o => (typeof o === 'string' ? o === origin : o.test(origin)))) return cb(null, true);
    if (process.env.NODE_ENV !== 'production') return cb(null, true);
    return cb(null, false);
  },
  credentials: true,
}));
app.use('/api', apiLimiter);

app.use('/api/config', configRoutes);
app.use('/api/receive', receiveRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/qr', qrRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server chạy cổng ${PORT}`));
