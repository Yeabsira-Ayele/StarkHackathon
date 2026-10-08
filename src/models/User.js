const mongoose = require('mongoose');

// One document in the "users" collection = one person (or one organization account).
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },

    phone: { type: String, unique: true, sparse: true, trim: true },

    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    emailVerified: { type: Boolean, default: false },
    googleId: { type: String, unique: true, sparse: true, select: false },

    // The scrambled (hashed) password. Never the real password.
    // select:false means queries do NOT return it unless we ask for it.
    passwordHash: { type: String, select: false },

    profilePhoto: { type: String },
    preferredLanguage: {
      type: String,
      enum: ['am', 'en', 'om'],
      default: 'am',
    },
    savedCampaignIds: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' }],
      default: [],
      select: false,
    },

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

// Google-authenticated users do not need a local password. Organization and
// administrative accounts still use the existing password-based workflows.
userSchema.pre('validate', function () {
  if (this.isNew && this.role !== 'USER' && !this.passwordHash) {
    this.invalidate('passwordHash', 'A password is required');
  }
});

// Never send private fields to the frontend, even by accident.
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    delete ret.googleId;
    delete ret.savedCampaignIds;
    delete ret.tokenVersion;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
