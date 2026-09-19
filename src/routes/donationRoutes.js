const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');

// List completed donations for a campaign
router.get('/donations/:campaignId', donationController.getDonationsByCampaign);

// Create a (pending) donation for a campaign
router.post('/donations/:campaignId', donationController.createDonation);

// Confirm or fail a payment (use from webhook / admin only; protect in production)
router.patch('/donations/:donationId/status', donationController.updatePaymentStatus);

module.exports = router;