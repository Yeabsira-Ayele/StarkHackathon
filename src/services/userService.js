const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Campaign = require('../models/Campaign');
const Organization = require('../models/Organization');
const AppError = require('../utils/AppError');

const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('Account not found', 404, 'USER_NOT_FOUND');
  const result = { user };
  if (user.role === 'ORGANIZATION') {
    result.organization = await Organization.findOne({ userId }).select('name verificationStatus reviewNotes');
  }
  return result;
};

// The phone number is the account's identity, so it cannot be changed here.
const updateProfile = async (userId, { name, email, profilePhoto, preferredLanguage }) => {
  const changes = {};
  if (name !== undefined) changes.name = name.trim();
  if (email !== undefined) changes.email = email === '' ? undefined : email.trim().toLowerCase();
  if (profilePhoto !== undefined) changes.profilePhoto = profilePhoto;
  if (preferredLanguage !== undefined) changes.preferredLanguage = preferredLanguage;

  const user = await User.findById(userId);
  if (!user) throw new AppError('Account not found', 404, 'USER_NOT_FOUND');
  if (email !== undefined && changes.email !== user.email) user.emailVerified = false;
  user.set(changes);
  await user.save();
  return user;
};

const getSavedCampaigns = async (userId) => {
  const user = await User.findById(userId).select('+savedCampaignIds');
  if (!user) throw new AppError('Account not found', 404, 'USER_NOT_FOUND');

  const storedCampaignIds = [...new Set((user.savedCampaignIds || []).map(String))];
  const campaigns = await Campaign.find({ _id: { $in: storedCampaignIds }, status: 'approved' })
    .select('title location raisedAmount goalAmount')
    .lean();
  const campaignsById = new Map(campaigns.map((campaign) => [String(campaign._id), campaign]));
  const campaignIds = storedCampaignIds.filter((id) => campaignsById.has(id));

  if (campaignIds.length !== (user.savedCampaignIds || []).length) {
    user.savedCampaignIds = campaignIds;
    await user.save();
  }

  return {
    campaignIds,
    campaigns: campaignIds
      .map((id) => campaignsById.get(id))
      .filter(Boolean)
      .map((campaign) => ({
        id: String(campaign._id),
        title: campaign.title,
        location: campaign.location || '',
        raisedAmount: Number(campaign.raisedAmount || 0),
        goalAmount: Number(campaign.goalAmount || 0),
      })),
  };
};

const updateSavedCampaigns = async (userId, campaignIds) => {
  const uniqueIds = [...new Set(campaignIds)];
  const existingCount = await Campaign.countDocuments({ _id: { $in: uniqueIds }, status: 'approved' });
  if (existingCount !== uniqueIds.length) {
    throw new AppError('One or more causes could not be found', 404, 'CAMPAIGN_NOT_FOUND', {
      campaignIds: 'Every saved cause must exist',
    });
  }

  const user = await User.findById(userId).select('+savedCampaignIds');
  if (!user) throw new AppError('Account not found', 404, 'USER_NOT_FOUND');
  user.savedCampaignIds = uniqueIds;
  await user.save();
  return uniqueIds;
};

// "Delete" keeps the record (other people's donations / campaigns may point to it)
// but removes the personal details and frees the phone number.
const deleteAccount = async (userId, password) => {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) throw new AppError('Account not found', 404, 'USER_NOT_FOUND');
  if (['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    throw new AppError('Admin accounts cannot be deleted here', 403, 'FORBIDDEN');
  }

  if (typeof password !== 'string' || !(await bcrypt.compare(password, user.passwordHash || ''))) {
    throw new AppError('Password is incorrect', 401, 'INVALID_CREDENTIALS', {
      password: 'Password is incorrect',
    });
  }

  await User.updateOne(
    { _id: user._id },
    {
      $set: { status: 'deleted', name: 'Deleted user' },
      $unset: { phone: '', email: '', profilePhoto: '', passwordHash: '', savedCampaignIds: '' },
      $inc: { tokenVersion: 1 },
    }
  );
};

// Used by admins (Person 4 can call this from their admin screens).
const setAccountStatus = async (targetId, status, actor) => {
  if (!['active', 'suspended', 'banned'].includes(status)) {
    throw new AppError('Status must be active, suspended or banned', 400, 'VALIDATION_ERROR', {
      status: 'Must be active, suspended or banned',
    });
  }

  const target = await User.findById(targetId);
  if (!target || target.status === 'deleted') throw new AppError('Account not found', 404, 'USER_NOT_FOUND');
  if (String(target._id) === String(actor._id)) {
    throw new AppError('You cannot change your own account status', 403, 'FORBIDDEN');
  }
  const isAdminTarget = ['ADMIN', 'SUPER_ADMIN'].includes(target.role);
  if (isAdminTarget && actor.role !== 'SUPER_ADMIN') {
    throw new AppError('Only a SUPER_ADMIN can change an admin account', 403, 'FORBIDDEN');
  }

  target.status = status;
  if (status !== 'active') target.tokenVersion += 1; // kick them out right away
  await target.save();
  return target;
};

module.exports = {
  getProfile,
  updateProfile,
  getSavedCampaigns,
  updateSavedCampaigns,
  deleteAccount,
  setAccountStatus,
};
