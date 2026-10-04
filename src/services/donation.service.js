const crypto = require('crypto');
const Donation = require('../models/Donation');
const { ensureCampaignModel } = require('../models');
const AppError = require('../utils/AppError');
const { normalizeAmount, sameMoney } = require('../utils/money');
const { runAtomically } = require('../utils/mongoTransaction');
const { buildPagination } = require('../utils/pagination');
const { serializeDonation } = require('../utils/donationSerializer');
const { emit } = require('./events');
const { getProvider, providerName } = require('./payment');
const { completeIfGoalReached } = require('./campaignCompletion.service');
const {
  ALLOW_GUEST_DONATIONS,
  MIN_DONATION,
  MAX_DONATION,
  CURRENCY,
  MAX_MESSAGE_LENGTH,
  MAX_DISPLAY_NAME_LENGTH,
} = require('../config/constants');

const TX_REF_PATTERN = /^lwg_[a-z0-9]+_[a-f0-9]{16}$/i;

/**
 * @param {unknown} user
 * @returns {boolean}
 */
function isAdmin(user) {
  return Boolean(user && String(user.role).toLowerCase() === 'admin');
}

/**
 * @param {unknown} a
 * @param {unknown} b
 * @returns {boolean}
 */
function sameId(a, b) {
  if (a == null || b == null) return false;
  const left = typeof a === 'object' && a._id ? a._id : a;
  const right = typeof b === 'object' && b._id ? b._id : b;
  return String(left) === String(right);
}

/**
 * @param {string} value
 * @param {number} max
 * @returns {string}
 */
function cleanText(value, max) {
  return String(value).replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, max);
}

/**
 * @returns {string}
 */
function generateTxRef() {
  return `lwg_${Date.now().toString(36)}_${crypto.randomBytes(8).toString('hex')}`;
}

/**
 * Receipt numbers look like LWG-2026-A1B2C3. Uniqueness is enforced by the index.
 * @returns {string}
 */
function generateReceiptNumber() {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = crypto.randomBytes(6);
  let chars = '';
  for (let i = 0; i < 6; i += 1) chars += alphabet[bytes[i] % alphabet.length];
  return `LWG-${new Date().getUTCFullYear()}-${chars}`;
}

/**
 * @param {string} txRef
 */
function assertTxRef(txRef) {
  if (!txRef || !TX_REF_PATTERN.test(String(txRef))) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      txRef: 'Must be a transaction reference issued by Lewegene',
    });
  }
}

/**
 * @param {import('mongoose').Document} campaign
 */
function assertDonatable(campaign) {
  if (campaign.status !== 'published') {
    throw new AppError('This campaign is not accepting donations', 409, 'CAMPAIGN_NOT_DONATABLE');
  }
  if (!campaign.deadline || new Date(campaign.deadline).getTime() <= Date.now()) {
    throw new AppError('This campaign is past its deadline', 409, 'CAMPAIGN_NOT_DONATABLE');
  }
}

/**
 * Stores only the normalized verification result. Never the raw provider body.
 * @param {{ status?: string, amount?: number|null, currency?: string|null, providerTransactionId?: string|null }} verification
 */
function safePayload(verification) {
  return {
    status: verification.status,
    amount: verification.amount,
    currency: verification.currency,
    providerTransactionId: verification.providerTransactionId || null,
  };
}

/**
 * @param {object} err
 * @param {string} field
 * @returns {boolean}
 */
function isDuplicateField(err, field) {
  const sources = [err, err?.cause, err?.errorResponse].filter(Boolean);
  const duplicate = sources.find((source) => source.code === 11000);
  if (!duplicate && !sources.some((source) => String(source.message || '').includes('E11000'))) {
    return false;
  }
  const pattern = sources.map((source) => source.keyPattern).find(Boolean);
  if (pattern && pattern[field]) return true;
  const message = sources.map((source) => source.message || '').join(' ');
  return message.includes(field);
}

/**
 * @param {object} donation
 * @param {object | undefined} user
 * @param {{ txRefHolder?: boolean }} [options]
 * @returns {'public' | 'fundraiser' | 'admin' | 'donor'}
 */
