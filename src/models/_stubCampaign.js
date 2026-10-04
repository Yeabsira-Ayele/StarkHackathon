const mongoose = require('mongoose');

/**
 * TEMP STUB: delete this file on merge with Person 2's Campaign model.
 *
 * Registered only when mongoose.models.Campaign is missing.
 * `story` is optional so search can match title/story the way Person 2's model does.
 * `completedAt` is set by campaignCompletion.service when the goal is reached.
 * Person 2's Campaign already has both fields.
 */
const stubCampaignSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, maxlength: 120 },
    story: { type: String, trim: true, maxlength: 10000 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    location: { type: String, trim: true, maxlength: 120 },
    goalAmount: { type: Number, min: 1 },
    raisedAmount: { type: Number, default: 0, min: 0 },
    deadline: Date,
    status: {
      type: String,
      enum: ['draft', 'published', 'completed'],
      default: 'draft',
    },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'verified'],
      default: 'unverified',
    },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    completedAt: Date,
  },
  { timestamps: true }
);

stubCampaignSchema.index({ title: 'text', story: 'text' });
stubCampaignSchema.index({ status: 1, createdAt: -1 });

if (mongoose.models.Campaign) {
  module.exports = mongoose.models.Campaign;
} else {
  module.exports = mongoose.model('Campaign', stubCampaignSchema);
}
