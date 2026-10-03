const crypto = require('crypto');
const OTP = require('../models/OTP');
const authConfig = require('../config/auth');
const AppError = require('../utils/AppError');

const MAX_ATTEMPTS = 5;

const hashCode = (email, purpose, code) =>
  crypto.createHmac('sha256', authConfig.jwtSecret).update(`${email}:${purpose}:${code}`).digest('hex');

// Creates a new 6-digit code. Any older code for the same email + purpose is removed.
// For now the code is printed in the server console (no email provider yet).
// Later, replace the console.log with a real email sender.
const createOtp = async (email, purpose) => {
  await OTP.deleteMany({ email, purpose });

  const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
  await OTP.create({
    email,
    purpose,
    codeHash: hashCode(email, purpose, code),
    expiresAt: new Date(Date.now() + authConfig.otpExpiresMinutes * 60 * 1000),
  });

  console.log(`[OTP] ${purpose} code for ${email}: ${code}`);
  return authConfig.otpDevEcho ? { devOtp: code } : {};
};

// Checks the code. Throws an error when it is wrong, expired, or tried too many times.
const verifyOtp = async (email, purpose, code) => {
  const record = await OTP.findOne({ email, purpose });
  if (!record) {
    throw new AppError('The code is invalid or has expired', 400, 'INVALID_OTP', { code: 'Invalid or expired code' });
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    await record.deleteOne();
    throw new AppError('Too many wrong attempts. Please request a new code.', 429, 'OTP_LOCKED');
  }

  const expected = Buffer.from(record.codeHash, 'hex');
  const given = Buffer.from(hashCode(email, purpose, String(code).trim()), 'hex');
  const ok = expected.length === given.length && crypto.timingSafeEqual(expected, given);

  if (!ok) {
    record.attempts += 1;
    await record.save();
    throw new AppError('The code is invalid or has expired', 400, 'INVALID_OTP', { code: 'Invalid or expired code' });
  }

  await record.deleteOne(); // a code works only once
};

module.exports = { createOtp, verifyOtp };
