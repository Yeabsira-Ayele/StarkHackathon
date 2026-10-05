const mongoose = require('mongoose');
const Campaign = require('../models/Campaign');
const Organization = require('../models/Organization');

const CATEGORIES = ['medical', 'education', 'emergency', 'business', 'water', 'environment', 'community', 'other'];
const EDITABLE_FIELDS = ['title', 'story', 'goalAmount', 'category', 'imageUrl', 'location', 'impactMetric', 'beneficiariesTarget', 'fundraiserData'];

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

    const filter = { status: 'approved' };

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

    if (campaign.status !== 'approved' &&
      (!req.user || (String(campaign.creatorUserId) !== String(req.user._id) &&
        !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)))) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.json(withProgress(campaign));
  } catch (err) {
    console.error('getCampaignById error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ creatorUserId: req.user._id }).sort({ updatedAt: -1, createdAt: -1 }).lean();
    res.json(campaigns);
  } catch (err) {
    console.error('getMyCampaigns error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createDraft = async (req, res) => {
  try {
    const data = req.body?.fundraiserData;
    if (!data || typeof data !== 'object') return res.status(400).json({ message: 'Fundraiser details are required' });
    const campaign = await Campaign.create({
      title: String(data.title || 'Untitled fundraiser').trim(),
      story: String(data.story || 'Draft').trim(),
      goalAmount: Number(data.goalAmount) || 1,
      creatorName: req.user.name,
      creatorUserId: req.user._id,
      category: CATEGORIES.includes(data.category) ? data.category : 'other',
      imageUrl: Array.isArray(data.images) ? data.images[0] : undefined,
      location: data.location,
      fundraiserData: { ...data, creatorId: String(req.user._id), status: 'draft' },
      status: 'draft',
    });
    res.status(201).json(campaign);
  } catch (err) {
    console.error('createDraft error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.submitCampaign = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid campaign ID' });
    const campaign = await Campaign.findOne({ _id: req.params.id, creatorUserId: req.user._id });
    if (!campaign) return res.status(404).json({ message: 'Fundraiser not found' });
    if (!['draft', 'changes_requested'].includes(campaign.status)) {
      return res.status(409).json({ message: 'This fundraiser cannot be submitted in its current status' });
    }
    const otherActive = await Campaign.exists({
      creatorUserId: req.user._id,
      _id: { $ne: campaign._id },
      status: { $in: ['pending', 'changes_requested', 'approved', 'paused'] },
    });
    if (otherActive) return res.status(409).json({ message: 'Only one active fundraiser is allowed at a time' });
    campaign.status = 'pending';
    campaign.fundraiserData = { ...(campaign.fundraiserData || {}), status: 'pending', reviewNote: undefined };
    await campaign.save();
    res.json(campaign);
  } catch (err) {
    console.error('submitCampaign error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.requestCampaignDelete = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid campaign ID' });
    const campaign = await Campaign.findOne({ _id: req.params.id, creatorUserId: req.user._id });
    if (!campaign) return res.status(404).json({ message: 'Fundraiser not found' });
    if (campaign.status === 'draft' && campaign.raisedAmount === 0) {
      await campaign.deleteOne();
      return res.status(204).end();
    }
    campaign.deleteRequested = true;
    await campaign.save();
    res.json({ message: 'Deletion request saved' });
  } catch (err) {
    console.error('requestCampaignDelete error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /campaigns
// Body: { title, story, goalAmount, creatorName?, category?, imageUrl? }
exports.createCampaign = async (req, res) => {
  try {
    const { title, story, goalAmount, category, imageUrl, location, impactMetric, beneficiariesTarget } = req.body;

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

    const organization = req.user.role === 'ORGANIZATION'
      ? await Organization.findOne({ userId: req.user._id }).select('_id name verificationStatus')
      : null;
    const campaign = await Campaign.create({
      title: title.trim(),
      story: story.trim(),
      goalAmount: parsedGoal,
      creatorName: req.user.name,
      creatorUserId: req.user._id,
      ...(organization ? { organizationId: organization._id, organizationName: organization.name } : {}),
      ...(organization ? { verifiedOrganization: organization.verificationStatus === 'approved' } : {}),
      category: category || undefined, // schema default: "other"
      imageUrl: imageUrl?.trim() || undefined,
      location: location?.trim() || undefined,
      impactMetric: impactMetric?.trim() || undefined,
      beneficiariesTarget: Number.isFinite(Number(beneficiariesTarget)) ? Number(beneficiariesTarget) : undefined,
      // raisedAmount is intentionally not accepted from the client
    });

    res.status(201).json(campaign);
  } catch (err) {
    console.error('createCampaign error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /campaigns/:id/updates
exports.postCampaignUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    if (!isValidId(id)) return res.status(400).json({ message: 'Invalid campaign ID' });
    if (typeof title !== 'string' || !title.trim() || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
    const campaign = await Campaign.findOne({ _id: id, creatorUserId: req.user._id });
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    const update = campaign.updates.create({ title: title.trim(), content: content.trim(), authorName: req.user.name });
    campaign.updates.unshift(update);
    await campaign.save();
    res.status(201).json(update);
  } catch (err) {
    console.error('postCampaignUpdate error:', err);
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

    const campaign = await Campaign.findById(id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    if (String(campaign.creatorUserId) !== String(req.user._id) &&
      !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ message: 'You cannot edit this campaign' });
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

    const updatedCampaign = await Campaign.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    res.json(updatedCampaign);
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