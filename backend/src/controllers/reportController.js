const mongoose = require('mongoose');
const Campaign = require('../models/Campaign');
const Report = require('../models/Report');
const Donation = require('../models/Donation');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/response');

const REPORT_CATEGORIES = ['False Information', 'Fraud / Scam', 'Misleading Content', 'Other'];
const REPORT_STATUSES = ['reviewed', 'resolved', 'dismissed'];
const SECTOR_COLORS = {
  medical: '#B45309',
  education: '#1E4D38',
  emergency: '#B91C1C',
  business: '#1D4ED8',
  water: '#0891B2',
  environment: '#15803D',
  community: '#7C3AED',
  other: '#737373',
};

const toTransparencyRecord = (campaign, contribution) => ({
  id: String(campaign._id),
  campaignTitle: campaign.title,
  sector: campaign.category || 'other',
  organization: campaign.organizationName || campaign.creatorName || 'Independent fundraiser',
  totalRaisedETB: Number(contribution?.totalRaisedETB || 0),
  contributionCount: Number(contribution?.contributionCount || 0),
  lastContributionAt: contribution?.lastContributionAt || null,
  status: campaign.status,
});

const getContributionSummaries = async (campaignIds) => {
  if (!campaignIds.length) return new Map();
  const results = await Donation.aggregate([
    { $match: { campaignId: { $in: campaignIds }, paymentStatus: 'completed' } },
    {
      $group: {
        _id: '$campaignId',
        totalRaisedETB: { $sum: '$amount' },
        contributionCount: { $sum: 1 },
        lastContributionAt: { $max: '$createdAt' },
      },
    },
  ]);
  return new Map(results.map((item) => [String(item._id), item]));
};

