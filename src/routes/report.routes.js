const express = require('express');
const { requireAuth } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { asyncHandler } = require('../utils/asyncHandler');
const { createReportSchema, paginationQuerySchema } = require('../validators/report.validator');
const reportController = require('../controllers/report.controller');

const router = express.Router();

router.post(
  '/',
  requireAuth,
  validate(createReportSchema),
  asyncHandler(reportController.create)
);

router.get(
  '/mine',
  requireAuth,
  validate(paginationQuerySchema, 'query'),
  asyncHandler(reportController.mine)
);

module.exports = router;
