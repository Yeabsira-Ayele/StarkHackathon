const mongoose = require('mongoose');

const payoutAccountSchema = new mongoose.Schema({
  bankName: { type: String, required: true, trim: true },
  accountNumber: { type: String, required: true, trim: true },
  accountHolderName: { type: String, required: true, trim: true },
  // An admin (Person 4) marks the account as verified.
  verified: { type: Boolean, default: false },
});

const documentSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  url: { type: String, required: true, trim: true },
});

// The organization's details. The login itself lives in the User model (role ORGANIZATION).
const organizationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

    name: { type: String, required: true, trim: true, maxlength: 150 },
    officialEmail: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    organizationType: {
      type: String,
      enum: ['ngo', 'charity', 'community', 'religious', 'school', 'hospital', 'other'],
      required: true,
    },
    location: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    logo: { type: String },

    authorizedRepresentative: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
    },

    verificationDocuments: { type: [documentSchema], default: [] },
    payoutAccounts: { type: [payoutAccountSchema], default: [] },

    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'changes_requested', 'rejected'],
      default: 'pending',
      index: true,
    },
    reviewNotes: { type: String },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Organization', organizationSchema);
