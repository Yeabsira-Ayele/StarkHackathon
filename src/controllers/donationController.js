const mongoose = require('mongoose');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');

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
// Body: { amount, donorName?, message? }
// Creates a donation with status "pending". The campaign total is only
// updated once the payment is confirmed (see updatePaymentStatus).
exports.createDonation = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { amount, donorName, message } = req.body;

    if (!isValidId(campaignId)) {
      return res.status(400).json({ message: 'Invalid campaign ID' });
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be a number greater than 0' });
    }

    if (message && String(message).length > 500) {
      return res.status(400).json({ message: 'Message must be 500 characters or fewer' });
    }

    const campaign = await Campaign.findById(campaignId).select('_id');
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    const donation = await Donation.create({
      campaignId,
      amount: parsedAmount,
      // undefined lets the schema default ("Anonymous") apply
      donorName: donorName?.trim() || undefined,
      message: message?.trim() || undefined,
    });

    res.status(201).json({
      message: 'Donation created, awaiting payment confirmation',
      donation,
    });
  } catch (err) {
    console.error('createDonation error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /donations/:donationId/status
// Body: { status: "completed" | "failed" }
// Call this from your payment provider's webhook / callback (not from the
// public client) once the payment result is known.
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { donationId } = req.params;
    const { status } = req.body;

    if (!isValidId(donationId)) {
      return res.status(400).json({ message: 'Invalid donation ID' });
    }

    if (!['completed', 'failed'].includes(status)) {
      return res.status(400).json({ message: 'Status must be "completed" or "failed"' });
    }

    // Only a pending donation can transition, which prevents double-counting
    // if the webhook fires more than once.
    const donation = await Donation.findOneAndUpdate(
      { _id: donationId, paymentStatus: 'pending' },
      { paymentStatus: status },
      { new: true }
    );

    if (!donation) {
      return res
        .status(409)
        .json({ message: 'Donation not found or already processed' });
    }

    if (status === 'completed') {
      await Campaign.findByIdAndUpdate(donation.campaignId, {
        $inc: { raisedAmount: donation.amount },
      });
    }

    res.json({ message: `Donation marked as ${status}`, donation });
  } catch (err) {
    console.error('updatePaymentStatus error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};