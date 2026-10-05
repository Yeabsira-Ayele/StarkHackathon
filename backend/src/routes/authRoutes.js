const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/authRateLimit');

router.post('/auth/signup/request-otp', authLimiter, authController.requestSignupOtp);
router.post('/auth/signup', authLimiter, authController.signup);
router.post('/auth/login', authLimiter, authController.login);
router.post('/auth/forgot-password', authLimiter, authController.forgotPassword);
router.post('/auth/reset-password', authLimiter, authController.resetPassword);

router.post('/auth/logout', requireAuth, authController.logout);
router.get('/auth/me', requireAuth, userController.getMe);

module.exports = router;
