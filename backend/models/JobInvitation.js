const mongoose = require('mongoose');

const JobInvitationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

JobInvitationSchema.index({ job: 1, freelancer: 1 }, { unique: true });

module.exports = mongoose.model('JobInvitation', JobInvitationSchema);
