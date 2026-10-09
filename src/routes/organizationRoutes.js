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

// Admin only
router.get('/organizations', organizationController.listPublic);
router.get('/admin/organizations', requireAuth, requireAdmin, organizationController.list);
router.patch('/organizations/:id/verification', requireAuth, requireAdmin, organizationController.setVerification);

// Public: approved organizations only
router.get('/organizations/:id', organizationController.getPublic);

module.exports = router;
