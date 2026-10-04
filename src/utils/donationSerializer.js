/**
 * One serializer for every donation response.
 * viewerRole:
 *   public      — donor list and anyone who is not allowed to see identity
 *   fundraiser  — campaign owner; sees donor id except for fully_anonymous
 *   admin       — sees donor id for every mode
 *   donor       — the donor themself, including fully_anonymous receipts
 *
 * Donor phone numbers are never stored on Donation and are never returned.
 * rawProviderPayload is never returned.
 */

const ROLES = new Set(['public', 'fundraiser', 'admin', 'donor']);

/**
 * @param {unknown} value
 * @returns {string | null}
 */
function idOf(value) {
  if (!value) return null;
  if (typeof value === 'object' && value._id) return String(value._id);
  return String(value);
}

/**
 * @param {object} donation mongoose document or lean object
 * @param {'public' | 'fundraiser' | 'admin' | 'donor'} [viewerRole='public']
 * @param {unknown} [viewerId]
 * @returns {object}
 */
function serializeDonation(donation, viewerRole = 'public', viewerId) {
  const doc = donation && typeof donation.toObject === 'function'
    ? donation.toObject()
    : { ...(donation || {}) };

  const role = ROLES.has(viewerRole) ? viewerRole : 'public';
  const mode = doc.identityMode;
  const donorId = idOf(doc.donor);
  const self = viewerId && donorId && String(viewerId) === donorId;

  const seesIdentity = role === 'admin'
    || role === 'donor'
    || self
    || (role === 'fundraiser' && mode !== 'fully_anonymous');

  const result = {
    id: idOf(doc._id),
    campaign: idOf(doc.campaign),
    amount: doc.amount,
    currency: doc.currency,
    identityMode: mode,
    displayName: mode === 'identified' ? (doc.displayName || 'Anonymous') : 'Anonymous',
    message: doc.message || null,
    status: doc.status,
    paidAt: doc.paidAt || null,
    createdAt: doc.createdAt || null,
  };

  if (seesIdentity) {
    result.donorId = donorId;
  }

  if (role === 'admin' || role === 'donor' || self) {
    result.txRef = doc.txRef;
    result.receiptNumber = doc.receiptNumber || null;
    result.provider = doc.provider || null;
  }

  return result;
}

module.exports = {
  serializeDonation,
};
