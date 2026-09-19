const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');

router.get('/campaigns', campaignController.getCampaigns);
router.get('/campaigns/:id', campaignController.getCampaignById);
router.post('/campaigns', campaignController.createCampaign);

// Add auth middleware to these two once you have user accounts
router.patch('/campaigns/:id', campaignController.updateCampaign);
router.delete('/campaigns/:id', campaignController.deleteCampaign);

module.exports = router;