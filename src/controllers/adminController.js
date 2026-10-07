const mongoose = require('mongoose');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const Organization = require('../models/Organization');
const Report = require('../models/Report');
const User = require('../models/User');
const { getCampaignPayoutAccounts } = require('../services/campaignPayoutAccounts');
const { sendSuccess } = require('../utils/response');

exports.getDashboard = async (req, res) => {
  const [users, donations, reports, organizations, campaigns] = await Promise.all([
    User.find({
      status: { $ne: 'deleted' },
      role: { $nin: ['ADMIN', 'SUPER_ADMIN'] },
    })
      .select('name email phone role status createdAt')
      .sort({ createdAt: -1 })
      .lean(),
    Donation.find({ paymentStatus: { $in: ['completed', 'failed'] } }).sort({ createdAt: -1 }).lean(),
    Report.find().sort({ createdAt: -1 }).lean(),
    Organization.find().sort({ createdAt: -1 }).lean(),
    Campaign.find().select('title status creatorUserId organizationId payoutAccounts fundraiserData').lean(),
  ]);

  const campaignsByOwner = new Map();
  for (const campaign of campaigns) {
    for (const ownerId of [campaign.creatorUserId, campaign.organizationId].filter(Boolean)) {
      const key = String(ownerId);
      const ownedCampaigns = campaignsByOwner.get(key) || [];
      ownedCampaigns.push({
        id: String(campaign._id),
        title: campaign.title,
        status: campaign.status,
      });
      campaignsByOwner.set(key, ownedCampaigns);
    }
  }
  const organizationsByUserId = new Map(
    organizations.map((organization) => [String(organization.userId), organization])
  );
  const organizationsById = new Map(
    organizations.map((organization) => [String(organization._id), organization])
  );
  const campaignsById = new Map(campaigns.map((campaign) => [String(campaign._id), campaign]));
  const raisedByCampaign = new Map();
  for (const donation of donations) {
    if (donation.paymentStatus !== 'completed') continue;
    const campaignId = String(donation.campaignId);
    raisedByCampaign.set(campaignId, (raisedByCampaign.get(campaignId) || 0) + donation.amount);
  }

  const data = {
    users: users.map((user) => {
      const organization = organizationsByUserId.get(String(user._id));
      const fundraisers = [
        ...(campaignsByOwner.get(String(user._id)) || []),
        ...(organization ? campaignsByOwner.get(String(organization._id)) || [] : []),
      ];
      return {
        id: String(user._id),
        name: user.name,
        email: user.email || '',
        phone: user.phone || '',
        accountType: user.role === 'ORGANIZATION' ? 'organization' : 'individual',
        status: user.status === 'active' ? 'active' : 'suspended',
        joinedAt: user.createdAt,
        fundraisers: [...new Map(fundraisers.map((fundraiser) => [fundraiser.id, fundraiser])).values()],
      };
    }),
    donations: donations.map((donation) => {
      const campaign = campaignsById.get(String(donation.campaignId));
      const organization = campaign?.organizationId
        ? organizationsById.get(String(campaign.organizationId))
        : null;
      const payoutAccount = campaign
        ? getCampaignPayoutAccounts(campaign, organization).find(
          ({ bankId }) => bankId === donation.bankId
        )
        : null;
      return {
        id: String(donation._id),
        campaignId: String(donation.campaignId),
        donorName: donation.anonymous ? 'Anonymous' : donation.donorName || 'Anonymous',
        donorEmail: donation.anonymous ? '' : donation.donorEmail || '',
        anonymous: Boolean(donation.anonymous),
        amount: donation.amount,
        bank: payoutAccount?.bankName || donation.bankId || '',
        accountNumber: payoutAccount?.accountNumber || '',
        reference: donation.receiptKey || '',
        status: donation.paymentStatus === 'completed' ? 'successful' : 'failed',
        createdAt: donation.createdAt,
      };
    }),
    reports: reports.map((report) => ({
      id: String(report._id),
      reporterId: String(report.reporterId),
      campaignId: String(report.campaignId),
      category: report.category,
      details: report.details,
      evidence: report.evidence,
      status: report.status,
      createdAt: report.createdAt,
      ...(report.resolutionNote ? { resolutionNote: report.resolutionNote } : {}),
    })),
    organizations: organizations.map((organization) => {
      const account = organization.payoutAccounts[0];
      return {
        id: String(organization._id),
        name: organization.name,
        organizationType: organization.organizationType,
        officialEmail: organization.officialEmail,
        phone: organization.phone,
        address: organization.location,
        description: organization.description,
        logoUrl: organization.logo,
        representative: {
          name: organization.authorizedRepresentative.name,
          role: 'Authorized representative',
          phone: organization.authorizedRepresentative.phone,
        },
        bank: {
          bank: account?.bankName || '',
          accountNumber: account?.accountNumber || '',
          accountName: account?.accountHolderName || '',
        },
        documents: organization.verificationDocuments.map((document) => document.url),
        status: organization.verificationStatus === 'changes_requested'
          ? 'needs_changes'
          : organization.verificationStatus,
        submittedAt: organization.createdAt,
        activeCauses: campaigns.filter(
          (campaign) =>
            String(campaign.organizationId) === String(organization._id) &&
            ['pending', 'approved'].includes(campaign.status)
        ).length,
        totalRaised: campaigns.reduce(
          (total, campaign) =>
            String(campaign.organizationId) === String(organization._id)
              ? total + (raisedByCampaign.get(String(campaign._id)) || 0)
              : total,
          0
        ),
        decisionNote: organization.reviewNotes,
      };
    }),
    activity: [],
    admins: [],
    currentAdminId: String(req.user._id),
    unavailableSections: ['activity', 'admins', 'profile'],
  };

  sendSuccess(res, 'Admin dashboard loaded', data);
};

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
