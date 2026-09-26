const mongoose = require('mongoose');

const TrendingSkillSchema = new mongoose.Schema({
  skillName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  count: {
    type: Number,
    default: 0
  },
  growthPercent: {
    type: Number,
    default: 0
  },
  tag: {
    type: String,
    enum: ['🔥 Hot', '📈 Rising', '✅ Stable', '📉 Declining'],
    default: '✅ Stable'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TrendingSkill', TrendingSkillSchema);
