const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');

// List completed donations for a campaign
router.get('/donations/:campaignId', donationController.getDonationsByCampaign);

// Submit a payment receipt link; verified through links.et, then recorded
router.post('/donations/:campaignId', donationController.createDonation);

module.exports = router;