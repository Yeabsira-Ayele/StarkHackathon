const rateLimit = require('express-rate-limit');

const createCampaignLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true,
  message: { message: 'Too many requests, please try again later.', code: 'rate_limited' },
  skip: () => process.env.DISABLE_RATE_LIMIT === 'true',
});

const donationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.', code: 'rate_limited' },
  skip: () => process.env.DISABLE_RATE_LIMIT === 'true',
});

module.exports = { createCampaignLimiter, donationLimiter };
