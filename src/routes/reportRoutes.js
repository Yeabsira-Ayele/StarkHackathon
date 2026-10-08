const express = require('express');
const reportController = require('../controllers/reportController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/reports/transparency', reportController.getTransparencyOverview);
router.get('/reports/audits/:id', reportController.getTransparencyCampaign);
router.post('/reports', requireAuth, reportController.create);
router.get('/reports/me', requireAuth, reportController.getMine);
router.get('/admin/reports', requireAuth, requireAdmin, reportController.getAdminReports);
router.patch('/admin/reports/:id', requireAuth, requireAdmin, reportController.updateStatus);

module.exports = router;
