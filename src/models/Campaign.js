const mongoose = require('mongoose');

const updateSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true, trim: true },
  authorName: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

const payoutAccountSchema = new mongoose.Schema({
  bankId: { type: String, required: true, trim: true },
  bankName: { type: String, required: true, trim: true },
  accountNumber: { type: String, required: true, trim: true },
  accountName: { type: String, required: true, trim: true },
}, { _id: false });

const campaignSchema = new mongoose.Schema({
  title: { type: String, required: true },
  story: { type: String, required: true },
  goalAmount: { type: Number, required: true },
  raisedAmount: { type: Number, default: 0 },
  donationsCount: { type: Number, default: 0 },
  creatorName: { type: String, default: 'Anonymous' },
  creatorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  organizationName: { type: String },
  verifiedOrganization: { type: Boolean, default: false },
  category: { type: String, enum: ['medical', 'education', 'emergency', 'business', 'water', 'environment', 'community', 'other'], default: 'other' },
  imageUrl: { type: String },
  location: { type: String },
  impactMetric: { type: String },
  beneficiariesTarget: { type: Number },
  fundraiserData: { type: mongoose.Schema.Types.Mixed },
  payoutAccounts: { type: [payoutAccountSchema], default: [] },
  deleteRequested: { type: Boolean, default: false },
  updates: { type: [updateSchema], default: [] },
  status: { type: String, enum: ['draft', 'pending', 'approved', 'changes_requested', 'rejected', 'paused', 'completed'], default: 'pending', index: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Campaign', campaignSchema);
