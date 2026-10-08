const mongoose = require('mongoose');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const Organization = require('../models/Organization');
const Report = require('../models/Report');
const User = require('../models/User');
const { getCampaignPayoutAccounts } = require('../services/campaignPayoutAccounts');
const { sendSuccess } = require('../utils/response');

const ADMIN_REVIEW_STATUSES = new Set(['approved', 'changes_requested', 'rejected', 'paused']);

const monthStart = (date = new Date()) => new Date(date.getFullYear(), date.getMonth(), 1);
const toId = (value) => (value ? String(value) : '');

const normalizeCampaignDocuments = (documents) => Array.isArray(documents)
  ? documents.map((value, index) => {
      const document = value && typeof value === 'object' ? value : { url: value };
      return {
        name: document.name || document.fileName || document.url || `Document ${index + 1}`,
        kind: document.kind || 'supporting document',
        ...(typeof document.url === 'string' ? { url: document.url } : {}),
      };
    })
  : [];

const normalizeCampaignForAdmin = (campaign) => {
  if (!campaign) return null;
  const source = typeof campaign.toObject === 'function' ? campaign.toObject() : campaign;
  const goalAmount = Number(source.goalAmount || 0);
  const raisedAmount = Number(source.raisedAmount || 0);
  const beneficiary = source.fundraiserData?.beneficiary || {};
  const isCommunity = source.fundraiserData?.beneficiaryType === 'community_org';

  return {
    id: toId(source._id),
    campaignId: toId(source._id),
    fundraiserId: toId(source.creatorUserId || source.organizationId || ''),
    fundraiserName: source.creatorName || 'Anonymous',
    title: source.title || '',
    category: source.category || 'other',
    amount: goalAmount,
    goalAmount,
    currentRaisedAmount: raisedAmount,
    raisedAmount,
    location: source.location || '',
    status: source.status || 'pending',
    deadline: source.fundraiserData?.deadline || '',
    images: Array.isArray(source.fundraiserData?.images)
      ? source.fundraiserData.images
      : source.imageUrl
        ? [source.imageUrl]
        : [],
    createdAt: source.createdAt || new Date(),
    submittedAt: source.createdAt || new Date(),
    description: source.story || '',
    supportingInfo: source.fundraiserData || null,
    reviewReason: source.fundraiserData?.reviewReason || '',
    organizationId: toId(source.organizationId),
    organizationName: source.organizationName || '',
    beneficiaryName: isCommunity
      ? source.organizationName || 'Community organization'
      : beneficiary.name || source.creatorName || 'Anonymous',
    beneficiary: {
      name: isCommunity
        ? source.organizationName || 'Community organization'
        : beneficiary.name || source.creatorName || 'Anonymous',
      relation: isCommunity
        ? 'Community organization'
        : source.fundraiserData?.beneficiaryType === 'myself'
          ? 'Campaign owner'
          : source.fundraiserData?.beneficiaryType || 'Campaign beneficiary',
      phone: beneficiary.phone || '',
      info: beneficiary.info || '',
    },
    receiving: (() => {
      const payoutAccount = Array.isArray(source.payoutAccounts) ? source.payoutAccounts[0] : null;
      return {
        bank: payoutAccount?.bankName || '',
        accountNumber: payoutAccount?.accountNumber || '',
        accountName: payoutAccount?.accountName || '',
      };
    })(),
    documents: normalizeCampaignDocuments(source.fundraiserData?.documents),
    verificationNotes: source.fundraiserData?.verificationNotes || source.fundraiserData?.reviewReason || '',
  };
};