function resolveViewerRole(donation, user, options = {}) {
  if (isAdmin(user)) return 'admin';
  if (user && donation.donor && sameId(donation.donor, user._id)) return 'donor';
  // Guest checkout has no donor. The txRef is how that guest opens the receipt.
  // A donation that already has a donor stays public until that donor or an admin asks.
  if (options.txRefHolder && !user && !donation.donor) return 'donor';
  return 'public';
}

/**
 * @param {object} donation
 * @param {object | undefined} user
 * @param {{ txRefHolder?: boolean }} [options]
 */
function presentDonation(donation, user, options) {
  const role = resolveViewerRole(donation, user, options);
  return serializeDonation(donation, role, user && user._id);
}

/**
 * @param {object} donation
 * @param {{ status?: string, amount?: number|null, currency?: string|null, providerTransactionId?: string|null }} verification
 * @param {string} reason
 */
async function markFailed(donation, verification, reason) {
  const updated = await Donation.findOneAndUpdate(
    { _id: donation._id, status: 'pending' },
    { $set: { status: 'failed', rawProviderPayload: safePayload(verification) } },
    { new: true }
  );

  if (!updated) {
    const current = await Donation.findById(donation._id);
    return {
      donation: current,
      alreadyProcessed: true,
      credited: false,
      campaignCompleted: false,
    };
  }

  emit('donation.failed', {
    donationId: String(updated._id),
    campaignId: String(updated.campaign),
    txRef: updated.txRef,
    reason,
    identityMode: updated.identityMode,
    donorId: updated.donor ? String(updated.donor) : null,
  });

  return {
    donation: updated,
    alreadyProcessed: false,
    credited: false,
    campaignCompleted: false,
  };
}

/**
 * Conditional pending → paid update, then a single $inc. Safe to run twice:
 * the second caller does not match status "pending" and does not increment.
 * @param {import('mongoose').Document} donation
 * @param {{ amount: number, currency: string, providerTransactionId?: string|null }} verification
 * @param {import('mongoose').ClientSession | null} session
 * @param {string} receiptNumber
 */
async function claimAndCredit(donation, verification, session, receiptNumber) {
  const opts = { new: true };
  if (session) opts.session = session;

  const update = {
    status: 'paid',
    paidAt: new Date(),
    receiptNumber,
    rawProviderPayload: safePayload(verification),
  };
  if (verification.providerTransactionId) {
    update.providerTransactionId = verification.providerTransactionId;
  }

  // Match on txRef + pending so a webhook retry and a client verify cannot both credit.
  // A duplicate receiptNumber throws; the caller retries outside the transaction
  // because a duplicate-key error aborts a Mongo transaction.
  const claimed = await Donation.findOneAndUpdate(
    { txRef: donation.txRef, status: 'pending' },
    { $set: update },
    opts
  );

  if (!claimed) {
    const query = Donation.findById(donation._id);
    if (session) query.session(session);
    const current = await query;
    return {
      donation: current,
      alreadyProcessed: true,
      credited: false,
      campaignCompleted: false,
      event: null,
    };
  }

  const Campaign = ensureCampaignModel();
  const writeOpts = session ? { session } : {};
  await Campaign.updateOne(
    { _id: claimed.campaign },
    { $inc: { raisedAmount: claimed.amount } },
    writeOpts
  );

  const completion = await completeIfGoalReached(claimed.campaign, session);

  return {
    donation: claimed,
    alreadyProcessed: false,
    credited: true,
    campaignCompleted: completion.completed,
    event: {
      name: 'donation.paid',
      payload: {
        donationId: String(claimed._id),
        campaignId: String(claimed.campaign),
        amount: claimed.amount,
        currency: claimed.currency,
        txRef: claimed.txRef,
        receiptNumber: claimed.receiptNumber,
        donorId: claimed.donor ? String(claimed.donor) : null,
        identityMode: claimed.identityMode,
        campaignCompleted: completion.completed,
      },
    },
  };
}

/**
 * Creates a pending donation and asks the payment provider for a checkout URL.
 * @param {{ user?: { _id: string, role?: string }, body: { campaignId: string, amount: number, identityMode: string, displayName?: string, message?: string } }} input
 * @returns {Promise<{ checkoutUrl: string, txRef: string, donationId: import('mongoose').Types.ObjectId }>}
 */
