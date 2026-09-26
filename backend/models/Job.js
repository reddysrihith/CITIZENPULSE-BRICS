const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, default: 'General' },
  requiredSkills: [{ type: String }], // list of skill names
  skills: [{ type: String }],
  budget: { type: Number },
  budgetMin: { type: Number },
  budgetMax: { type: Number },
  deadline: { type: Date },
  milestones: [{
    title: { type: String, required: true },
    description: { type: String, default: '' },
    amount: { type: Number, default: 0 },
    dueDate: Date,
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'submitted', 'approved', 'paid'],
      default: 'pending',
    },
  }],
  documents: [{
    name: String,
    url: String,
    type: { type: String },
    uploadedAt: { type: Date, default: Date.now },
  }],
  location: {
    city: String,
    country: String
  },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  rejectionReason: String,
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  createdAt: { type: Date, default: Date.now },
});

JobSchema.index({ title: 'text', description: 'text', category: 'text', requiredSkills: 'text' });
JobSchema.index({ category: 1, budget: 1, 'location.city': 1, status: 1 });

module.exports = mongoose.model('Job', JobSchema);
