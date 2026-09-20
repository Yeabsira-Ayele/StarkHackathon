const mongoose = require('mongoose');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const {
  verifyDonationReceipt,
  validateReceiptUrl,
  VerificationError,
} = require('../services/LinkEt');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

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

    const campaign = await Campaign.findById(campaignId).select('_id');
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    const verified = await verifyDonationReceipt(receiptUrl);

    const donation = await Donation.create({
      campaignId,
      amount: verified.amount,
      donorName: donorName?.trim() || undefined, // schema default: "Anonymous"
      message: message?.trim() || undefined,
      paymentStatus: 'completed',
      provider: verified.provider,
      receiptKey: verified.receiptKey,
    });

    await Campaign.findByIdAndUpdate(campaignId, {
      $inc: { raisedAmount: verified.amount },
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