const searchService = require('../services/search.service');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * GET /api/search/campaigns
 * @type {import('express').RequestHandler}
 */
async function searchCampaigns(req, res) {
  const data = await searchService.searchCampaigns(req.validatedQuery);
  sendSuccess(res, { message: 'Campaigns', data });
}

module.exports = { searchCampaigns };
