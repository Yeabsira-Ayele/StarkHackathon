const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

router.get('/users/me', requireAuth, userController.getMe);
router.patch('/users/me', requireAuth, userController.updateMe);
router.patch('/users/me/password', requireAuth, userController.changePassword);
router.delete('/users/me', requireAuth, userController.deleteMe);

// Admin only
router.patch('/users/:id/status', requireAuth, requireAdmin, userController.setStatus);

module.exports = router;
