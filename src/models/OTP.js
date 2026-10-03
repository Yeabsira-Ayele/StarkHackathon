const mongoose = require('mongoose');

// A short-lived 6-digit code, used to verify an email or reset a password.
// We store only a scrambled version of the code, never the code itself.
const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  purpose: { type: String, enum: ['verify_email', 'reset_password'], required: true },
  codeHash: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  // MongoDB deletes the document automatically when this time passes.
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('OTP', otpSchema);
