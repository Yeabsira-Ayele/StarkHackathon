const crypto = require('crypto');
const AppError = require('../../utils/AppError');

/**
 * links.et checkout adapter.
 *
 * TODO(links.et): The official request paths, header names, and JSON field names
 * are NOT filled in. Do not guess them. Set every empty string in CONTRACT from
 * the links.et docs, then this adapter will send those fields. Until then the
 * methods fail closed with PAYMENT_CONTRACT_MISSING.
 *
 * The mock provider (PAYMENT_PROVIDER=mock) implements the same method names
 * and is what local tests should use.
 */

const CONTRACT = {
  initializePath: '', // TODO(links.et): path beginning with /
  initializeAmountField: '', // TODO(links.et)
  initializeCurrencyField: '', // TODO(links.et)
  initializeTxRefField: '', // TODO(links.et)
  initializeReturnUrlField: '', // TODO(links.et)
  initializeCallbackUrlField: '', // TODO(links.et)
  checkoutUrlField: '', // TODO(links.et): response field that holds the checkout URL
  verifyPath: '', // TODO(links.et): path; use :txRef or :providerTransactionId as placeholders
  verifyAmountField: '', // TODO(links.et)
  verifyCurrencyField: '', // TODO(links.et)
  verifyStatusField: '', // TODO(links.et): value we map onto paid|failed|cancelled|pending
  verifyProviderTransactionIdField: '', // TODO(links.et)
  paidStatusValue: '', // TODO(links.et)
  failedStatusValue: '', // TODO(links.et)
  cancelledStatusValue: '', // TODO(links.et)
  pendingStatusValue: '', // TODO(links.et)
  signatureHeader: '', // TODO(links.et): lower-case header name
  webhookTxRefField: '', // TODO(links.et): JSON field that carries our txRef
};

/**
 * @param {string[]} keys
 */
function assertContract(keys) {
  const missing = keys.filter((key) => !CONTRACT[key]);
  if (missing.length) {
    throw new AppError(
      'links.et API contract is not filled in yet. See TODO(links.et) in linksEtProvider.js.',
      501,
      'PAYMENT_CONTRACT_MISSING',
      { missing: missing.join(', ') }
    );
  }
}

function assertConfigured() {
  if (!process.env.LINKS_ET_API_KEY || !process.env.LINKS_ET_BASE_URL) {
    throw new AppError('links.et is not configured', 503, 'PAYMENT_NOT_CONFIGURED');
  }
}

/**
 * @param {string} path
 * @param {RequestInit} [init]
 */
async function linksFetch(path, init = {}) {
  const base = String(process.env.LINKS_ET_BASE_URL).replace(/\/+$/, '');
  let response;
  try {
    response = await fetch(base + path, {
      ...init,
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.LINKS_ET_API_KEY,
        ...(init.headers || {}),
      },
      signal: AbortSignal.timeout(30000),
    });
  } catch (err) {
    console.error('[links.et] request failed:', err.name);
    throw new AppError('Could not reach links.et', 503, 'PAYMENT_UNAVAILABLE');
  }
  return response;
}

/**
 * Reads a dotted path. Returns undefined when any segment is missing.
 * @param {object} source
 * @param {string} dotted
 */
function readField(source, dotted) {
  if (!dotted) return undefined;
  return dotted.split('.').reduce((current, key) => {
    if (current == null) return undefined;
    return current[key];
  }, source);
}

/**
 * Maps a provider status string onto our four outcomes. Unknown values stay pending
 * so we never credit money we cannot classify.
 * @param {string} raw
 * @returns {'paid' | 'failed' | 'cancelled' | 'pending'}
 */
function mapStatus(raw) {
  const value = String(raw || '');
  if (CONTRACT.paidStatusValue && value === CONTRACT.paidStatusValue) return 'paid';
  if (CONTRACT.failedStatusValue && value === CONTRACT.failedStatusValue) return 'failed';
  if (CONTRACT.cancelledStatusValue && value === CONTRACT.cancelledStatusValue) return 'cancelled';
  if (CONTRACT.pendingStatusValue && value === CONTRACT.pendingStatusValue) return 'pending';
  return 'pending';
}

/**
 * Starts a checkout. Returns { checkoutUrl, providerTransactionId }.
 * @param {{ amount: number, currency: string, txRef: string, returnUrl: string, callbackUrl: string, customer: object }} input
 */
