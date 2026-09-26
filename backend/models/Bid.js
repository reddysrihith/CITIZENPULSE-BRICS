// Bid model for freelancer bidding on jobs
const mongoose = require('mongoose');

const BidSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  proposal: { type: String },
  estimatedTime: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'paid'], default: 'pending' },
  progress: { type: Number, default: 0 },
  submissionNotes: { type: String, default: '' },
  submissionLink: { type: String, default: '' },
  progressLogs: [{
    note: String,
    progress: Number,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
  }],
  attachments: [{
    name: String,
    url: String,
    type: { type: String },
    uploadedAt: { type: Date, default: Date.now },
  }],
  deadlineReminderAt: Date,
  createdAt: { type: Date, default: Date.now },
});

BidSchema.index({ job: 1, freelancer: 1 }, { unique: true });

module.exports = mongoose.model('Bid', BidSchema);
