/**
 * Person 3 constants.
 *
 * Money unit: ETB (birr), rounded to 2 decimal places (the santim).
 * Donation.amount, Campaign.goalAmount, and Campaign.raisedAmount all use this
 * unit so crediting and auto-complete compare the same numbers. Person 2's
 * Campaign model already stores birr, not integer santim.
 */

const CURRENCY = 'ETB';

/** Minimum donation in ETB. */
const MIN_DONATION = 10;

/** Maximum donation in ETB. */
const MAX_DONATION = 1_000_000;

/**
 * When true, POST /api/donations/initialize works without a logged-in user.
 * Set to false to require Person 1's auth on every donation.
 */
const ALLOW_GUEST_DONATIONS = true;

const MAX_MESSAGE_LENGTH = 300;
const MAX_DISPLAY_NAME_LENGTH = 80;
const MAX_REPORT_DETAILS = 1000;

const DEFAULT_PAGE_LIMIT = 12;
const MAX_PAGE_LIMIT = 50;

const IDENTITY_MODES = ['identified', 'public_anonymous', 'fully_anonymous'];
const DONATION_STATUSES = ['pending', 'paid', 'failed', 'cancelled', 'refunded'];

const REPORT_TARGET_TYPES = ['campaign', 'user', 'organization', 'donation'];
const REPORT_REASONS = ['fraud', 'misleading', 'inappropriate', 'duplicate', 'payment_issue', 'other'];
const REPORT_STATUSES = ['open', 'reviewing', 'resolved', 'dismissed'];

const CAMPAIGN_PUBLIC_STATUSES = ['published', 'completed'];
const SEARCH_SORTS = ['newest', 'oldest', 'mostFunded', 'endingSoon', 'progress'];

/** Fields safe to return from public campaign search. No payout or beneficiary data. */
const CAMPAIGN_PUBLIC_FIELDS = [
  'title',
  'story',
  'category',
  'location',
  'goalAmount',
  'raisedAmount',
  'deadline',
  'status',
  'verificationStatus',
  'organization',
  'owner',
  'createdAt',
];

module.exports = {
  CURRENCY,
  MIN_DONATION,
  MAX_DONATION,
  ALLOW_GUEST_DONATIONS,
  MAX_MESSAGE_LENGTH,
  MAX_DISPLAY_NAME_LENGTH,
  MAX_REPORT_DETAILS,
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
  IDENTITY_MODES,
  DONATION_STATUSES,
  REPORT_TARGET_TYPES,
  REPORT_REASONS,
  REPORT_STATUSES,
  CAMPAIGN_PUBLIC_STATUSES,
  SEARCH_SORTS,
  CAMPAIGN_PUBLIC_FIELDS,
};
