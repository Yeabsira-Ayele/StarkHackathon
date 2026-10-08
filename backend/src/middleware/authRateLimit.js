const rateLimit = require('express-rate-limit');

// Slows down people who try many passwords or codes in a row.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts, please try again later.',
    error: { code: 'RATE_LIMITED', fields: {} },
  },
  skip: () => process.env.DISABLE_RATE_LIMIT === 'true',
});

module.exports = { authLimiter };