exports.getDashboard = async (req, res) => {
  const now = new Date();
  const monthStartDate = monthStart(now);

  const [users, donations, reports, organizations, campaigns] = await Promise.all([
    User.find({
      status: { $ne: 'deleted' },
      role: { $nin: ['ADMIN', 'SUPER_ADMIN'] },
    })
      .select('name email phone role status createdAt')
      .sort({ createdAt: -1 })
      .lean(),
    Donation.find({ paymentStatus: 'completed' }).sort({ createdAt: -1 }).lean(),
    Report.find().sort({ createdAt: -1 }).lean(),
    Organization.find().sort({ createdAt: -1 }).lean(),
    Campaign.find().select('title status creatorUserId organizationId raisedAmount goalAmount category location story fundraiserData createdAt creatorName organizationName payoutAccounts').lean(),
  ]);

  const successfulDonations = donations.filter((donation) => donation.paymentStatus === 'completed');
  const monthSuccessfulDonations = successfulDonations.filter(
    (donation) => donation.createdAt && new Date(donation.createdAt) >= monthStartDate
  );
  const totalRaised = successfulDonations.reduce((sum, donation) => sum + Number(donation.amount || 0), 0);
  const monthRaised = monthSuccessfulDonations.reduce((sum, donation) => sum + Number(donation.amount || 0), 0);
  const pendingFundraisers = campaigns.filter((campaign) => campaign.status === 'pending').length;
  const unread = pendingFundraisers + reports.filter((report) => report.status === 'pending').length;

  const payload = {
    users: {
      total: users.length,
      newThisMonth: users.filter((user) => user.createdAt && new Date(user.createdAt) >= monthStartDate).length,
    },
    organizations: {
      total: organizations.length,
      newThisMonth: organizations.filter((organization) => organization.createdAt && new Date(organization.createdAt) >= monthStartDate).length,
    },
    donations: {
      totalCount: donations.length,
      totalAmount: totalRaised,
      thisMonthCount: monthSuccessfulDonations.length,
      thisMonthAmount: monthRaised,
    },
    fundraising: {
      totalCampaigns: campaigns.length,
      pendingCampaigns: campaigns.filter((campaign) => campaign.status === 'pending').length,
      approvedCampaigns: campaigns.filter((campaign) => campaign.status === 'approved').length,
      rejectedCampaigns: campaigns.filter((campaign) => campaign.status === 'rejected').length,
      totalRaised,
    },
    notifications: {
      pendingFundraisers,
      unread,
    },
  };

  return res.status(200).json({
    success: true,
    message: 'Admin dashboard loaded',
    data: payload,
    ...payload,
  });
};

