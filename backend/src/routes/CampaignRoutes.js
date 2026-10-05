const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
const adminAuth = require('../middleware/adminAuth');
const { createCampaignLimiter } = require('../middleware/rateLimits');
const { requireAuth, optionalAuth } = require('../middleware/authMiddleware');

router.get('/campaigns', campaignController.getCampaigns);
router.get('/campaigns/mine', requireAuth, campaignController.getMyCampaigns);
router.post('/campaigns/drafts', requireAuth, campaignController.createDraft);
router.get('/campaigns/:id', optionalAuth, campaignController.getCampaignById);
router.post('/campaigns', requireAuth, createCampaignLimiter, campaignController.createCampaign);
router.post('/campaigns/:id/updates', requireAuth, campaignController.postCampaignUpdate);
router.patch('/campaigns/:id', requireAuth, campaignController.updateCampaign);
router.post('/campaigns/:id/submit', requireAuth, campaignController.submitCampaign);
router.post('/campaigns/:id/delete-request', requireAuth, campaignController.requestCampaignDelete);

// These are admin-only until user accounts exist
router.delete('/campaigns/:id', adminAuth, campaignController.deleteCampaign);

module.exports = router;