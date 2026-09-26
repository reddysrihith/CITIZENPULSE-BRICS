const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  proposal: { type: mongoose.Schema.Types.ObjectId, ref: 'Bid', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: {
    type: String,
    enum: ['created', 'paid', 'released', 'refunded', 'failed'],
    default: 'created',
  },
  razorpayOrderId: { type: String, required: true },
  razorpayPaymentId: String,
  razorpaySignature: String,
  razorpayRefundId: String,
  razorpayTransferId: String,
  refundReason: String,
  releaseNotes: String,
  releasedAt: Date,
  refundedAt: Date,
  failedAt: Date,
  paidAt: Date,
}, {
  timestamps: true,
});

PaymentSchema.index({ proposal: 1, status: 1 });
PaymentSchema.index({ razorpayOrderId: 1 }, { unique: true });

module.exports = mongoose.model('Payment', PaymentSchema);
