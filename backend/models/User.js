const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false // Don't return password by default
  },
  role: {
    type: String,
    enum: ['client', 'freelancer', 'admin'],
    default: 'client'
  },
  // Auth & Verification
  isVerified: {
    type: Boolean,
    default: true
  },
  otp: String,
  otpExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  twoFactorSecret: String,
  isTwoFactorEnabled: {
    type: Boolean,
    default: false
  },
  isSuspended: {
    type: Boolean,
    default: false
  },
  suspendedAt: Date,
  refreshTokens: [String],
  googleId: String,

  // Professional Profile
  bio: {
    type: String,
    default: ''
  },
  skills: [{
    name: String,
    proficiency: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Expert'],
      default: 'Beginner'
    }
  }],
  skillEmbedding: {
    type: [Number],
    default: []
  },
  profileImage: {
    type: String,
    default: ''
  },
  portfolio: [{
    title: String,
    description: String,
    imageUrl: String,
    link: String
  }],
  resume: String, // Cloudinary URL
  certifications: [{
    name: String,
    issuer: String,
    date: Date
  }],
  experience: [{
    company: String,
    role: String,
    duration: String,
    description: String
  }],
  location: {
    city: String,
    country: String
  },
  averageRating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  profileViews: {
    type: Number,
    default: 0
  },
  hourlyRate: Number,
  milestoneRate: Number,
  isVerifiedBadge: {
    type: Boolean,
    default: false
  },
  availability: {
    isAvailable: { type: Boolean, default: true },
    workingDays: [{ type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] }],
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' }
    }
  },
  username: {
    type: String,
    unique: true,
    sparse: true
  },
  socialLinks: {
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    dribbble: { type: String, default: '' }
  }
}, {
  timestamps: true
});

// Encrypt password using bcrypt
UserSchema.pre('save', function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = bcrypt.genSaltSync(10);
  this.password = bcrypt.hashSync(this.password, salt);
  next();
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
