const mongoose = require('mongoose');

const DisputeSchema = new mongoose.Schema({
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  proposal: { type: mongoose.Schema.Types.ObjectId, ref: 'Bid' },
  openedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  againstUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reason: { type: String, required: true },
  description: { type: String, default: '' },
  evidence: [{
    title: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now },
  }],
  status: {
    type: String,
    enum: ['open', 'under_review', 'resolved', 'rejected'],
    default: 'open',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  fraudRisk: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low',
  },
  resolution: String,
  adminNotes: String,
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: Date,
}, {
  timestamps: true,
});

DisputeSchema.index({ status: 1, priority: 1 });
DisputeSchema.index({ openedBy: 1, createdAt: -1 });

module.exports = mongoose.model('Dispute', DisputeSchema);
