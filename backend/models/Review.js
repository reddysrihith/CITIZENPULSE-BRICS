const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // who writes the review
  reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // who receives the review
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' }, // optional link to job
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

ReviewSchema.index({ reviewer: 1, reviewee: 1, job: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
