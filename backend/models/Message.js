const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    default: '',
    trim: true
  },
  attachments: [{
    name: String,
    url: String,
    type: { type: String },
    size: Number,
    uploadedAt: { type: Date, default: Date.now },
  }],
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for fast conversation lookups
MessageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
MessageSchema.index({ receiver: 1, read: 1 });

module.exports = mongoose.model('Message', MessageSchema);
