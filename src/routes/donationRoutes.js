const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const { donationLimiter } = require('../middleware/rateLimits');
const { requireAuth, optionalAuth } = require('../middleware/authMiddleware');

router.get('/donations/record/:id', requireAuth, donationController.getDonationById);
router.get('/users/me/donations', requireAuth, donationController.getMyDonations);
// List completed donations for a campaign
router.get('/donations/:campaignId', donationController.getDonationsByCampaign);

// Submit a payment receipt link; verified through links.et, then recorded
router.post('/donations/:campaignId', optionalAuth, donationLimiter, donationController.createDonation);

module.exports = router;