const rateLimit = require('express-rate-limit');
const { errorBody } = require('../utils/apiResponse');

/**
 * Hook point for initialize/verify. Person 4 owns the global limiter.
 * Set DISABLE_RATE_LIMIT=true to skip this in local smoke tests.
 */
const donationWriteLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.DISABLE_RATE_LIMIT === 'true',
  handler(req, res) {
    res.status(429).json(errorBody('Too many payment attempts. Try again shortly.', 'RATE_LIMITED', {}));
  },
});

module.exports = {
  donationWriteLimiter,
};