exports.getTransparencyOverview = async (_req, res) => {
  try {
    const campaigns = await Campaign.find({ status: { $in: ['pending', 'approved'] } })
      .select('title category creatorName organizationName status')
      .sort({ createdAt: -1 })
      .lean();
    const summaries = await getContributionSummaries(campaigns.map((campaign) => campaign._id));
    const totalRaisedETB = [...summaries.values()].reduce((total, item) => total + Number(item.totalRaisedETB || 0), 0);
    const totalContributions = [...summaries.values()].reduce((total, item) => total + Number(item.contributionCount || 0), 0);
    const sectorTotals = new Map();

    for (const campaign of campaigns) {
      const contribution = summaries.get(String(campaign._id));
      if (!contribution) continue;
      const sector = campaign.category || 'other';
      const current = sectorTotals.get(sector) || { totalAmountETB: 0, projectsCount: 0 };
      current.totalAmountETB += Number(contribution.totalRaisedETB || 0);
      current.projectsCount += 1;
      sectorTotals.set(sector, current);
    }

    const sectorBreakdowns = [...sectorTotals].map(([sector, totals]) => ({
      sector,
      label: { am: sector, en: sector, om: sector },
      totalAmountETB: totals.totalAmountETB,
      percentage: totalRaisedETB ? Math.round((totals.totalAmountETB / totalRaisedETB) * 100) : 0,
      projectsCount: totals.projectsCount,
      color: SECTOR_COLORS[sector] || SECTOR_COLORS.other,
    }));
    const contributionRecords = campaigns
      .filter((campaign) => summaries.has(String(campaign._id)))
      .map((campaign) => toTransparencyRecord(campaign, summaries.get(String(campaign._id))));

    return res.json({
      success: true,
      data: {
        totalRaisedETB,
        totalContributions,
        supportedCampaigns: contributionRecords.length,
        sectorBreakdowns,
        contributionRecords,
      },
    });
  } catch (error) {
    console.error('getTransparencyOverview error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getTransparencyCampaign = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    const campaign = await Campaign.findOne({ _id: req.params.id, status: { $in: ['pending', 'approved'] } })
      .select('title category creatorName organizationName status')
      .lean();
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    const [contribution] = await Donation.aggregate([
      { $match: { campaignId: campaign._id, paymentStatus: 'completed' } },
      {
        $group: {
          _id: '$campaignId',
          totalRaisedETB: { $sum: '$amount' },
          contributionCount: { $sum: 1 },
          lastContributionAt: { $max: '$createdAt' },
        },
      },
    ]);
    return res.json({ success: true, data: { record: toTransparencyRecord(campaign, contribution) } });
  } catch (error) {
    console.error('getTransparencyCampaign error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getAdminReports = async (_req, res) => {
  try {
    const reports = await Report.find()
      .populate('reporterId', 'name email')
      .populate('campaignId', 'title')
      .sort({ createdAt: -1 })
      .lean();
    const items = reports.map((report) => ({
      ...report,
      reporterId: report.reporterId?._id ? String(report.reporterId._id) : String(report.reporterId || ''),
      reporterName: report.reporterId?.name || '',
      reporterEmail: report.reporterId?.email || '',
      campaignId: report.campaignId?._id ? String(report.campaignId._id) : String(report.campaignId || ''),
      campaignTitle: report.campaignId?.title || '',
    }));
    return res.json({ reports: items, items, total: items.length });
  } catch (error) {
    console.error('getAdminReports error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.create = async (req, res) => {
  const { campaignId, category, details, evidence = [] } = req.body || {};
  if (!mongoose.isValidObjectId(campaignId)) {
    throw new AppError('A valid campaign ID is required', 400, 'VALIDATION_ERROR', {
      campaignId: 'A valid campaign ID is required',
    });
  }
  if (!REPORT_CATEGORIES.includes(category)) {
    throw new AppError('Select a valid report category', 400, 'VALIDATION_ERROR', {
      category: 'Select a valid report category',
    });
  }
  if (typeof details !== 'string' || !details.trim() || details.trim().length > 2000) {
    throw new AppError('Report details must be between 1 and 2000 characters', 400, 'VALIDATION_ERROR', {
      details: 'Report details must be between 1 and 2000 characters',
    });
  }
  if (!Array.isArray(evidence) || evidence.length > 10 ||
      evidence.some((item) => typeof item !== 'string' || item.trim().length > 2048)) {
    throw new AppError('Evidence must contain at most 10 links of 2048 characters or fewer', 400, 'VALIDATION_ERROR', {
      evidence: 'Evidence must contain at most 10 links of 2048 characters or fewer',
    });
  }
  if (!(await Campaign.exists({ _id: campaignId }))) {
    throw new AppError('Campaign not found', 404, 'CAMPAIGN_NOT_FOUND');
  }

  const report = await Report.create({
    reporterId: req.user._id,
    campaignId,
    category,
    details: details.trim(),
    evidence: evidence.map((item) => item.trim()).filter(Boolean),
  });
  sendSuccess(res, 'Report submitted', { report }, 201);
};

exports.getMine = async (req, res) => {
  const reports = await Report.find({ reporterId: req.user._id }).sort({ createdAt: -1 }).lean();
  sendSuccess(res, 'Reports loaded', { items: reports });
};

exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError('Report not found', 404, 'REPORT_NOT_FOUND');
  }
  const { status, note } = req.body || {};
  if (!REPORT_STATUSES.includes(status)) {
    throw new AppError('Unsupported report status', 400, 'VALIDATION_ERROR', {
      status: 'Must be reviewed, resolved or dismissed',
    });
  }
  if (note !== undefined && (typeof note !== 'string' || note.trim().length > 1000)) {
    throw new AppError('Report note must be 1000 characters or fewer', 400, 'VALIDATION_ERROR', {
      note: 'Report note must be 1000 characters or fewer',
    });
  }

  const report = await Report.findByIdAndUpdate(
    id,
    {
      $set: {
        status,
        reviewedBy: req.user._id,
        ...(note === undefined ? {} : { resolutionNote: note.trim() }),
      },
    },
    { new: true, runValidators: true }
  );
  if (!report) throw new AppError('Report not found', 404, 'REPORT_NOT_FOUND');
  sendSuccess(res, 'Report updated', { report });
};
