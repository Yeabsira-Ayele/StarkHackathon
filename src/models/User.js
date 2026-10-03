const mongoose = require('mongoose');

// One document in the "users" collection = one person (or one organization account).
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },

    // Used to log in. "unique" means no two users can share an email.
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // The scrambled (hashed) password. Empty for people who only use Google.
    // select:false means queries do NOT return it unless we ask for it.
    passwordHash: { type: String, select: false },

    // Google's ID for this person. Only set for Google sign-ins.
    googleId: { type: String, unique: true, sparse: true },

    profilePhoto: { type: String },

    // The workflow guide says phone is collected later, only when needed.
    phone: { type: String, trim: true },

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

    emailVerified: { type: Boolean, default: false },

    // Goes up by 1 on logout / password change / suspension.
    // Old login tokens carry the old number, so they stop working.
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// A NEW user must be able to log in somehow: a password or Google.
// (Only checked for new users, because passwordHash is hidden when we load an existing user.)
userSchema.pre('validate', function () {
  if (this.isNew && !this.passwordHash && !this.googleId) {
    this.invalidate('passwordHash', 'A password or a Google account is required');
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