exports.getPendingCampaigns = async (req, res) => {
  try {
    const requestedStatus = req.query.status;
    const filter = requestedStatus && ['draft', 'pending', 'approved', 'changes_requested', 'rejected', 'paused', 'completed'].includes(requestedStatus)
      ? { status: requestedStatus }
      : {};

    const campaigns = await Campaign.find(filter).sort({ createdAt: -1 }).lean();
    const items = campaigns.map(normalizeCampaignForAdmin);

    return res.json({
      campaigns: items,
      items,
      total: items.length,
      page: 1,
      limit: items.length,
      status: requestedStatus || 'all',
    });
  } catch (error) {
    console.error('getPendingCampaigns error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const updateCampaignReview = async (req, res, status) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid campaign ID' });
    }

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    const update = { status };
    if (typeof req.body?.reason === 'string' && req.body.reason.trim()) {
      const fundraiserData = (campaign.fundraiserData && typeof campaign.fundraiserData === 'object')
        ? { ...campaign.fundraiserData }
        : {};
      fundraiserData.reviewReason = req.body.reason.trim();
      update.fundraiserData = fundraiserData;
    }

    const version = Number.isInteger(campaign.__v) ? campaign.__v : 0;
    const updatedCampaign = await Campaign.findOneAndUpdate(
      { _id: id, __v: version },
      { $set: update, $inc: { __v: 1 } },
      { new: true, runValidators: true }
    );
    if (!updatedCampaign) {
      return res.status(409).json({
        message: 'Campaign changed while it was being reviewed. Reload it and review the latest version.',
      });
    }
    return res.json({
      campaign: normalizeCampaignForAdmin(updatedCampaign),
      fundraiser: normalizeCampaignForAdmin(updatedCampaign),
      ...normalizeCampaignForAdmin(updatedCampaign),
    });
  } catch (error) {
    console.error('reviewCampaign error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.reviewCampaign = async (req, res) => {
  const { status } = req.body || {};
  if (!status || !ADMIN_REVIEW_STATUSES.has(status)) {
    return res.status(400).json({ message: 'Unsupported campaign status' });
  }
  return updateCampaignReview(req, res, status);
};

exports.approveCampaign = async (req, res) => updateCampaignReview(req, res, 'approved');
exports.rejectCampaign = async (req, res) => updateCampaignReview(req, res, 'rejected');

exports.getCampaignReview = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid campaign ID' });
    }

    const campaign = await Campaign.findById(id).lean();
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    const payoutAccount = Array.isArray(campaign.payoutAccounts) ? campaign.payoutAccounts[0] : null;
    const review = {
      ...normalizeCampaignForAdmin(campaign),
      fundraiserInformation: {
        name: campaign.creatorName || 'Anonymous',
        id: toId(campaign.creatorUserId),
        organizationId: toId(campaign.organizationId),
        organizationName: campaign.organizationName || '',
      },
      beneficiary: {
        name: campaign.fundraiserData?.beneficiaryType === 'community_org'
          ? campaign.organizationName || 'Community organization'
          : campaign.fundraiserData?.beneficiary?.name || campaign.creatorName || 'Anonymous',
        relation: campaign.fundraiserData?.beneficiaryType === 'community_org'
          ? 'Community organization'
          : campaign.fundraiserData?.beneficiaryType === 'myself'
            ? 'Campaign owner'
            : campaign.fundraiserData?.beneficiaryType || 'Campaign beneficiary',
        phone: campaign.fundraiserData?.beneficiary?.phone || '',
        info: campaign.fundraiserData?.beneficiary?.info || '',
      },
      receiving: {
        bank: payoutAccount?.bankName || '',
        accountNumber: payoutAccount?.accountNumber || '',
        accountName: payoutAccount?.accountName || '',
      },
      documents: normalizeCampaignDocuments(campaign.fundraiserData?.documents),
      verificationNotes: campaign.fundraiserData?.verificationNotes || campaign.fundraiserData?.reviewReason || '',
      currentApprovalStatus: campaign.status,
      createdAt: campaign.createdAt,
      submittedAt: campaign.createdAt,
    };

    return res.json(review);
  } catch (error) {
    console.error('getCampaignReview error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getAdminDonations = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const { status, campaign, search, startDate, endDate } = req.query;

    const normalizedStatus = status ? String(status).toLowerCase() : '';
    if (normalizedStatus && !['successful', 'completed'].includes(normalizedStatus)) {
      return res.status(400).json({ message: 'Only successfully verified donations are available.' });
    }
    const filter = { paymentStatus: 'completed' };

    if (campaign) {
      filter.campaignId = campaign;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      const term = search.trim();
      filter.$or = [
        { donorName: { $regex: term, $options: 'i' } },
        { donorEmail: { $regex: term, $options: 'i' } },
        { receiptKey: { $regex: term, $options: 'i' } },
      ];
    }

    const [allDonations, donations, total] = await Promise.all([
      Donation.find(filter).sort({ createdAt: -1 }).lean(),
      Donation.find(filter)
        .populate('campaignId', 'title')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Donation.countDocuments(filter),
    ]);

    const items = donations.map((donation) => {
      const campaignTitle = donation.campaignId && typeof donation.campaignId === 'object' ? donation.campaignId.title : '';
      return {
        id: toId(donation._id),
        donationId: toId(donation._id),
        donorName: donation.anonymous ? 'Anonymous' : donation.donorName || 'Anonymous',
        donorEmail: donation.anonymous ? '' : donation.donorEmail || '',
        campaignId: toId(donation.campaignId),
        campaignTitle,
        amount: Number(donation.amount || 0),
        currency: 'ETB',
        paymentMethod: donation.provider || donation.bankId || 'bank_transfer',
        paymentStatus: 'successful',
        transactionId: donation.receiptKey || donation.certificateId || '',
        reference: donation.receiptKey || donation.certificateId || '',
        createdAt: donation.createdAt,
        paymentVerificationStatus: 'verified',
      };
    });

    const totalDonatedAmount = allDonations.reduce(
      (sum, donation) => sum + Number(donation.amount || 0),
      0
    );

    return res.json({
      donations: items,
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      summary: {
        totalDonations: total,
        successfulDonations: total,
        totalDonatedAmount,
      },
      totals: {
        totalNumberOfDonations: total,
        totalSuccessfulDonations: total,
        totalDonatedAmount,
      },
    });
  } catch (error) {
    console.error('getAdminDonations error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    if (!['active', 'suspended', 'banned'].includes(status)) {
      return res.status(400).json({ message: 'Status must be active, suspended or banned' });
    }

    const user = await User.findById(id);
    if (!user || user.status === 'deleted') {
      return res.status(404).json({ message: 'User not found' });
    }

    if (String(user._id) === String(req.user._id)) {
      return res.status(403).json({ message: 'You cannot change your own account status' });
    }

    if (['ADMIN', 'SUPER_ADMIN'].includes(user.role) && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Only a SUPER_ADMIN can change an admin account' });
    }

    user.status = status;
    if (status !== 'active') user.tokenVersion = Number(user.tokenVersion || 0) + 1;
    await user.save();

    return res.json({
      user: {
        id: toId(user._id),
        name: user.name,
        email: user.email || '',
        phone: user.phone || '',
        status: user.status,
      },
      status: user.status,
    });
  } catch (error) {
    console.error('updateUserStatus error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getAdminUsers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const { status, role, search } = req.query;

    const filter = { status: { $ne: 'deleted' } };
    if (status) filter.status = status;
    if (role) {
      if (['ADMIN', 'SUPER_ADMIN'].includes(role) && req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'Only a SUPER_ADMIN can view admin accounts' });
      }
      filter.role = role;
    } else if (req.user.role !== 'SUPER_ADMIN') {
      filter.role = { $nin: ['ADMIN', 'SUPER_ADMIN'] };
    }
    if (search) {
      const term = String(search).trim();
      filter.$or = [
        { name: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } },
        { phone: { $regex: term, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('name email phone role status createdAt')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    const items = await Promise.all(users.map(async (user) => {
      const [campaigns, donations] = await Promise.all([
        Campaign.find({ creatorUserId: user._id }).select('title status').sort({ createdAt: -1 }).lean(),
        Donation.countDocuments({ donorId: user._id }),
      ]);

      return {
        id: toId(user._id),
        userId: toId(user._id),
        name: user.name,
        email: user.email || '',
        phone: user.phone || '',
        accountType: user.role === 'ORGANIZATION' ? 'organization' : 'individual',
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        campaigns: campaigns.length,
        fundraisers: campaigns.map((campaign) => ({
          id: toId(campaign._id),
          title: campaign.title,
          status: campaign.status,
        })),
        donations,
      };

    }));

    return res.json({
      users: items,
      items,
      total,
      totalUsers: total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('getAdminUsers error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const normalizeAdminAccount = (user) => ({
  id: toId(user._id),
  name: user.name,
  email: user.email || '',
  phone: user.phone || '',
  role: user.role,
  status: user.status,
  createdAt: user.createdAt,
  profilePhoto: user.profilePhoto || '',
});

exports.getAdmins = async (_req, res) => {
  const admins = await User.find({
    status: { $ne: 'deleted' },
    role: { $in: ['ADMIN', 'SUPER_ADMIN'] },
  })
    .select('name email phone profilePhoto role status createdAt')
    .sort({ role: -1, createdAt: 1 })
    .lean();

  return res.json({ admins: admins.map(normalizeAdminAccount) });
};

exports.getAdminCandidates = async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 100, 1), 100);
  const filter = { role: 'USER', status: 'active' };
  const [users, total] = await Promise.all([
    User.find(filter)
    .select('name email phone role status createdAt')
    .sort({ name: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean(),
    User.countDocuments(filter),
  ]);

  const items = users.map(normalizeAdminAccount);
  return res.json({ users: items, items, total, page, limit, pages: Math.ceil(total / limit) });
};

exports.addAdmin = async (req, res) => {
  const userId = req.body?.userId;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'A valid user ID is required' });
  }

  const user = await User.findById(userId);
  if (!user || user.status === 'deleted') {
    return res.status(404).json({ message: 'User not found' });
  }
  if (user.role !== 'USER' || user.status !== 'active') {
    return res.status(409).json({ message: 'Only an active regular user can be added as an admin' });
  }

  user.role = 'ADMIN';
  user.tokenVersion = Number(user.tokenVersion || 0) + 1;
  await user.save();
  return res.status(200).json({ admin: normalizeAdminAccount(user) });
};

exports.removeAdmin = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid admin ID' });
  }

  const user = await User.findById(id);
  if (!user || user.status === 'deleted') {
    return res.status(404).json({ message: 'Admin not found' });
  }
  if (user.role !== 'ADMIN') {
    return res.status(409).json({ message: 'Only regular admin accounts can be removed' });
  }

  user.role = 'USER';
  user.tokenVersion = Number(user.tokenVersion || 0) + 1;
  await user.save();
  return res.json({ user: normalizeAdminAccount(user) });
};

