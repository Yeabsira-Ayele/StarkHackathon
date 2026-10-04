const donationService = require('../services/donation.service');
const { getProvider } = require('../services/payment');
const { sendSuccess } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');

/**
 * POST /api/payments/webhook
 * The route is mounted with express.raw before express.json.
 * @type {import('express').RequestHandler}
 */
async function webhook(req, res) {
  const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || '');
  const valid = getProvider().verifyWebhookSignature(raw, req.headers);
  if (!valid) {
    throw new AppError('Invalid webhook signature', 401, 'INVALID_SIGNATURE');
  }

  const parsed = getProvider().parseWebhook(raw);
  const txRef = parsed && typeof parsed.txRef === 'string' ? parsed.txRef : '';
  if (!txRef) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', { txRef: 'Required' });
  }

  const result = await donationService.finalizeDonation(txRef, { missing: 'ignore' });

  if (result.ignored) {
    sendSuccess(res, { message: 'Ignored', data: {} });
    return;
  }
  if (result.alreadyProcessed) {
    sendSuccess(res, { message: 'Already processed', data: {} });
    return;
  }

  sendSuccess(res, {
    message: result.pending ? 'Payment is still pending' : 'Payment recorded',
    data: {
      txRef,
      status: result.donation ? result.donation.status : 'pending',
    },
  });
}

module.exports = { webhook };
