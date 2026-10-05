const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Organization = require('../models/Organization');
const AppError = require('../utils/AppError');
const { normalizePhone } = require('../utils/phone');
const { signToken } = require('./tokenService');
const { createOtp, verifyOtp } = require('./otpService');

// Blocks suspended / banned / deleted accounts.
const assertCanLogin = (user) => {
  if (user.status === 'suspended') {
    throw new AppError('Your account is suspended. Please contact support.', 403, 'ACCOUNT_SUSPENDED');
  }
  if (user.status === 'banned') {
    throw new AppError('Your account has been banned.', 403, 'ACCOUNT_BANNED');
  }
  if (user.status !== 'active') {
    throw new AppError('Invalid phone number or password', 401, 'INVALID_CREDENTIALS');
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

const phoneTaken = () =>
  new AppError('This phone number is already registered', 409, 'PHONE_TAKEN', {
    phone: 'This phone number is already registered',
  });

// Signup, step 1: send a 6-digit code to the phone.
const requestSignupOtp = async (phone) => {
  phone = normalizePhone(phone);
  if (await User.findOne({ phone })) throw phoneTaken();
  return createOtp(phone, 'signup');
};

// Signup, step 2: check the code, then create the account.
const signup = async ({ name, email, phone, otp, password }) => {
  phone = normalizePhone(phone);
  if (await User.findOne({ phone })) throw phoneTaken();

  const normalizedEmail = email ? email.trim().toLowerCase() : undefined;
  if (normalizedEmail && await User.findOne({ email: normalizedEmail })) {
    throw new AppError('This email is already registered', 409, 'EMAIL_TAKEN', {
      email: 'This email is already registered',
    });
  }

  await verifyOtp(phone, 'signup', otp);

  const user = await User.create({
    name: name.trim(),
    ...(normalizedEmail ? { email: normalizedEmail } : {}),
    phone,
    phoneVerified: true,
    passwordHash: await bcrypt.hash(password, 12),
  });
  return buildAuthResponse(user);
};

// People can log in with their phone number (or the email saved on their account).
const findByIdentifier = (identifier) => {
  const value = String(identifier).trim();
  const query = value.includes('@') ? { email: value.toLowerCase() } : { phone: normalizePhone(value) };
  return User.findOne(query).select('+passwordHash');
};

const login = async ({ identifier, password }) => {
  const user = await findByIdentifier(identifier);

  // Same message for "no such user" and "wrong password" on purpose,
  // so nobody can discover which phones are registered.
  const invalid = new AppError('Invalid phone number or password', 401, 'INVALID_CREDENTIALS');
  if (!user || !user.passwordHash) throw invalid;
  if (!(await bcrypt.compare(password, user.passwordHash))) throw invalid;

  assertCanLogin(user);
  return buildAuthResponse(user);
};

// Logout: raising tokenVersion cancels every ticket that was issued before.
const logout = async (userId) => {
  await User.updateOne({ _id: userId }, { $inc: { tokenVersion: 1 } });
};

// Always looks successful, so nobody can use it to find out which phones exist.
const forgotPassword = async (phone) => {
  phone = normalizePhone(phone);
  const user = await User.findOne({ phone });
  if (user && user.status === 'active') {
    return createOtp(phone, 'reset_password');
  }
  return {};
};

const resetPassword = async ({ phone, otp, newPassword }) => {
  phone = normalizePhone(phone);
  await verifyOtp(phone, 'reset_password', otp);
  const user = await User.findOne({ phone });
  if (!user || user.status !== 'active') throw new AppError('Account not found', 404, 'USER_NOT_FOUND');

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  user.phoneVerified = true; // they proved they own this phone
  user.tokenVersion += 1; // log out everywhere
  await user.save();
};

// Logged-in user changes their password. Returns a fresh token (old ones stop working).
const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) throw new AppError('Account not found', 404, 'USER_NOT_FOUND');

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

module.exports = {
  requestSignupOtp,
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  buildAuthResponse,
};
