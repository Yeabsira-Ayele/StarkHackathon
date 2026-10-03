const express = require('express');
const { rateLimit } = require('express-rate-limit');
const { login, me, register } = require('../controllers/authController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 10,
	standardHeaders: 'draft-8',
	legacyHeaders: false,
	message: { message: 'Too many account attempts. Please try again later.' },
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', requireAuth, me);

module.exports = router;