const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Organization = require('../models/Organization');
const AppError = require('../utils/AppError');
const { normalizePhone } = require('../utils/phone');

const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('Account not found', 404, 'USER_NOT_FOUND');
  const result = { user };
  if (user.role === 'ORGANIZATION') {
    result.organization = await Organization.findOne({ userId }).select('name verificationStatus reviewNotes');
  }
  return result;
};

const updateProfile = async (userId, { name, phone, profilePhoto }) => {
  const changes = {};
  if (name !== undefined) changes.name = name.trim();
  if (phone !== undefined) changes.phone = phone === '' ? undefined : normalizePhone(phone);
  if (profilePhoto !== undefined) changes.profilePhoto = profilePhoto;

  const user = await User.findById(userId);
  if (!user) throw new AppError('Account not found', 404, 'USER_NOT_FOUND');
  user.set(changes);
  await user.save();
  return user;
};

// "Delete" keeps the record (other people's donations / campaigns may point to it)
// but removes the personal details and frees the email.
const deleteAccount = async (userId, password) => {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) throw new AppError('Account not found', 404, 'USER_NOT_FOUND');
  if (['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    throw new AppError('Admin accounts cannot be deleted here', 403, 'FORBIDDEN');
  }

  if (user.passwordHash) {
    if (typeof password !== 'string' || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new AppError('Password is incorrect', 401, 'INVALID_CREDENTIALS', {
        password: 'Password is incorrect',
      });
    }
  }

  await User.updateOne(
    { _id: user._id },
    {
      $set: { status: 'deleted', name: 'Deleted user', email: `deleted-${user._id}@deleted.invalid` },
      $unset: { googleId: '', phone: '', profilePhoto: '', passwordHash: '' },
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

module.exports = { getProfile, updateProfile, deleteAccount, setAccountStatus };
