const crypto = require('crypto');
const AppError = require('../../utils/AppError');

/**
 * In-memory payment provider. PAYMENT_PROVIDER=mock.
 * initializePayment records a successful payment so verify/webhook can complete
 * the flow without calling links.et. State is lost when the process exits.
 */

/** @type {Map<string, { amount: number, currency: string, status: 'paid'|'failed'|'cancelled'|'pending', providerTransactionId: string }>} */
const payments = new Map();

/**
 * @returns {string}
 */
function webhookSecret() {
  return process.env.LINKS_ET_WEBHOOK_SECRET || 'mock-webhook-secret';
}

/**
 * @param {Buffer | string} rawBody
 * @returns {string} hex HMAC-SHA256
 */
function signWebhook(rawBody) {
  const body = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(String(rawBody));
  return crypto.createHmac('sha256', webhookSecret()).update(body).digest('hex');
}

/**
 * @param {{ amount: number, currency: string, txRef: string, returnUrl: string, callbackUrl: string, customer?: object }} input
 * @returns {Promise<{ checkoutUrl: string, providerTransactionId: string | null }>}
 */
async function initializePayment({ amount, currency, txRef, returnUrl }) {
  const providerTransactionId = `mock_${crypto.randomBytes(8).toString('hex')}`;
  payments.set(txRef, {
    amount,
    currency: String(currency || 'ETB').toUpperCase(),
    status: 'paid',
    providerTransactionId,
  });

  const base = returnUrl || 'http://localhost:5173/donations/return';
  const join = base.includes('?') ? '&' : '?';
  return {
    checkoutUrl: `${base}${join}txRef=${encodeURIComponent(txRef)}`,
    providerTransactionId: null,
  };
}

/**
 * @param {string | { txRef?: string, providerTransactionId?: string }} ref
 */
async function verifyPayment(ref) {
  const txRef = typeof ref === 'string' ? ref : ref?.txRef;
  const byProviderId = typeof ref === 'object' && ref?.providerTransactionId
    ? [...payments.entries()].find(([, value]) => value.providerTransactionId === ref.providerTransactionId)
    : null;
  const payment = (txRef && payments.get(txRef)) || (byProviderId && byProviderId[1]);

  if (!payment) {
    return {
      status: 'failed',
      amount: null,
      currency: null,
      providerTransactionId: null,
    };
  }

  return {
    status: payment.status,
    amount: payment.amount,
    currency: payment.currency,
    providerTransactionId: payment.providerTransactionId,
  };
}

/**
 * Mock webhook body is `{ "txRef": "..." }`. Amount is ignored; verifyPayment
 * is the source of truth.
 * @param {Buffer | string} rawBody
 * @returns {{ txRef: string }}
 */
function parseWebhook(rawBody) {
  let event;
  try {
    const text = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : String(rawBody || '');
    event = JSON.parse(text);
  } catch {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', { body: 'Webhook body must be JSON' });
  }
  const txRef = event && typeof event.txRef === 'string' ? event.txRef : '';
  return { txRef };
}

/**
 * @param {Buffer | string} rawBody
 * @param {import('http').IncomingHttpHeaders} headers
 * @returns {boolean}
 */
function verifyWebhookSignature(rawBody, headers) {
  const provided = headers['x-mock-signature'];
  if (!provided || typeof provided !== 'string') return false;
  const expected = signWebhook(rawBody);
  if (provided.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

module.exports = {
  initializePayment,
  verifyPayment,
  verifyWebhookSignature,
  parseWebhook,
  signWebhook,
};
