const donationService = require('../services/donation.service');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * POST /api/donations/initialize
 * @type {import('express').RequestHandler}
 */
async function initialize(req, res) {
  const data = await donationService.initializeDonation({
    user: req.user,
    body: req.validated,
  });
  sendSuccess(res, { status: 201, message: 'Donation initialized', data });
}

/**
 * POST /api/donations/verify/:txRef
 * @type {import('express').RequestHandler}
 */
async function verify(req, res) {
  const result = await donationService.verifyDonation(req.params.txRef, req.user);
  const message = result.pending
    ? 'Payment is still pending'
    : result.alreadyProcessed
      ? 'Donation already processed'
      : 'Donation confirmed';
  sendSuccess(res, { message, data: result });
}

/**
 * GET /api/donations/:id/receipt
 * @type {import('express').RequestHandler}
 */
async function receipt(req, res) {
  const data = await donationService.getReceipt(req.params.id, req.user);
  sendSuccess(res, { message: 'Receipt', data });
}

/**
 * GET /api/donations/mine
 * @type {import('express').RequestHandler}
 */
async function mine(req, res) {
  const data = await donationService.listMyDonations(req.user, req.validatedQuery);
  sendSuccess(res, { message: 'Your donations', data });
}

/**
 * GET /api/donations/campaign/:campaignId
 * Mounted here so it does not collide with Person 2's /api/campaigns router.
 * @type {import('express').RequestHandler}
 */
async function listForCampaign(req, res) {
  const data = await donationService.listCampaignDonations(
    req.params.campaignId,
    req.validatedQuery,
    req.user
  );
  sendSuccess(res, { message: 'Campaign donations', data });
}

module.exports = {
  initialize,
  verify,
  receipt,
  mine,
  listForCampaign,
};
