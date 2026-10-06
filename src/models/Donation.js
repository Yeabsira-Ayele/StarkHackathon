const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  requestedAmount: { type: Number, min: 50 },
  amount: { type: Number, required: true },
  donorName: { type: String, default: 'Anonymous' },
  donorEmail: { type: String, lowercase: true, trim: true },
  bankId: { type: String, trim: true },
  anonymous: { type: Boolean, default: false },
  message: { type: String },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  certificateId: { type: String, unique: true, sparse: true },

  // Set when the donation is verified through links.et
  provider: { type: String },
  // "<provider>:<bank reference>". The unique index makes it impossible to
  // count the same bank receipt twice, even under concurrent requests.
  // (Only the reference is stored, never the receipt URL.)
  receiptKey: { type: String, unique: true, sparse: true },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Donation', donationSchema);