const authService = require('../services/authService');
const v = require('../validators/authValidators');
const { sendSuccess } = require('../utils/response');

// Signup step 1: send a code to the phone
const requestSignupOtp = async (req, res) => {
  v.validateRequestOtp(req.body);
  const data = await authService.requestSignupOtp(req.body.phone);
  sendSuccess(res, 'A verification code was sent to your phone.', data);
};

// Signup step 2: send name + phone + code + password
const signup = async (req, res) => {
  v.validateSignup(req.body);
  const data = await authService.signup(req.body);
  sendSuccess(res, 'Account created successfully', data, 201);
};

const login = async (req, res) => {
  v.validateLogin(req.body);
  const { identifier, phone, email, password } = req.body;
  const data = await authService.login({ identifier: identifier ?? phone ?? email, password });
  sendSuccess(res, 'Logged in successfully', data);
};

const logout = async (req, res) => {
  await authService.logout(req.user._id);
  sendSuccess(res, 'Logged out successfully');
};

const forgotPassword = async (req, res) => {
  v.validateForgotPassword(req.body);
  const data = await authService.forgotPassword(req.body.phone);
  sendSuccess(res, 'If this phone is registered, a reset code was sent.', data);
};

const resetPassword = async (req, res) => {
  v.validateResetPassword(req.body);
  await authService.resetPassword(req.body);
  sendSuccess(res, 'Password changed. Please log in with your new password.');
};

module.exports = { requestSignupOtp, signup, login, logout, forgotPassword, resetPassword };
