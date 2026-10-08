const crypto = require('crypto');
const mongoose = require('mongoose');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const Organization = require('../models/Organization');
const {
  getCampaignPayoutAccounts,
  getPayoutAccountId,
} = require('../services/campaignPayoutAccounts');
const {
  verifyDonationReceipt,
  validateReceiptUrl,
  VerificationError,
} = require('../services/LinkEt');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const DONATABLE_CAMPAIGN_STATUSES = new Set(['pending', 'approved']);

// POST /donations/drafts
exports.createDraft = async (req, res) => {
  try {
    const { campaignId, amount, donorName, donorEmail, anonymous, bankId, payoutAccountId, message } = req.body || {};
    if (!isValidId(campaignId)) return res.status(400).json({ message: 'Invalid campaign ID' });
    const requestedAmount = Number(amount);
    if (!Number.isFinite(requestedAmount) || requestedAmount < 50) {
      return res.status(400).json({ message: 'Contribution amount must be at least 50 ETB' });
    }
    if (message && String(message).length > 500) {
      return res.status(400).json({ message: 'Message must be 500 characters or fewer' });
    }
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    if (!DONATABLE_CAMPAIGN_STATUSES.has(campaign.status)) {
      return res.status(403).json({ message: 'This campaign is not open for donations yet' });
    }
    const organization = campaign.organizationId
      ? await Organization.findById(campaign.organizationId).select('payoutAccounts')
      : null;
    const payoutAccounts = getCampaignPayoutAccounts(campaign, organization);
    const matchingAccounts = payoutAccountId
      ? payoutAccounts.filter((account) => getPayoutAccountId(account) === payoutAccountId)
      : payoutAccounts.filter((account) => account.bankId === String(bankId || ''));
    const payoutAccount = matchingAccounts.length === 1 ? matchingAccounts[0] : null;
    if (!payoutAccount) {
      return res.status(400).json({ message: 'This campaign has no valid saved account for the selected bank.' });
    }
    const donation = await Donation.create({
      campaignId,
      donorId: req.user?._id || null,
      requestedAmount,
      amount: 0,
      donorName: anonymous ? 'Anonymous' : String(donorName || req.user?.name || 'Anonymous').trim(),
      donorEmail: donorEmail ? String(donorEmail).trim().toLowerCase() : undefined,
      anonymous: Boolean(anonymous),
      bankId: payoutAccount.bankId,
      payoutAccountSnapshot: {
        payoutAccountId: getPayoutAccountId(payoutAccount),
        bankId: payoutAccount.bankId,
        bankName: payoutAccount.bankName,
        accountNumber: payoutAccount.accountNumber,
        accountName: payoutAccount.accountName,
      },
      message: message ? String(message).trim() : undefined,
      paymentStatus: 'pending',
    });
    res.status(201).json({
      donation: {
        ...donation.toObject(),
        campaignId: {
          _id: campaign._id,
          title: campaign.title,
          creatorName: campaign.creatorName,
          organizationName: campaign.organizationName,
        },
      },
    });
  } catch (err) {
    console.error('createDonationDraft error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /donations/records/:id/verify
exports.verifyDraft = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: 'Invalid donation ID' });
    const donation = await Donation.findById(id);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });
    if (donation.donorId && String(donation.donorId) !== String(req.user?._id)) {
      return res.status(403).json({ message: 'You cannot verify this donation' });
    }
    if (donation.paymentStatus !== 'pending') {
      return res.status(409).json({ message: 'This donation is no longer awaiting payment verification' });
    }
    if (typeof req.body?.receiptUrl !== 'string' || !req.body.receiptUrl.trim()) {
      return res.status(400).json({ message: 'receiptUrl is required' });
    }
    if (req.body.message && String(req.body.message).length > 500) {
      return res.status(400).json({ message: 'Message must be 500 characters or fewer' });
    }

    const campaign = await Campaign.findById(donation.campaignId);
    const organization = campaign?.organizationId
      ? await Organization.findById(campaign.organizationId).select('payoutAccounts')
      : null;
    const currentAccounts = campaign ? getCampaignPayoutAccounts(campaign, organization) : [];
    const matchingAccounts = donation.payoutAccountSnapshot
      ? [donation.payoutAccountSnapshot]
      : currentAccounts.filter((account) => account.bankId === donation.bankId);
    const payoutAccount = matchingAccounts.length === 1 ? matchingAccounts[0] : null;
    if (!payoutAccount) {
      return res.status(409).json({ message: 'This fundraiser no longer has a valid saved receiving account.' });
    }

    const verified = await verifyDonationReceipt(req.body.receiptUrl, payoutAccount);
    if (Math.abs(verified.amount - donation.requestedAmount) > 0.01) {
      return res.status(422).json({ message: 'The receipt amount does not match your contribution amount', code: 'amount_mismatch' });
    }

    donation.amount = verified.amount;
    donation.paymentStatus = 'completed';
    donation.provider = verified.provider;
    donation.receiptKey = verified.receiptKey;
    donation.certificateId = `LW-ETB-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    if (req.body.message !== undefined) donation.message = String(req.body.message).trim() || undefined;
    await donation.save();
    await Campaign.findByIdAndUpdate(donation.campaignId, {
      $inc: { raisedAmount: verified.amount, donationsCount: 1 },
    });

    res.json({ donation });
  } catch (err) {
    if (err instanceof VerificationError) {
      return res.status(err.status).json({ message: err.message, code: err.code });
    }
    if (err.code === 11000) {
      return res.status(409).json({ message: 'This receipt has already been used for a donation', code: 'duplicate_receipt' });
    }
    console.error('verifyDonationDraft error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

class CampaignChangedDuringVerificationError extends Error {}

const toDonationResponse = (donation, campaign) => ({
  _id: donation._id,
  campaignId: {
    _id: campaign._id,
    title: campaign.title,
    creatorName: campaign.creatorName,
    organizationName: campaign.organizationName,
    location: campaign.location,
    impactMetric: campaign.impactMetric,
  },
  donorId: donation.donorId,
  amount: donation.amount,
  donorName: donation.donorName,
  donorEmail: donation.donorEmail,
  anonymous: donation.anonymous,
  message: donation.message,
  bankId: donation.bankId,
  paymentStatus: donation.paymentStatus,
  provider: donation.provider,
  certificateId: donation.certificateId,
  createdAt: donation.createdAt,
});

exports.getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donorId: req.user._id })
      .populate('campaignId', 'title creatorName organizationName')
      .sort({ createdAt: -1 })
      .lean();
    const completed = donations.filter((item) => item.paymentStatus === 'completed');
    const stats = {
      totalAmount: completed.reduce((sum, item) => sum + item.amount, 0),
      totalDonationsCount: donations.length,
      causesSupportedCount: new Set(donations.map((item) => String(item.campaignId?._id || item.campaignId))).size,
      confirmedCount: completed.length,
      pendingCount: donations.filter((item) => item.paymentStatus === 'pending').length,
      verifyingCount: 0,
      failedCount: donations.filter((item) => item.paymentStatus === 'failed').length,
      largestDonation: completed.reduce((largest, item) => Math.max(largest, item.amount), 0),
    };
    res.json({ donations, stats });
  } catch (err) {
    console.error('getMyDonations error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDonationById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid donation ID' });
    const donation = await Donation.findById(req.params.id)
      .populate('campaignId', 'title creatorName organizationName location impactMetric')
      .lean();
    if (!donation) return res.status(404).json({ message: 'Donation not found' });
    if (
      String(donation.donorId || '') !== String(req.user._id) &&
      !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)
    ) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    delete donation.receiptKey;
    res.json({ donation });
  } catch (err) {
    console.error('getDonationById error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /donations/:campaignId?page=1&limit=10
// Public list of completed donations for a campaign (newest first)
exports.getDonationsByCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;

    if (!isValidId(campaignId)) {
      return res.status(400).json({ message: 'Invalid campaign ID' });
    }

    const campaignExists = await Campaign.exists({ _id: campaignId });
    if (!campaignExists) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

    const filter = { campaignId, paymentStatus: 'completed' };

    const [donations, total] = await Promise.all([
      Donation.find(filter)
        .select('-receiptKey')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Donation.countDocuments(filter),
    ]);

    res.json({
      donations,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('getDonationsByCampaign error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /donations/:campaignId
// Body: { amount, receiptUrl, bankId?, payoutAccountId?, donorName?, donorEmail?, anonymous?, message? }
exports.createDonation = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const {
      amount,
      receiptUrl,
      donorName,
      donorEmail,
      anonymous,
      message,
      bankId,
      payoutAccountId,
    } = req.body || {};

    if (!isValidId(campaignId)) {
      return res.status(400).json({ message: 'Invalid campaign ID' });
    }

    const requestedAmount = Number(amount);
    if (!Number.isFinite(requestedAmount) || requestedAmount < 50) {
      return res.status(400).json({ message: 'Contribution amount must be at least 50 ETB' });
    }

    if (typeof receiptUrl !== 'string' || !receiptUrl.trim()) {
      return res.status(400).json({ message: 'receiptUrl is required' });
    }
    if (donorName !== undefined && typeof donorName !== 'string') {
      return res.status(400).json({ message: 'Donor name must be text' });
    }
    if (donorName && donorName.length > 120) {
      return res.status(400).json({ message: 'Donor name must be 120 characters or fewer' });
    }
    if (donorEmail !== undefined && typeof donorEmail !== 'string') {
      return res.status(400).json({ message: 'Donor email must be text' });
    }
    if (donorEmail && donorEmail.length > 254) {
      return res.status(400).json({ message: 'Donor email must be 254 characters or fewer' });
    }
    if (message !== undefined && typeof message !== 'string') {
      return res.status(400).json({ message: 'Message must be text' });
    }
    if (message && message.length > 500) {
      return res.status(400).json({ message: 'Message must be 500 characters or fewer' });
    }
    if (anonymous !== undefined && typeof anonymous !== 'boolean') {
      return res.status(400).json({ message: 'Anonymous must be a boolean' });
    }

    validateReceiptUrl(receiptUrl);

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    if (!DONATABLE_CAMPAIGN_STATUSES.has(campaign.status)) {
      return res.status(403).json({ message: 'This campaign is not open for donations yet', code: 'campaign_not_approved' });
    }

    const organization = campaign.organizationId
      ? await Organization.findById(campaign.organizationId).select('payoutAccounts')
      : null;
    const campaignPayoutAccounts = getCampaignPayoutAccounts(campaign, organization);
    let payoutAccount;
    if (typeof payoutAccountId === 'string' && payoutAccountId) {
      payoutAccount = campaignPayoutAccounts.find(
        (account) => getPayoutAccountId(account) === payoutAccountId
      );
    } else {
      const bankAccounts = campaignPayoutAccounts.filter(
        (account) => account.bankId === String(bankId || '')
      );
      if (bankAccounts.length === 1) payoutAccount = bankAccounts[0];
    }
    if (!payoutAccount) {
      return res.status(400).json({ message: 'Select a valid receiving account saved for this campaign.' });
    }

    const isAnonymous = Boolean(anonymous);
    const donationDetails = {
      campaignId,
      donorId: req.user?._id || null,
      donorName: isAnonymous ? 'Anonymous' : donorName?.trim() || req.user?.name || undefined,
      donorEmail: donorEmail?.trim().toLowerCase() || undefined,
      anonymous: isAnonymous,
      bankId: payoutAccount.bankId,
      message: message?.trim() || undefined,
    };

    let verified;
    try {
      verified = await verifyDonationReceipt(receiptUrl, payoutAccount);
    } catch (err) {
      if (!(err instanceof VerificationError) || err.status !== 422) throw err;
      return res.status(422).json({ message: err.message, code: err.code });
    }

    if (Math.abs(verified.amount - requestedAmount) > 0.01) {
      return res.status(422).json({
        message: 'The receipt amount does not match your contribution amount',
        code: 'amount_mismatch',
      });
    }

    const existingDonation = await Donation.findOne({ receiptKey: verified.receiptKey }).lean();
    if (existingDonation) {
      return res.status(409).json({
        message: 'This receipt has already been used for a donation',
        code: 'duplicate_receipt',
        donationId: existingDonation._id,
      });
    }

    let donation;
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const [createdDonation] = await Donation.create([{
          ...donationDetails,
          payoutAccountSnapshot: {
            payoutAccountId: getPayoutAccountId(payoutAccount),
            bankId: payoutAccount.bankId,
            bankName: payoutAccount.bankName,
            accountNumber: payoutAccount.accountNumber,
            accountName: payoutAccount.accountName,
          },
          amount: verified.amount,
          paymentStatus: 'completed',
          provider: verified.provider,
          receiptKey: verified.receiptKey,
          certificateId: `LW-ETB-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
        }], { session });

        const updatedCampaign = await Campaign.findByIdAndUpdate(
          { _id: campaignId, __v: Number.isInteger(campaign.__v) ? campaign.__v : 0 },
          { $inc: { raisedAmount: verified.amount, donationsCount: 1 } },
          { new: true, session }
        );
        if (!updatedCampaign) {
          throw new CampaignChangedDuringVerificationError(
            'The campaign payout details changed while the receipt was being verified. Please check the current details and try again.'
          );
        }
        donation = createdDonation;
      });
    } catch (err) {
      if (err instanceof CampaignChangedDuringVerificationError) {
        return res.status(409).json({ message: err.message, code: 'payout_account_changed' });
      }
      throw err;
    } finally {
      await session.endSession();
    }

    res.status(201).json({
      message: 'Donation verified. Thank you!',
      donation: toDonationResponse(donation, campaign),
    });
  } catch (err) {
    if (err instanceof VerificationError) {
      return res.status(err.status).json({ message: err.message, code: err.code });
    }

    if (err.code === 11000 && err.keyPattern?.receiptKey) {
      return res
        .status(409)
        .json({ message: 'This receipt has already been used for a donation', code: 'duplicate_receipt' });
    }

    console.error('createDonation error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};