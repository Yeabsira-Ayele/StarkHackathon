const mongoose = require('mongoose');
const userService = require('../services/userService');
const authService = require('../services/authService');
const v = require('../validators/authValidators');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/response');

const getMe = async (req, res) => {
  const data = await userService.getProfile(req.user._id);
  sendSuccess(res, 'Profile loaded', data);
};

const updateMe = async (req, res) => {
  v.validateProfileUpdate(req.body);
  const user = await userService.updateProfile(req.user._id, req.body);
  sendSuccess(res, 'Profile updated', { user });
};

const changePassword = async (req, res) => {
  v.validateChangePassword(req.body);
  const data = await authService.changePassword(req.user._id, req.body);
  sendSuccess(res, 'Password changed', data);
};

const deleteMe = async (req, res) => {
  await userService.deleteAccount(req.user._id, (req.body || {}).password);
  sendSuccess(res, 'Account deleted');
};

// Admin only: suspend / ban / reactivate an account.
const setStatus = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new AppError('Account not found', 404, 'USER_NOT_FOUND');
  }
  const user = await userService.setAccountStatus(req.params.id, (req.body || {}).status, req.user);
  sendSuccess(res, `Account is now ${user.status}`, { user });
};

module.exports = { getMe, updateMe, changePassword, deleteMe, setStatus };
