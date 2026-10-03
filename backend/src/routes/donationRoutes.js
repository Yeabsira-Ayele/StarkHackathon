const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const { donationLimiter } = require('../middleware/rateLimits');

// List completed donations for a campaign
router.get('/donations/:campaignId', donationController.getDonationsByCampaign);

// Submit a payment receipt link; verified through links.et, then recorded
router.post('/donations/:campaignId', donationLimiter, donationController.createDonation);

module.exports = router;