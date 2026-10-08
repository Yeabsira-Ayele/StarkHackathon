const mongoose = require('mongoose');
const { isDeepStrictEqual } = require('node:util');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const Organization = require('../models/Organization');
const {
  getCampaignPayoutAccounts,
  getPayoutAccountId,
  isValidPayoutAccount,
  stripPayoutAccounts,
} = require('../services/campaignPayoutAccounts');

const CATEGORIES = ['medical', 'education', 'emergency', 'business', 'water', 'environment', 'community', 'other'];
const EDITABLE_FIELDS = ['title', 'story', 'goalAmount', 'category', 'imageUrl', 'location', 'impactMetric', 'beneficiariesTarget', 'fundraiserData'];

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getVerifiedDonationTotals = async (campaigns) => {
  if (campaigns.length === 0) return new Map();

  const totals = await Donation.aggregate([
    {
      $match: {
        campaignId: { $in: campaigns.map((campaign) => campaign._id) },
        paymentStatus: 'completed',
      },
    },
    {
      $group: {
        _id: '$campaignId',
        raisedAmount: { $sum: '$amount' },
        donationsCount: { $sum: 1 },
      },
    },
  ]);

  return new Map(totals.map((total) => [String(total._id), total]));
};

const withProgress = (campaign, verifiedTotals = {}) => {
  const raisedAmount = verifiedTotals.raisedAmount ?? 0;
  const goalAmount = Number(campaign.goalAmount);

  return {
    ...campaign,
    raisedAmount,
    donationsCount: verifiedTotals.donationsCount ?? 0,
    progress: Number.isFinite(goalAmount) && goalAmount > 0
      ? Math.min(Math.round((raisedAmount / goalAmount) * 100), 100)
      : 0,
  };
};

