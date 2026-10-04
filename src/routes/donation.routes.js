const express = require('express');
const { requireAuth, optionalAuth } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { validateObjectId } = require('../middlewares/objectId');
const { donationWriteLimiter } = require('../middlewares/rateLimit');
const { asyncHandler } = require('../utils/asyncHandler');
const { initializeDonationSchema, paginationQuerySchema } = require('../validators/donation.validator');
const donationController = require('../controllers/donation.controller');

const router = express.Router();

router.post(
  '/initialize',
  optionalAuth,
  donationWriteLimiter,
  validate(initializeDonationSchema),
  asyncHandler(donationController.initialize)
);

router.post(
  '/verify/:txRef',
  optionalAuth,
  donationWriteLimiter,
  asyncHandler(donationController.verify)
);

router.get(
  '/mine',
  requireAuth,
  validate(paginationQuerySchema, 'query'),
  asyncHandler(donationController.mine)
);

// Not /api/campaigns/:id/donations — that router belongs to Person 2.
router.get(
  '/campaign/:campaignId',
  optionalAuth,
  validateObjectId('campaignId'),
  validate(paginationQuerySchema, 'query'),
  asyncHandler(donationController.listForCampaign)
);

router.get(
  '/:id/receipt',
  requireAuth,
  validateObjectId('id'),
  asyncHandler(donationController.receipt)
);

module.exports = router;
