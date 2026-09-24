const mongoose = require('mongoose');
const Campaign = require('../models/Campaign');

exports.getPendingCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ status: 'pending' }).sort({ createdAt: 1 }).lean();
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

    if (status !== 'approved' && status !== 'rejected') {
      return res.status(400).json({ message: "status must be 'approved' or 'rejected'" });
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
