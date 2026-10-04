const express = require('express');
const { validate } = require('../middlewares/validate');
const { asyncHandler } = require('../utils/asyncHandler');
const { searchQuerySchema } = require('../validators/search.validator');
const searchController = require('../controllers/search.controller');

const router = express.Router();

router.get(
  '/campaigns',
  validate(searchQuerySchema, 'query'),
  asyncHandler(searchController.searchCampaigns)
);

module.exports = router;
