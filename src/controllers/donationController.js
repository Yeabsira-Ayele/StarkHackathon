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
    const donations = await Donation.find({
      donorId: req.user._id,
      paymentStatus: 'completed',
    })
      .populate('campaignId', 'title creatorName organizationName')
      .sort({ createdAt: -1 })
      .lean();
    const successful = donations.filter((item) => item.paymentStatus === 'completed');
    const stats = {
      totalAmount: successful.reduce((sum, item) => sum + item.amount, 0),
      totalDonationsCount: successful.length,
      causesSupportedCount: new Set(successful.map((item) => String(item.campaignId?._id || item.campaignId))).size,
      successfulCount: successful.length,
      largestDonation: successful.reduce((largest, item) => Math.max(largest, item.amount), 0),
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
    const donation = await Donation.findOne({
      _id: req.params.id,
      paymentStatus: 'completed',
    })
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
        .select('-receiptKey -donorEmail -donorId')
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
// Body: { amount, receiptUrl, payoutAccountId, donorName?, donorEmail?, anonymous?, message? }
//
// The donor first pays by telebirr / CBE / Zemen / BoA / Awash, then submits
// the receipt link. We verify it with links.et before creating any donation
// record. Verification failures do not create donation records.
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
    if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
      return res.status(400).json({ message: 'Contribution amount must be greater than 0 ETB' });
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

    // Cheap local checks first so we don't spend a verification on bad input
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
          amount: verified.amount,
          paymentStatus: 'completed',
          provider: verified.provider,
          receiptKey: verified.receiptKey,
          certificateId: `LW-ETB-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
        }], { session });

        const updatedCampaign = await Campaign.findByIdAndUpdate(
          campaignId,
          { $inc: { raisedAmount: verified.amount, donationsCount: 1 } },
          { new: true, session }
        );
        if (!updatedCampaign) throw new Error('Campaign disappeared while recording a verified donation');
        donation = createdDonation;
      });
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

    // The receiptKey unique index also prevents concurrent re-use attempts.
    if (err.code === 11000 && err.keyPattern?.receiptKey) {
      return res
        .status(409)
        .json({ message: 'This receipt has already been used for a donation', code: 'duplicate_receipt' });
    }

    console.error('createDonation error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};