exports.getAdminUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await User.findById(id).select('name email phone role status createdAt').lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (['ADMIN', 'SUPER_ADMIN'].includes(user.role) && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Only a SUPER_ADMIN can view admin accounts' });
    }

    const [campaigns, donations] = await Promise.all([
      Campaign.find({ creatorUserId: user._id }).select('title status createdAt').lean(),
      Donation.find({ donorId: user._id, paymentStatus: 'completed' }).select('amount paymentStatus createdAt campaignId').lean(),
    ]);

    return res.json({
      user: {
        id: toId(user._id),
        name: user.name,
        email: user.email || '',
        phone: user.phone || '',
        accountType: user.role === 'ORGANIZATION' ? 'organization' : 'individual',
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        campaigns: campaigns.map((campaign) => ({
          id: toId(campaign._id),
          title: campaign.title,
          status: campaign.status,
          createdAt: campaign.createdAt,
        })),
        donations: donations.map((donation) => ({
          id: toId(donation._id),
          amount: Number(donation.amount || 0),
          paymentStatus: donation.paymentStatus,
          createdAt: donation.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('getAdminUserById error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getAdminActivity = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ status: { $in: ['pending', 'approved', 'rejected'] } })
      .select('title status createdAt creatorName')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    const donations = await Donation.find({ paymentStatus: 'completed' })
      .select('donorName amount createdAt campaignId')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const items = [
      ...campaigns.map((campaign) => ({
        id: toId(campaign._id),
        type: campaign.status === 'approved' ? 'fundraiser_approved' : campaign.status === 'rejected' ? 'fundraiser_rejected' : 'fundraiser_submitted',
        message: `${campaign.title} is ${campaign.status}`,
        actor: campaign.creatorName || 'System',
        at: campaign.createdAt,
      })),
      ...donations.map((donation) => ({
        id: toId(donation._id),
        type: 'donation_confirmed',
        message: `${donation.donorName || 'Anonymous'} donated ETB ${Number(donation.amount || 0)}`,
        actor: donation.donorName || 'Anonymous',
        at: donation.createdAt,
      })),
    ].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 20);

    return res.json({ activity: items, items });
  } catch (error) {
    console.error('getAdminActivity error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
