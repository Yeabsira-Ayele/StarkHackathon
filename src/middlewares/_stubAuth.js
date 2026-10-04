const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

/**
 * TEMP STUB: replace with Person 1's auth middleware on merge.
 *
 * Decodes a Bearer JWT signed with JWT_SECRET (HS256) and sets
 * `req.user = { _id, role }`. This file is the only stub implementation.
 * `src/middlewares/auth.js` re-exports it so the swap is a one-line change.
 */

/**
 * @param {object} payload
 * @returns {{ _id: string, role: string } | null}
 */
function userFromPayload(payload) {
  if (!payload || typeof payload !== 'object') return null;
  const id = payload.sub || payload._id || payload.id || payload.userId;
  if (!id) return null;
  return {
    _id: String(id),
    role: payload.role ? String(payload.role) : 'user',
  };
}

/**
 * @param {import('express').Request} req
 * @returns {string | null}
 */
function readBearer(req) {
  const header = req.headers.authorization || '';
  if (typeof header !== 'string') return null;
  if (!header.startsWith('Bearer ')) return null;
  const token = header.slice(7).trim();
  return token || null;
}

/**
 * @param {string} token
 */
function verifyToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError('Authentication is not configured', 500, 'AUTH_NOT_CONFIGURED');
  }
  try {
    return jwt.verify(token, secret, { algorithms: ['HS256'] });
  } catch {
    throw new AppError('Invalid or expired token', 401, 'AUTH_INVALID');
  }
}

/**
 * Requires a valid Bearer token.
 * @type {import('express').RequestHandler}
 */
function requireAuth(req, res, next) {
  try {
    const token = readBearer(req);
    if (!token) {
      next(new AppError('Authentication required', 401, 'AUTH_REQUIRED'));
      return;
    }
    const user = userFromPayload(verifyToken(token));
    if (!user) {
      next(new AppError('Invalid or expired token', 401, 'AUTH_INVALID'));
      return;
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Sets `req.user` when a Bearer token is present.
 * A missing header continues as a guest. A present but invalid token is rejected
 * so a bad token is not silently treated as a guest donation.
 * @type {import('express').RequestHandler}
 */
function optionalAuth(req, res, next) {
  try {
    const token = readBearer(req);
    if (!token) {
      next();
      return;
    }
    const user = userFromPayload(verifyToken(token));
    if (!user) {
      next(new AppError('Invalid or expired token', 401, 'AUTH_INVALID'));
      return;
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  requireAuth,
  optionalAuth,
};
