const express = require('express');
const donationRoutes = require('./donation.routes');
const searchRoutes = require('./search.routes');
const reportRoutes = require('./report.routes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'ok',
    data: { service: 'lewegene', scope: 'person3' },
  });
});

router.use('/donations', donationRoutes);
router.use('/search', searchRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
