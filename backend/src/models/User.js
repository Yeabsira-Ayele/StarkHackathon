const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    emailOrPhone: { type: String, required: true, trim: true },
    normalizedIdentity: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['donor', 'foundation'], default: 'donor', required: true },
    organizationName: { type: String, trim: true, maxlength: 200 },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

userSchema.methods.verifyPassword = function verifyPassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.statics.hashPassword = function hashPassword(password) {
  return bcrypt.hash(password, 12);
};

module.exports = mongoose.model('User', userSchema);