const mongoose = require('mongoose');
const Campaign = require('../models/Campaign');

const CATEGORIES = ['medical', 'education', 'emergency', 'business', 'other'];
const EDITABLE_FIELDS = ['title', 'story', 'goalAmount', 'category', 'imageUrl', 'creatorName'];

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const withProgress = (campaign) => ({
  ...campaign,
  progress: campaign.goalAmount
    ? Math.min(Math.round((campaign.raisedAmount / campaign.goalAmount) * 100), 100)
    : 0,
});

// GET /campaigns?category=medical&search=school&sort=newest|oldest|mostFunded&page=1&limit=10
exports.getCampaigns = async (req, res) => {
  try {
    const { category, search, sort = 'newest' } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

    const filter = {};

    if (category) {
      if (!CATEGORIES.includes(category)) {
        return res.status(400).json({ message: `Category must be one of: ${CATEGORIES.join(', ')}` });
      }
      filter.category = category;
    }

    if (search) {
      filter.title = { $regex: escapeRegex(String(search).trim()), $options: 'i' };
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      mostFunded: { raisedAmount: -1 },
    };

    const [campaigns, total] = await Promise.all([
      Campaign.find(filter)
        .sort(sortOptions[sort] || sortOptions.newest)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Campaign.countDocuments(filter),
    ]);

    res.json({
      campaigns: campaigns.map(withProgress),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('getCampaigns error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /campaigns/:id
exports.getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid campaign ID' });
    }

    const campaign = await Campaign.findById(id).lean();
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.json(withProgress(campaign));
  } catch (err) {
    console.error('getCampaignById error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /campaigns
// Body: { title, story, goalAmount, creatorName?, category?, imageUrl? }
exports.createCampaign = async (req, res) => {
  try {
    const { title, story, goalAmount, creatorName, category, imageUrl } = req.body;

    if (!title?.trim() || !story?.trim()) {
      return res.status(400).json({ message: 'Title and story are required' });
    }

    const parsedGoal = Number(goalAmount);
    if (!Number.isFinite(parsedGoal) || parsedGoal <= 0) {
      return res.status(400).json({ message: 'Goal amount must be a number greater than 0' });
    }

    if (category && !CATEGORIES.includes(category)) {
      return res.status(400).json({ message: `Category must be one of: ${CATEGORIES.join(', ')}` });
    }

    const campaign = await Campaign.create({
      title: title.trim(),
      story: story.trim(),
      goalAmount: parsedGoal,
      creatorName: creatorName?.trim() || undefined, // schema default: "Anonymous"
      category: category || undefined, // schema default: "other"
      imageUrl: imageUrl?.trim() || undefined,
      // raisedAmount is intentionally not accepted from the client
    });

    res.status(201).json(campaign);
  } catch (err) {
    console.error('createCampaign error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /campaigns/:id
// Only whitelisted fields can be updated (never raisedAmount).
exports.updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid campaign ID' });
    }

    const updates = {};
    for (const field of EDITABLE_FIELDS) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    if ('title' in updates || 'story' in updates) {
      for (const field of ['title', 'story']) {
        if (field in updates && !String(updates[field]).trim()) {
          return res.status(400).json({ message: `${field} cannot be empty` });
        }
      }
    }

    if ('goalAmount' in updates) {
      updates.goalAmount = Number(updates.goalAmount);
      if (!Number.isFinite(updates.goalAmount) || updates.goalAmount <= 0) {
        return res.status(400).json({ message: 'Goal amount must be a number greater than 0' });
      }
    }

    if ('category' in updates && !CATEGORIES.includes(updates.category)) {
      return res.status(400).json({ message: `Category must be one of: ${CATEGORIES.join(', ')}` });
    }

    const campaign = await Campaign.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.json(campaign);
  } catch (err) {
    console.error('updateCampaign error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /campaigns/:id
// Blocked once a campaign has received money, so donation records
// are never orphaned.
exports.deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid campaign ID' });
    }

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (campaign.raisedAmount > 0) {
      return res
        .status(409)
        .json({ message: 'Cannot delete a campaign that has already received donations' });
    }

    await campaign.deleteOne();
    res.json({ message: 'Campaign deleted' });
  } catch (err) {
    console.error('deleteCampaign error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};