async function initializeDonation({ user, body }) {
  if (!user && !ALLOW_GUEST_DONATIONS) {
    throw new AppError('Authentication required', 401, 'AUTH_REQUIRED');
  }

  const amount = normalizeAmount(body.amount);
  if (amount < MIN_DONATION || amount > MAX_DONATION) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
      amount: `Amount must be between ${MIN_DONATION} and ${MAX_DONATION} ${CURRENCY}`,
    });
  }

  const Campaign = ensureCampaignModel();
  const campaign = await Campaign.findById(body.campaignId);
  if (!campaign) throw new AppError('Campaign not found', 404, 'NOT_FOUND');
  assertDonatable(campaign);

  let displayName;
  if (body.identityMode === 'identified') {
    displayName = cleanText(body.displayName || '', MAX_DISPLAY_NAME_LENGTH);
    if (!displayName) {
      throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
        displayName: 'Display name is required for identified donations',
      });
    }
  }

  const message = body.message ? cleanText(body.message, MAX_MESSAGE_LENGTH) : undefined;
  const txRef = generateTxRef();

  const donation = await Donation.create({
    campaign: campaign._id,
    donor: user ? user._id : undefined,
    amount,
    currency: CURRENCY,
    identityMode: body.identityMode,
    displayName,
    message,
    status: 'pending',
    provider: providerName(),
    txRef,
  });

  try {
    const started = await getProvider().initializePayment({
      amount,
      currency: CURRENCY,
      txRef,
      returnUrl: process.env.PAYMENT_RETURN_URL || 'http://localhost:5173/donations/return',
      callbackUrl: process.env.PAYMENT_CALLBACK_URL
        || `http://localhost:${process.env.PORT || 5000}/api/payments/webhook`,
      customer: {
        id: user ? String(user._id) : null,
        displayName: displayName || null,
      },
    });

    return {
      checkoutUrl: started.checkoutUrl,
      txRef: donation.txRef,
      donationId: donation._id,
    };
  } catch (err) {
    await Donation.updateOne(
      { _id: donation._id, status: 'pending' },
      { $set: { status: 'failed' } }
    );
    emit('donation.failed', {
      donationId: String(donation._id),
      campaignId: String(campaign._id),
      txRef,
      reason: 'init_failed',
      identityMode: body.identityMode,
      donorId: user ? String(user._id) : null,
    });
    throw err;
  }
}

/**
 * Verifies a payment with the provider and finalizes it.
 * Idempotent: a donation that is already paid is returned unchanged and is not
 * credited again. Failed and cancelled provider results become status "failed".
 * Amount or currency mismatches are marked failed and are not credited.
 *
 * @param {string} txRef
 * @param {{ missing?: 'throw' | 'ignore' }} [options]
 * @returns {Promise<{ donation?: object, alreadyProcessed: boolean, credited?: boolean, pending?: boolean, campaignCompleted?: boolean, ignored?: boolean }>}
 */
async function finalizeDonation(txRef, options = {}) {
  assertTxRef(txRef);

  const donation = await Donation.findOne({ txRef });
  if (!donation) {
    if (options.missing === 'ignore') {
      return { ignored: true, alreadyProcessed: false };
    }
    throw new AppError('Donation not found', 404, 'NOT_FOUND');
  }

  if (donation.status !== 'pending') {
    return {
      donation,
      alreadyProcessed: true,
      credited: false,
      campaignCompleted: false,
    };
  }

  const verification = await getProvider().verifyPayment({
    txRef: donation.txRef,
    providerTransactionId: donation.providerTransactionId,
  });

  if (!verification || verification.status === 'pending') {
    return {
      donation,
      alreadyProcessed: false,
      credited: false,
      pending: true,
      campaignCompleted: false,
    };
  }

  if (verification.status === 'failed' || verification.status === 'cancelled') {
    const reason = verification.status === 'cancelled' ? 'provider_cancelled' : 'provider_failed';
    return markFailed(donation, verification, reason);
  }

  const currency = String(verification.currency || '').toUpperCase();
  if (!sameMoney(verification.amount, donation.amount) || currency !== donation.currency) {
    console.error('[donation] provider amount mismatch; not credited', {
      txRef: donation.txRef,
      expectedAmount: donation.amount,
      actualAmount: verification.amount,
      expectedCurrency: donation.currency,
      actualCurrency: verification.currency,
    });
    return markFailed(donation, verification, 'amount_mismatch');
  }

  let outcome;
  let allocated = false;
  let lastError;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const receiptNumber = generateReceiptNumber();
    try {
      outcome = await runAtomically((session) => (
        claimAndCredit(donation, verification, session, receiptNumber)
      ));
      allocated = true;
      break;
    } catch (err) {
      if (isDuplicateField(err, 'receiptNumber')) {
        lastError = err;
        continue;
      }
      if (isDuplicateField(err, 'providerTransactionId')) {
        await markFailed(donation, verification, 'duplicate_provider_transaction');
        throw new AppError('This payment was already used', 409, 'DUPLICATE_PAYMENT');
      }
      throw err;
    }
  }

  if (!allocated) {
    console.error('[donation] receipt allocation failed', { txRef: donation.txRef, message: lastError && lastError.message });
    throw new AppError('Could not allocate a receipt number', 500, 'RECEIPT_ALLOCATION_FAILED');
  }

  if (outcome.alreadyProcessed) {
    outcome.donation = await Donation.findOne({ txRef: donation.txRef });
  }
  if (outcome.event) emit(outcome.event.name, outcome.event.payload);
  return outcome;
}