// GET /campaigns?category=medical&search=school&sort=newest|oldest|mostFunded&page=1&limit=10
exports.getCampaigns = async (req, res) => {
  try {
    const { category, search, sort = 'newest' } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

    const filter = { status: { $in: ['pending', 'approved'] } };
    if (req.query.status === 'pending' || req.query.status === 'approved') {
      filter.status = req.query.status;
    }

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

    const verifiedTotals = await getVerifiedDonationTotals(campaigns);

    res.json({
      campaigns: campaigns.map((campaign) => withProgress(
        stripPayoutAccounts(campaign),
        verifiedTotals.get(String(campaign._id))
      )),
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

    if (!['pending', 'approved'].includes(campaign.status) &&
      (!req.user || (String(campaign.creatorUserId) !== String(req.user._id) &&
        !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)))) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    const [verifiedTotals] = await Promise.all([
      getVerifiedDonationTotals([campaign]),
    ]);
    const isOwner = req.user && String(campaign.creatorUserId) === String(req.user._id);
    const isAdmin = req.user && ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
    res.json(withProgress(
      isOwner || isAdmin ? campaign : stripPayoutAccounts(campaign),
      verifiedTotals.get(String(campaign._id))
    ));
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
    const isCommunity = data.beneficiaryType === 'community_org';
    if (isCommunity && !isValidId(data.organizationId)) {
      return res.status(400).json({ message: 'Choose a valid community organization for this fundraiser.' });
    }
    const organization = isCommunity
      ? await Organization.findById(data.organizationId).select('_id name verificationStatus payoutAccounts')
      : null;
    if (isCommunity && !organization) return res.status(404).json({ message: 'Community organization not found' });

    const payoutAccounts = getCampaignPayoutAccounts({ fundraiserData: data }, organization);
    const campaign = await Campaign.create({
      title: String(data.title || 'Untitled fundraiser').trim(),
      story: String(data.story || 'Draft').trim(),
      goalAmount: Number(data.goalAmount) || 1,
      creatorName: req.user.name,
      creatorUserId: req.user._id,
      ...(organization ? {
        organizationId: organization._id,
        organizationName: organization.name,
        verifiedOrganization: organization.verificationStatus === 'approved',
      } : {}),
      category: CATEGORIES.includes(data.category) ? data.category : 'other',
      imageUrl: Array.isArray(data.images) ? data.images[0] : undefined,
      location: data.location,
      fundraiserData: { ...data, creatorId: String(req.user._id), status: 'draft' },
      payoutAccounts,
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
    const organization = campaign.organizationId
      ? await Organization.findById(campaign.organizationId).select('payoutAccounts')
      : null;
    if (getCampaignPayoutAccounts(campaign, organization).length === 0) {
      return res.status(400).json({ message: 'Add and save a valid receiving bank account before publishing this fundraiser.' });
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
    const isOwner = String(campaign.creatorUserId) === String(req.user._id);
    if (!isOwner &&
      !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ message: 'You cannot edit this campaign' });
    }

    if (req.body.fundraiserData !== undefined) {
      const fundraiserData = req.body.fundraiserData;
      if (!fundraiserData || typeof fundraiserData !== 'object' || Array.isArray(fundraiserData)) {
        return res.status(400).json({ message: 'Fundraiser details must be an object' });
      }
      const isCommunity = fundraiserData.beneficiaryType === 'community_org';
      if (isCommunity && !isValidId(fundraiserData.organizationId)) {
        return res.status(400).json({ message: 'Choose a valid community organization for this fundraiser.' });
      }
      const organization = isCommunity
        ? await Organization.findById(fundraiserData.organizationId)
          .select('_id name verificationStatus payoutAccounts')
        : null;
      if (isCommunity && !organization) {
        return res.status(404).json({ message: 'Community organization not found' });
      }
      if (isCommunity && organization.verificationStatus !== 'approved') {
        return res.status(400).json({ message: 'Choose an approved community organization for this fundraiser.' });
      }

      const submittedAccounts = Array.isArray(fundraiserData.banks)
        ? fundraiserData.banks
        : fundraiserData.bank
          ? [fundraiserData.bank]
          : [];
      if (!isCommunity && submittedAccounts.some((account) => !isValidPayoutAccount(account))) {
        return res.status(400).json({ message: 'Every payout account must include a bank, valid account number, and account-holder name.' });
      }
      const newAccounts = getCampaignPayoutAccounts(
        { fundraiserData, payoutAccounts: [] },
        organization
      );
      req.body.payoutAccounts = newAccounts;
      req.body.organizationId = organization?._id || null;
      req.body.organizationName = organization?.name || '';
      req.body.verifiedOrganization = Boolean(organization);
    }

    if (req.body.payoutAccounts !== undefined) {
      if (!Array.isArray(req.body.payoutAccounts) ||
        req.body.payoutAccounts.some((account) => !isValidPayoutAccount(account))) {
        return res.status(400).json({ message: 'Payout accounts must contain valid bank and account details.' });
      }
      req.body.payoutAccounts = getCampaignPayoutAccounts({
        payoutAccounts: req.body.payoutAccounts,
      });
    }

    const updates = {};
    for (const field of EDITABLE_FIELDS) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    for (const field of ['payoutAccounts', 'organizationId', 'organizationName', 'verifiedOrganization']) {
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

    const current = campaign.toObject();
    const changed = Object.entries(updates).some(([field, value]) =>
      !isDeepStrictEqual(current[field], value)
    );
    const version = Number.isInteger(campaign.__v) ? campaign.__v : 0;
    if (changed && isOwner && ['approved', 'completed'].includes(campaign.status)) {
      updates.status = 'pending';
    }
    updates.__v = version + 1;

    const updatedCampaign = await Campaign.findOneAndUpdate(
      { _id: id, __v: version },
      updates,
      {
      new: true,
      runValidators: true,
      }
    );

    if (!updatedCampaign) {
      return res.status(409).json({ message: 'This campaign changed while you were editing it. Reload and try again.' });
    }

    res.json(updatedCampaign);
  } catch (err) {
    console.error('updateCampaign error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDonationAccounts = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid campaign ID' });
    const campaign = await Campaign.findById(req.params.id).select(
      'status fundraiserData payoutAccounts organizationId'
    ).lean();
    if (!campaign || !['pending', 'approved'].includes(campaign.status)) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    const organization = campaign.organizationId
      ? await Organization.findById(campaign.organizationId).select('payoutAccounts').lean()
      : null;
    res.json({ accounts: getCampaignPayoutAccounts(campaign, organization) });
  } catch (err) {
    console.error('getDonationAccounts error:', err);
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