const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireAdmin, requireOrganization } = require('../middleware/roleMiddleware');
const { authLimiter } = require('../middleware/authRateLimit');

router.post('/organizations/signup', authLimiter, requireAuth, organizationController.signup);

// Owner-scoped organization access ("/me" routes must come before "/:id")
router.get('/organizations/me', requireAuth, organizationController.getMine);
router.patch('/organizations/me', requireAuth, requireOrganization, organizationController.updateMine);

// Public: approved organizations only, public fields only
router.get('/organizations', organizationController.listPublic);

// Admin only
router.get('/admin/organizations', requireAuth, requireAdmin, organizationController.list);
router.patch('/organizations/:id/verification', requireAuth, requireAdmin, organizationController.setVerification);
router.patch(
    '/organizations/:id/payout-accounts/:accountId/verification',
    requireAuth,
    requireAdmin,
    organizationController.verifyPayoutAccount
);

// Public: one approved organization
router.get('/organizations/:id', organizationController.getPublic);

module.exports = router;