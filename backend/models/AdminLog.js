const mongoose = require('mongoose');

const AdminLogSchema = new mongoose.Schema({
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  targetType: {
    type: String,
    enum: ['User', 'Job', 'Payment', 'Dispute', 'System'],
    default: 'System',
  },
  targetId: mongoose.Schema.Types.ObjectId,
  message: { type: String, required: true },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

AdminLogSchema.index({ admin: 1, createdAt: -1 });
AdminLogSchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model('AdminLog', AdminLogSchema);
