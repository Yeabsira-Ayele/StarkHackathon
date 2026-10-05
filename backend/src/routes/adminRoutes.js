const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

router.get('/admin/campaigns', requireAuth, requireAdmin, adminController.getPendingCampaigns);
router.patch('/admin/campaigns/:id', requireAuth, requireAdmin, adminController.reviewCampaign);

module.exports = router;
