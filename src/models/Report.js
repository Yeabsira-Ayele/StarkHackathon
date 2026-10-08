const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true, index: true },
    category: {
      type: String,
      enum: ['False Information', 'Fraud / Scam', 'Misleading Content', 'Other'],
      required: true,
    },
    details: { type: String, required: true, trim: true, maxlength: 2000 },
    evidence: {
      type: [{ type: String, trim: true, maxlength: 2048 }],
      default: [],
      validate: {
        validator: (items) => items.length <= 10,
        message: 'A report can include at most 10 evidence links',
      },
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending',
      index: true,
    },
    resolutionNote: { type: String, trim: true, maxlength: 1000 },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
