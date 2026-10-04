const mongoose = require('mongoose');
const {
  REPORT_TARGET_TYPES,
  REPORT_REASONS,
  REPORT_STATUSES,
  MAX_REPORT_DETAILS,
} = require('../config/constants');

/**
 * A logged-in user reporting a campaign, user, organization, or donation.
 * Admin review is Person 4's job; this model only stores the report.
 */
const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: REPORT_TARGET_TYPES,
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    reason: {
      type: String,
      enum: REPORT_REASONS,
      required: true,
    },
    details: {
      type: String,
      trim: true,
      maxlength: MAX_REPORT_DETAILS,
    },
    status: {
      type: String,
      enum: REPORT_STATUSES,
      default: 'open',
      index: true,
    },
    adminNote: {
      type: String,
      trim: true,
      maxlength: MAX_REPORT_DETAILS,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// One open report per reporter + target. Resolved reports do not block a new one.
reportSchema.index(
  { reporter: 1, targetType: 1, targetId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'open' },
    name: 'one_open_report_per_reporter_target',
  }
);

module.exports = mongoose.models.Report || mongoose.model('Report', reportSchema);