/**
 * Public or optional-auth verify. Finalizes on the server, then serializes
 * for the caller. A guest donation (no donor on the row) includes receipt fields
 * because the caller holds the txRef. If the row has a donor, only that donor
 * or an admin sees donorId and the receipt number.
 *
 * @param {string} txRef
 * @param {{ _id: string, role?: string } | undefined} user
 */
async function verifyDonation(txRef, user) {
  const result = await finalizeDonation(txRef);
  return {
    alreadyProcessed: Boolean(result.alreadyProcessed),
    pending: Boolean(result.pending),
    campaignCompleted: Boolean(result.campaignCompleted),
    donation: presentDonation(result.donation, user, { txRefHolder: true }),
  };
}

/**
 * Receipt for the donor or an admin. Fully anonymous donations stay available
 * to the donor who made them.
 * @param {string} donationId
 * @param {{ _id: string, role?: string }} user
 */
async function getReceipt(donationId, user) {
  const donation = await Donation.findById(donationId);
  if (!donation) throw new AppError('Donation not found', 404, 'NOT_FOUND');

  const allowed = isAdmin(user) || (donation.donor && sameId(donation.donor, user._id));
  if (!allowed) throw new AppError('You cannot view this receipt', 403, 'FORBIDDEN');

  return serializeDonation(donation, isAdmin(user) ? 'admin' : 'donor', user._id);
}

/**
 * The signed-in donor's own donations, newest first.
 * @param {{ _id: string, role?: string }} user
 * @param {{ page: number, limit: number }} query
 */
async function listMyDonations(user, query) {
  const page = query.page;
  const limit = query.limit;
  const filter = { donor: user._id };
  const [total, docs] = await Promise.all([
    Donation.countDocuments(filter),
    Donation.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
  ]);

  return {
    items: docs.map((doc) => serializeDonation(doc, 'donor', user._id)),
    pagination: buildPagination({ page, limit, total }),
  };
}

/**
 * Paid donations for a campaign, newest first, passed through the serializer.
 * Campaign owners are the fundraiser viewer. Everyone else is public unless admin.
 * @param {string} campaignId
 * @param {{ page: number, limit: number }} query
 * @param {{ _id: string, role?: string } | undefined} user
 */
async function listCampaignDonations(campaignId, query, user) {
  const Campaign = ensureCampaignModel();
  const campaign = await Campaign.findById(campaignId).select('owner').lean();
  if (!campaign) throw new AppError('Campaign not found', 404, 'NOT_FOUND');

  let viewerRole = 'public';
  if (isAdmin(user)) viewerRole = 'admin';
  else if (user && sameId(campaign.owner, user._id)) viewerRole = 'fundraiser';

  const page = query.page;
  const limit = query.limit;
  const filter = { campaign: campaignId, status: 'paid' };
  const [total, docs] = await Promise.all([
    Donation.countDocuments(filter),
    Donation.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
  ]);

  return {
    items: docs.map((doc) => serializeDonation(doc, viewerRole, user && user._id)),
    pagination: buildPagination({ page, limit, total }),
  };
}

module.exports = {
  initializeDonation,
  verifyDonation,
  finalizeDonation,
  getReceipt,
  listMyDonations,
  listCampaignDonations,
};
