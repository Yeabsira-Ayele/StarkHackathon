const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');
const AppError = require('../utils/AppError');

// A JWT is a signed "ticket". The frontend shows it on every request.
// "sub" = who the user is, "v" = tokenVersion (lets us cancel old tickets).
const signToken = (user) =>
  jwt.sign({ sub: String(user._id), v: user.tokenVersion || 0, role: user.role }, authConfig.jwtSecret, {
    expiresIn: authConfig.jwtExpiresIn,
  });

const verifyToken = (token) => {
  try {
    return jwt.verify(token, authConfig.jwtSecret);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Your session has expired. Please log in again.', 401, 'TOKEN_EXPIRED');
    }
    throw new AppError('Invalid token', 401, 'INVALID_TOKEN');
  }
};

module.exports = { signToken, verifyToken };
