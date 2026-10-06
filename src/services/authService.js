const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Organization = require('../models/Organization');
const AppError = require('../utils/AppError');
const { signToken } = require('./tokenService');
const authConfig = require('../config/auth');

const googleClient = new OAuth2Client();

const assertCanLogin = (user) => {
  if (user.status === 'suspended') {
    throw new AppError('Your account is suspended. Please contact support.', 403, 'ACCOUNT_SUSPENDED');
  }
  if (user.status === 'banned') {
    throw new AppError('Your account has been banned.', 403, 'ACCOUNT_BANNED');
  }
  if (user.status !== 'active') {
    throw new AppError('This account is not available.', 401, 'INVALID_CREDENTIALS');
  }
};

const buildAuthResponse = async (user) => {
  const result = { token: signToken(user), user };
  if (user.role === 'ORGANIZATION') {
    result.organization = await Organization.findOne({ userId: user._id }).select(
      'name verificationStatus reviewNotes'
    );
  }
  return result;
};

const loginWithGoogle = async (credential) => {
  if (!authConfig.googleClientId) {
    throw new AppError('Google sign-in is not configured on the server.', 503, 'GOOGLE_AUTH_NOT_CONFIGURED');
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: authConfig.googleClientId,
    });
    payload = ticket.getPayload();
  } catch {
    throw new AppError('Google could not verify this sign-in. Please try again.', 401, 'INVALID_GOOGLE_CREDENTIAL');
  }

  if (!payload?.sub || !payload.email || payload.email_verified !== true) {
    throw new AppError('A verified Google email is required to sign in.', 401, 'UNVERIFIED_GOOGLE_EMAIL');
  }

  const email = payload.email.trim().toLowerCase();
  let user = await User.findOne({ googleId: payload.sub }).select('+googleId');

  if (user) {
    if (user.email !== email) {
      const emailOwner = await User.findOne({ email });
      if (emailOwner && String(emailOwner._id) !== String(user._id)) {
        throw new AppError('This Google email is already used by another account.', 409, 'EMAIL_TAKEN');
      }
      user.email = email;
      user.emailVerified = true;
      await user.save();
    }
  } else {
    user = await User.findOne({ email }).select('+googleId');
    if (user) {
      if (user.googleId && user.googleId !== payload.sub) {
        throw new AppError('This email is linked to a different Google account.', 409, 'GOOGLE_ACCOUNT_MISMATCH');
      }
      user.googleId = payload.sub;
      user.emailVerified = true;
      if (!user.profilePhoto && payload.picture) user.profilePhoto = payload.picture;
      await user.save();
    } else {
      user = await User.create({
        name: payload.name?.trim() || email.split('@')[0],
        email,
        emailVerified: true,
        googleId: payload.sub,
        profilePhoto: payload.picture,
        role: 'USER',
      });
    }
  }

  assertCanLogin(user);
  return buildAuthResponse(user);
};

const logout = async (userId) => {
  await User.updateOne({ _id: userId }, { $inc: { tokenVersion: 1 } });
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) throw new AppError('Account not found', 404, 'USER_NOT_FOUND');
  if (!user.passwordHash) {
    throw new AppError('This account uses Google sign-in. Manage its password through Google.', 400, 'GOOGLE_ACCOUNT_PASSWORD_MANAGED');
  }

  if (typeof currentPassword !== 'string' || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
    throw new AppError('Current password is incorrect', 401, 'INVALID_CREDENTIALS', {
      currentPassword: 'Current password is incorrect',
    });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  user.tokenVersion += 1;
  await user.save();
  return { token: signToken(user) };
};

module.exports = { loginWithGoogle, logout, changePassword, buildAuthResponse };