async function initializePayment(input) {
  assertConfigured();
  assertContract([
    'initializePath',
    'initializeAmountField',
    'initializeCurrencyField',
    'initializeTxRefField',
    'initializeReturnUrlField',
    'initializeCallbackUrlField',
    'checkoutUrlField',
  ]);

  const body = {
    [CONTRACT.initializeAmountField]: input.amount,
    [CONTRACT.initializeCurrencyField]: input.currency,
    [CONTRACT.initializeTxRefField]: input.txRef,
    [CONTRACT.initializeReturnUrlField]: input.returnUrl,
    [CONTRACT.initializeCallbackUrlField]: input.callbackUrl,
  };

  const response = await linksFetch(CONTRACT.initializePath, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    console.error('[links.et] initialize failed', { status: response.status, txRef: input.txRef });
    throw new AppError('Could not start the payment', 502, 'PAYMENT_INIT_FAILED');
  }

  const checkoutUrl = readField(payload, CONTRACT.checkoutUrlField);
  if (!checkoutUrl || typeof checkoutUrl !== 'string') {
    console.error('[links.et] initialize response missing checkout url', { txRef: input.txRef });
    throw new AppError('Payment provider returned no checkout url', 502, 'PAYMENT_INIT_FAILED');
  }

  return {
    checkoutUrl,
    providerTransactionId: null,
  };
}

/**
 * Confirms a payment with links.et. Accepts a txRef string or
 * `{ txRef, providerTransactionId }`.
 * @param {string | { txRef?: string, providerTransactionId?: string }} ref
 * @returns {Promise<{ status: 'paid'|'failed'|'cancelled'|'pending', amount: number|null, currency: string|null, providerTransactionId: string|null }>}
 */
async function verifyPayment(ref) {
  assertConfigured();
  assertContract([
    'verifyPath',
    'verifyAmountField',
    'verifyCurrencyField',
    'verifyStatusField',
    'verifyProviderTransactionIdField',
    'paidStatusValue',
  ]);

  const txRef = typeof ref === 'string' ? ref : ref?.txRef;
  const providerTransactionId = typeof ref === 'object' && ref ? ref.providerTransactionId : undefined;

  const path = CONTRACT.verifyPath
    .replace(':txRef', encodeURIComponent(txRef || ''))
    .replace(':providerTransactionId', encodeURIComponent(providerTransactionId || ''));

  const response = await linksFetch(path, { method: 'GET' });
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    console.error('[links.et] verify failed', { status: response.status, txRef });
    return {
      status: 'failed',
      amount: null,
      currency: null,
      providerTransactionId: providerTransactionId || null,
    };
  }

  const amount = Number(readField(payload, CONTRACT.verifyAmountField));
  const currency = readField(payload, CONTRACT.verifyCurrencyField);
  const statusRaw = readField(payload, CONTRACT.verifyStatusField);
  const id = readField(payload, CONTRACT.verifyProviderTransactionIdField);

  return {
    status: mapStatus(statusRaw),
    amount: Number.isFinite(amount) ? amount : null,
    currency: currency ? String(currency).toUpperCase() : null,
    providerTransactionId: id ? String(id) : providerTransactionId || null,
  };
}

/**
 * Reads our txRef from a links.et webhook body. Fails closed until
 * CONTRACT.webhookTxRefField is set from the links.et docs.
 * @param {Buffer | string} rawBody
 * @returns {{ txRef: string }}
 */
function parseWebhook(rawBody) {
  assertContract(['webhookTxRefField']);
  let event;
  try {
    const text = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : String(rawBody || '');
    event = JSON.parse(text);
  } catch {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', { body: 'Webhook body must be JSON' });
  }
  const txRef = readField(event, CONTRACT.webhookTxRefField);
  return { txRef: typeof txRef === 'string' ? txRef : '' };
}

/**
 * Checks the webhook signature. Returns false until CONTRACT.signatureHeader
 * is set from the links.et docs (fail closed).
 * @param {Buffer | string} rawBody
 * @param {import('http').IncomingHttpHeaders} headers
 * @returns {boolean}
 */
function verifyWebhookSignature(rawBody, headers) {
  const secret = process.env.LINKS_ET_WEBHOOK_SECRET;
  const headerName = CONTRACT.signatureHeader;
  if (!secret || !headerName) return false;

  const provided = headers[String(headerName).toLowerCase()];
  if (!provided || typeof provided !== 'string') return false;

  const body = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(String(rawBody));
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
  if (provided.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

module.exports = {
  initializePayment,
  verifyPayment,
  verifyWebhookSignature,
  parseWebhook,
  CONTRACT,
};
