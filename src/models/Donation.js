const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  amount: { type: Number, required: true },
  donorName: { type: String, default: 'Anonymous' },
  message: { type: String },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },

  // Set when the donation is verified through links.et
  provider: { type: String },
  // "<provider>:<bank reference>". The unique index makes it impossible to
  // count the same bank receipt twice, even under concurrent requests.
  // (Only the reference is stored, never the receipt URL.)
  receiptKey: { type: String, unique: true, sparse: true },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Donation', donationSchema);