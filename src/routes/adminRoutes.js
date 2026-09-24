const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const adminController = require('../controllers/adminController');

router.get('/admin/campaigns', adminAuth, adminController.getPendingCampaigns);
router.patch('/admin/campaigns/:id', adminAuth, adminController.reviewCampaign);

module.exports = router;
