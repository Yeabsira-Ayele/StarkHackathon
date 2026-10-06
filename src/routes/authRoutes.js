const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/authRateLimit');

router.post('/auth/google', authLimiter, authController.loginWithGoogle);

router.post('/auth/logout', requireAuth, authController.logout);
router.get('/auth/me', requireAuth, userController.getMe);

module.exports = router;
