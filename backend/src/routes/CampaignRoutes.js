const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
const adminAuth = require('../middleware/adminAuth');
const { createCampaignLimiter } = require('../middleware/rateLimits');

router.get('/campaigns', campaignController.getCampaigns);
router.get('/campaigns/:id', campaignController.getCampaignById);
router.post('/campaigns', createCampaignLimiter, campaignController.createCampaign);

// These are admin-only until user accounts exist
router.patch('/campaigns/:id', adminAuth, campaignController.updateCampaign);
router.delete('/campaigns/:id', adminAuth, campaignController.deleteCampaign);

module.exports = router;