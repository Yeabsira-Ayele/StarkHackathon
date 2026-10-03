const authService = require('../services/authService');
const v = require('../validators/authValidators');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/response');

const signup = async (req, res) => {
  v.validateSignup(req.body);
  const data = await authService.signup(req.body);
  sendSuccess(res, 'Account created. Check your email for a verification code.', data, 201);
};

const login = async (req, res) => {
  v.validateLogin(req.body);
  const data = await authService.login(req.body);
  sendSuccess(res, 'Logged in successfully', data);
};

const google = async (req, res) => {
  const { idToken } = req.body || {};
  if (typeof idToken !== 'string' || !idToken) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', { idToken: 'Google idToken is required' });
  }
  const data = await authService.googleLogin(idToken);
  sendSuccess(res, 'Logged in with Google', data);
};

const logout = async (req, res) => {
  await authService.logout(req.user._id);
  sendSuccess(res, 'Logged out successfully');
};

const verifyEmail = async (req, res) => {
  v.validateEmailAndCode(req.body);
  const user = await authService.verifyEmail(req.body);
  sendSuccess(res, 'Email verified', { user });
};

const resendVerification = async (req, res) => {
  v.validateEmailOnly(req.body);
  const data = await authService.resendVerification(req.body.email);
  sendSuccess(res, 'If this account needs verification, a new code was sent.', data);
};

const forgotPassword = async (req, res) => {
  v.validateEmailOnly(req.body);
  const data = await authService.forgotPassword(req.body.email);
  sendSuccess(res, 'If this email is registered, a reset code was sent.', data);
};

const resetPassword = async (req, res) => {
  v.validateResetPassword(req.body);
  await authService.resetPassword(req.body);
  sendSuccess(res, 'Password changed. Please log in with your new password.');
};

module.exports = { signup, login, google, logout, verifyEmail, resendVerification, forgotPassword, resetPassword };
