const mockProvider = require('./mockProvider');
const linksEtProvider = require('./linksEtProvider');
const AppError = require('../../utils/AppError');

/**
 * Selects the payment adapter from PAYMENT_PROVIDER.
 * `mock` (default) simulates checkout. `links.et` uses the fail-closed adapter.
 * @returns {{ initializePayment: Function, verifyPayment: Function, verifyWebhookSignature: Function, parseWebhook: Function, signWebhook?: Function }}
 */
function getProvider() {
  const name = String(process.env.PAYMENT_PROVIDER || 'mock').toLowerCase();
  if (name === 'mock') return mockProvider;
  if (name === 'links.et' || name === 'linkset' || name === 'links') return linksEtProvider;
  throw new AppError(`Unknown payment provider "${name}"`, 500, 'PAYMENT_PROVIDER_UNKNOWN');
}

/**
 * Value stored on Donation.provider.
 * @returns {'mock' | 'links.et'}
 */
function providerName() {
  const name = String(process.env.PAYMENT_PROVIDER || 'mock').toLowerCase();
  if (name === 'mock') return 'mock';
  return 'links.et';
}

module.exports = {
  getProvider,
  providerName,
};
