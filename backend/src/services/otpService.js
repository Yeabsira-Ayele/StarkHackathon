const crypto = require('crypto');
const OTP = require('../models/OTP');
const authConfig = require('../config/auth');
const AppError = require('../utils/AppError');

const MAX_ATTEMPTS = 5;
const COOLDOWN_SECONDS = 60;

const hashCode = (phone, purpose, code) =>
  crypto.createHmac('sha256', authConfig.jwtSecret).update(`${phone}:${purpose}:${code}`).digest('hex');

// Creates a new 6-digit code for a phone number.
// For now the code is printed in the server console (no SMS provider yet).
// Later, replace the console.log with a real SMS sender.
const createOtp = async (phone, purpose) => {
  const existing = await OTP.findOne({ phone, purpose });
  if (existing && process.env.DISABLE_RATE_LIMIT !== 'true') {
    const secondsAgo = (Date.now() - existing.createdAt.getTime()) / 1000;
    if (secondsAgo < COOLDOWN_SECONDS) {
      throw new AppError(
        `Please wait ${Math.ceil(COOLDOWN_SECONDS - secondsAgo)} seconds before asking for a new code`,
        429,
        'OTP_COOLDOWN'
      );
    }
  }

  await OTP.deleteMany({ phone, purpose });

  const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
  await OTP.create({
    phone,
    purpose,
    codeHash: hashCode(phone, purpose, code),
    expiresAt: new Date(Date.now() + authConfig.otpExpiresMinutes * 60 * 1000),
  });

  console.log(`[OTP] ${purpose} code for ${phone}: ${code}`);
  return authConfig.otpDevEcho ? { devOtp: code } : {};
};

// Checks the code. Throws an error when it is wrong, expired, or tried too many times.
const verifyOtp = async (phone, purpose, code) => {
  const record = await OTP.findOne({ phone, purpose });
  if (!record) {
    throw new AppError('The code is invalid or has expired', 400, 'INVALID_OTP', { otp: 'Invalid or expired code' });
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    await record.deleteOne();
    throw new AppError('Too many wrong attempts. Please request a new code.', 429, 'OTP_LOCKED');
  }

  const expected = Buffer.from(record.codeHash, 'hex');
  const given = Buffer.from(hashCode(phone, purpose, String(code).trim()), 'hex');
  const ok = expected.length === given.length && crypto.timingSafeEqual(expected, given);

  if (!ok) {
    record.attempts += 1;
    await record.save();
    throw new AppError('The code is invalid or has expired', 400, 'INVALID_OTP', { otp: 'Invalid or expired code' });
  }

  await record.deleteOne(); // a code works only once
};

module.exports = { createOtp, verifyOtp };
