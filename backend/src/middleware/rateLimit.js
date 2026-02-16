const rateLimit = require('express-rate-limit');

const receiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Quá nhiều yêu cầu. Thử lại sau.' },
  standardHeaders: true,
  legacyHeaders: false
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { receiveLimiter, apiLimiter };
