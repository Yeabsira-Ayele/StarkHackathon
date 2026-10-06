const User = require('../models/User');
const AppError = require('../utils/AppError');
const { verifyToken } = require('../services/tokenService');

// The login token is sent by the frontend as:  Authorization: Bearer <token>
const getToken = (req) => {
  const header = req.headers.authorization;
  if (typeof header === 'string' && header.startsWith('Bearer ')) return header.slice(7).trim();
  return null;
};

// Turns a token into the real user from the database, or throws an error.
const loadUser = async (token) => {
  const payload = verifyToken(token);
  const user = await User.findById(payload.sub);

  if (!user || user.status === 'deleted' || user.tokenVersion !== payload.v) {
    throw new AppError('Your session is no longer valid. Please log in again.', 401, 'INVALID_TOKEN');
  }
  if (user.status === 'suspended') {
    throw new AppError('Your account is suspended. Please contact support.', 403, 'ACCOUNT_SUSPENDED');
  }
  if (user.status === 'banned') {
    throw new AppError('Your account has been banned.', 403, 'ACCOUNT_BANNED');
  }
  return user;
};

// Use on routes that need a logged-in user. Sets req.user.
const requireAuth = async (req, res, next) => {
  const token = getToken(req);
  if (!token) throw new AppError('Please log in to continue', 401, 'AUTH_REQUIRED');
  req.user = await loadUser(token);
  next();
};

// Use on routes that guests may also use (for example donating).
// Sets req.user when a valid token is sent. Otherwise continues without a user.
const optionalAuth = async (req, res, next) => {
  const token = getToken(req);
  if (token) {
    try {
      req.user = await loadUser(token);
    } catch (err) {
      req.user = undefined;
    }
  }
  next();
};

module.exports = { requireAuth, optionalAuth };
