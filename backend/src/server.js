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
// Khi chạy sau proxy (Cloudflare Tunnel/ngrok/reverse proxy), request có X-Forwarded-For.
// express-rate-limit yêu cầu bật trust proxy để nhận diện IP đúng và không throw lỗi.
app.set('trust proxy', 1);
app.use(express.json({ limit: '10kb' }));
// CORS: localhost, IP LAN (điện thoại cùng WiFi), và FRONTEND_URL (vd. GitHub Pages)
const frontendUrl = (process.env.FRONTEND_URL || '').trim();
const allowedOrigins = [
  ...(frontendUrl ? [frontendUrl] : []),
  'http://localhost:5173',
  'https://localhost:5173',
  /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/,
  /^http:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/,
  /^https:\/\/[a-z0-9-]+\.github\.io(\/.*)?$/,  // GitHub Pages
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    const ok = allowedOrigins.some(o => {
      if (typeof o === 'string') return o === origin || origin === o.replace(/\/$/, '');
      return o.test(origin.replace(/\/$/, ''));
    });
    if (ok) return cb(null, true);
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
