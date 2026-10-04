const mongoose = require('mongoose');

// One document in the "users" collection = one person (or one organization account).
// The PHONE number is the main identity. Email is optional.
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },

    // Saved in one standard form, for example +251912345678.
    // "unique" means no two accounts share a phone.
    // "sparse" lets deleted accounts (which have no phone) exist side by side.
    phone: { type: String, required: true, unique: true, sparse: true, trim: true },

    // Optional. Organizations use their official email here.
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },

    // The scrambled (hashed) password. Never the real password.
    // select:false means queries do NOT return it unless we ask for it.
    passwordHash: { type: String, select: false },

    profilePhoto: { type: String },

    role: {
      type: String,
      enum: ['USER', 'ORGANIZATION', 'ADMIN', 'SUPER_ADMIN'],
      default: 'USER',
      index: true,
    },

    // Only "active" accounts can log in.
    status: {
      type: String,
      enum: ['active', 'suspended', 'banned', 'deleted'],
      default: 'active',
      index: true,
    },

    // true once the person proved they own the phone with a one-time code.
    phoneVerified: { type: Boolean, default: false },

    // Goes up by 1 on logout / password change / suspension.
    // Old login tokens carry the old number, so they stop working.
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// A NEW user must have a password.
// (Only checked for new users, because passwordHash is hidden when we load an existing user.)
userSchema.pre('validate', function () {
  if (this.isNew && !this.passwordHash) {
    this.invalidate('passwordHash', 'A password is required');
  }
});

// Never send private fields to the frontend, even by accident.
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    delete ret.tokenVersion;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
