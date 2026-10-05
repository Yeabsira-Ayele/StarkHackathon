const crypto = require('crypto');
const mongoose = require('mongoose');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const {
  verifyDonationReceipt,
  validateReceiptUrl,
  VerificationError,
} = require('../services/LinkEt');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// POST /donations/drafts
exports.createDraft = async (req, res) => {
  try {
    const { campaignId, amount, donorName, donorEmail, anonymous, bankId, message } = req.body || {};
    if (!isValidId(campaignId)) return res.status(400).json({ message: 'Invalid campaign ID' });
    const requestedAmount = Number(amount);
    if (!Number.isFinite(requestedAmount) || requestedAmount < 50) {
      return res.status(400).json({ message: 'Contribution amount must be at least 50 ETB' });
    }
    if (message && String(message).length > 500) {
      return res.status(400).json({ message: 'Message must be 500 characters or fewer' });
    }
    const campaign = await Campaign.findById(campaignId).select('_id status title creatorName organizationName');
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    if (campaign.status !== 'approved') {
      return res.status(403).json({ message: 'This campaign is not open for donations yet' });
    }
    const donation = await Donation.create({
      campaignId,
      donorId: req.user?._id || null,
      requestedAmount,
      amount: 0,
      donorName: anonymous ? 'Anonymous' : String(donorName || req.user?.name || 'Anonymous').trim(),
      donorEmail: donorEmail ? String(donorEmail).trim().toLowerCase() : undefined,
      anonymous: Boolean(anonymous),
      bankId: bankId ? String(bankId) : undefined,
      message: message ? String(message).trim() : undefined,
      paymentStatus: 'pending',
    });
    res.status(201).json({ donation: { ...donation.toObject(), campaign } });
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

    const verified = await verifyDonationReceipt(req.body.receiptUrl);
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
// Body: { receiptUrl, donorName?, message? }
//
// The donor first pays by telebirr / CBE / Zemen / BoA / Awash, then submits
// the receipt link. We verify it with links.et and record the donation using
// the amount on the receipt (never an amount typed by the donor).
exports.createDonation = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { receiptUrl, donorName, message } = req.body;

    if (!isValidId(campaignId)) {
      return res.status(400).json({ message: 'Invalid campaign ID' });
    }

    if (typeof receiptUrl !== 'string' || !receiptUrl.trim()) {
      return res.status(400).json({ message: 'receiptUrl is required' });
    }

    if (message && String(message).length > 500) {
      return res.status(400).json({ message: 'Message must be 500 characters or fewer' });
    }

    // Cheap local checks first so we don't spend a verification on bad input
    validateReceiptUrl(receiptUrl);

    const campaign = await Campaign.findById(campaignId).select('_id status');
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (campaign.status !== 'approved') {
      return res.status(403).json({ message: 'This campaign is not open for donations yet', code: 'campaign_not_approved' });
    }

    const verified = await verifyDonationReceipt(receiptUrl);

    const donation = await Donation.create({
      campaignId,
      donorId: req.user?._id || null,
      amount: verified.amount,
      donorName: donorName?.trim() || undefined, // schema default: "Anonymous"
      message: message?.trim() || undefined,
      paymentStatus: 'completed',
      provider: verified.provider,
      receiptKey: verified.receiptKey,
      certificateId: `LW-ETB-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
    });

    await Campaign.findByIdAndUpdate(campaignId, {
      $inc: { raisedAmount: verified.amount, donationsCount: 1 },
    });

    res.status(201).json({
      message: 'Donation verified. Thank you!',
      donation: {
        _id: donation._id,
        campaignId: donation.campaignId,
        amount: donation.amount,
        donorName: donation.donorName,
        message: donation.message,
        paymentStatus: donation.paymentStatus,
        provider: donation.provider,
        createdAt: donation.createdAt,
      },
    });
  } catch (err) {
    if (err instanceof VerificationError) {
      return res.status(err.status).json({ message: err.message, code: err.code });
    }

    // Unique index on receiptKey: this receipt was already counted
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: 'This receipt has already been used for a donation', code: 'duplicate_receipt' });
    }

    console.error('createDonation error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};