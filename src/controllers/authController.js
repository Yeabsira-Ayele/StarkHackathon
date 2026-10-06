const authService = require('../services/authService');
const { sendSuccess } = require('../utils/response');
const AppError = require('../utils/AppError');

const loginWithGoogle = async (req, res) => {
  const { credential } = req.body || {};
  if (typeof credential !== 'string' || credential.length === 0 || credential.length > 8192) {
    throw new AppError('A valid Google credential is required.', 400, 'INVALID_GOOGLE_CREDENTIAL');
  }
  const data = await authService.loginWithGoogle(credential);
  sendSuccess(res, 'Signed in with Google successfully.', data);
};

const logout = async (req, res) => {
  await authService.logout(req.user._id);
  sendSuccess(res, 'Logged out successfully');
};

module.exports = { loginWithGoogle, logout };
