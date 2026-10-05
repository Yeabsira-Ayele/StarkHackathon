const mongoose = require('mongoose');
const Campaign = require('../models/Campaign');

exports.getPendingCampaigns = async (req, res) => {
  try {
    const status = req.query.status;
    const filter = status && ['draft', 'pending', 'approved', 'changes_requested', 'rejected', 'paused', 'completed'].includes(status)
      ? { status }
      : {};
    const campaigns = await Campaign.find(filter).sort({ createdAt: -1 }).lean();
    res.json(campaigns);
  } catch (err) {
    console.error('getPendingCampaigns error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.reviewCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid campaign ID' });
    }

    if (!['approved', 'changes_requested', 'rejected', 'paused'].includes(status)) {
      return res.status(400).json({ message: 'Unsupported campaign status' });
    }

    const campaign = await Campaign.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.json(campaign);
  } catch (err) {
    console.error('reviewCampaign error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
