const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Organization = require('../models/Organization');
const authConfig = require('../config/auth');
const AppError = require('../utils/AppError');
const { normalizePhone } = require('../utils/phone');
const { signToken } = require('./tokenService');
const { createOtp, verifyOtp } = require('./otpService');

const normalizeEmail = (email) => String(email).trim().toLowerCase();

// Blocks suspended / banned / deleted accounts.
const assertCanLogin = (user) => {
  if (user.status === 'suspended') {
    throw new AppError('Your account is suspended. Please contact support.', 403, 'ACCOUNT_SUSPENDED');
  }
  if (user.status === 'banned') {
    throw new AppError('Your account has been banned.', 403, 'ACCOUNT_BANNED');
  }
  if (user.status !== 'active') {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }
};

// What the frontend receives after signup / login: the token, the user,
// and (for organizations) the verification status.
const buildAuthResponse = async (user) => {
  const result = { token: signToken(user), user };
  if (user.role === 'ORGANIZATION') {
    result.organization = await Organization.findOne({ userId: user._id }).select(
      'name verificationStatus reviewNotes'
    );
  }
  return result;
};

const signup = async ({ name, email, password, phone }) => {
  email = normalizeEmail(email);
  if (await User.findOne({ email })) {
    throw new AppError('This email is already registered', 409, 'EMAIL_TAKEN', {
      email: 'This email is already registered',
    });
  }

  const user = await User.create({
    name: name.trim(),
    email,
    phone: phone ? normalizePhone(phone) : undefined,
    passwordHash: await bcrypt.hash(password, 12),
  });

  const otp = await createOtp(email, 'verify_email');
  return { ...(await buildAuthResponse(user)), ...otp };
};

const login = async ({ email, password }) => {
  email = normalizeEmail(email);
  const user = await User.findOne({ email }).select('+passwordHash');

  // Same message for "no such user" and "wrong password" on purpose,
  // so nobody can discover which emails are registered.
  const invalid = new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  if (!user || !user.passwordHash) throw invalid;
  if (!(await bcrypt.compare(password, user.passwordHash))) throw invalid;

  assertCanLogin(user);
  return buildAuthResponse(user);
};

// Sign in with Google. The frontend sends Google's "idToken"; we ask Google to confirm it.
const googleLogin = async (idToken) => {
  if (!authConfig.googleClientId) {
    throw new AppError('Google login is not configured', 503, 'GOOGLE_NOT_CONFIGURED');
  }

  let OAuth2Client;
  try {
    ({ OAuth2Client } = require('google-auth-library'));
  } catch (err) {
    throw new AppError('Google login is not installed on the server', 503, 'GOOGLE_NOT_CONFIGURED');
  }

  let payload;
  try {
    const client = new OAuth2Client(authConfig.googleClientId);
    const ticket = await client.verifyIdToken({ idToken, audience: authConfig.googleClientId });
    payload = ticket.getPayload();
  } catch (err) {
    throw new AppError('Google sign-in failed', 401, 'GOOGLE_AUTH_FAILED');
  }

  if (!payload || !payload.email || !payload.email_verified) {
    throw new AppError('Your Google email is not verified', 401, 'GOOGLE_AUTH_FAILED');
  }

  const email = normalizeEmail(payload.email);
  let user = await User.findOne({ $or: [{ googleId: payload.sub }, { email }] });

  if (!user) {
    user = await User.create({
      name: payload.name || email.split('@')[0],
      email,
      googleId: payload.sub,
      profilePhoto: payload.picture,
      emailVerified: true,
    });
  } else {
    assertCanLogin(user);
    if (!user.googleId) user.googleId = payload.sub; // link Google to the existing account
    if (!user.profilePhoto && payload.picture) user.profilePhoto = payload.picture;
    user.emailVerified = true;
    await user.save();
  }

  assertCanLogin(user);
  return buildAuthResponse(user);
};

// Logout: raising tokenVersion cancels every ticket that was issued before.
const logout = async (userId) => {
  await User.updateOne({ _id: userId }, { $inc: { tokenVersion: 1 } });
};

const verifyEmail = async ({ email, code }) => {
  email = normalizeEmail(email);
  await verifyOtp(email, 'verify_email', code);
  const user = await User.findOneAndUpdate({ email }, { emailVerified: true }, { new: true });
  if (!user) throw new AppError('Account not found', 404, 'USER_NOT_FOUND');
  return user;
};

// Always looks successful, so nobody can use it to find out which emails exist.
const resendVerification = async (email) => {
  email = normalizeEmail(email);
  const user = await User.findOne({ email });
  if (user && user.status === 'active' && !user.emailVerified) {
    return createOtp(email, 'verify_email');
  }
  return {};
};

const forgotPassword = async (email) => {
  email = normalizeEmail(email);
  const user = await User.findOne({ email });
  if (user && user.status === 'active') {
    return createOtp(email, 'reset_password');
  }
  return {};
};

const resetPassword = async ({ email, code, newPassword }) => {
  email = normalizeEmail(email);
  await verifyOtp(email, 'reset_password', code);
  const user = await User.findOne({ email });
  if (!user || user.status !== 'active') throw new AppError('Account not found', 404, 'USER_NOT_FOUND');

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  user.emailVerified = true; // they proved they own this email
  user.tokenVersion += 1; // log out everywhere
  await user.save();
};

// Logged-in user changes their password. Returns a fresh token (old ones stop working).
const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) throw new AppError('Account not found', 404, 'USER_NOT_FOUND');

  // Google-only accounts have no password yet, so no current password is needed.
  if (user.passwordHash) {
    if (typeof currentPassword !== 'string' || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
      throw new AppError('Current password is incorrect', 401, 'INVALID_CREDENTIALS', {
        currentPassword: 'Current password is incorrect',
      });
    }
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  user.tokenVersion += 1;
  await user.save();
  return { token: signToken(user) };
};

module.exports = {
  signup,
  login,
  googleLogin,
  logout,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  changePassword,
  buildAuthResponse,
  normalizeEmail,
};
