const mongoose = require('mongoose');
const {
  IDENTITY_MODES,
  DONATION_STATUSES,
  CURRENCY,
  MAX_MESSAGE_LENGTH,
  MAX_DISPLAY_NAME_LENGTH,
} = require('../config/constants');

/**
 * A donation against a campaign.
 *
 * `amount` is ETB (birr), rounded to 2 decimal places. See src/config/constants.js.
 * `donor` is optional so guests can donate while ALLOW_GUEST_DONATIONS is true.
 */
const donationSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
      index: true,
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    currency: {
      type: String,
      default: CURRENCY,
      uppercase: true,
      trim: true,
    },
    identityMode: {
      type: String,
      enum: IDENTITY_MODES,
      required: true,
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: MAX_DISPLAY_NAME_LENGTH,
    },
    message: {
      type: String,
      trim: true,
      maxlength: MAX_MESSAGE_LENGTH,
    },
    status: {
      type: String,
      enum: DONATION_STATUSES,
      default: 'pending',
      index: true,
    },
    provider: {
      type: String,
      default: 'links.et',
      trim: true,
    },
    txRef: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    providerTransactionId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    paidAt: Date,
    receiptNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    rawProviderPayload: {
      type: mongoose.Schema.Types.Mixed,
      select: false,
    },
  },
  { timestamps: true }
);

donationSchema.index({ campaign: 1, status: 1, createdAt: -1 });
donationSchema.index({ donor: 1, createdAt: -1 });

donationSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.rawProviderPayload;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.models.Donation || mongoose.model('Donation', donationSchema);
