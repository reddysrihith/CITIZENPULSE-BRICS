const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');

// Generate Access Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

const generateTwoFactorLoginToken = (id) => {
  return jwt.sign({ id, purpose: '2fa-login' }, process.env.JWT_SECRET, {
    expiresIn: '10m',
  });
};

// Send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
        isVerifiedBadge: user.isVerifiedBadge,
        isSuspended: user.isSuspended,
      },
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    const result = await User.collection.insertOne({
      name,
      email,
      password: hashedPassword,
      role,
      isVerified: true,
      isTwoFactorEnabled: false,
      isSuspended: false,
      refreshTokens: [],
      bio: '',
      skills: [],
      skillEmbedding: [],
      profileImage: '',
      portfolio: [],
      certifications: [],
      experience: [],
      averageRating: 0,
      reviewCount: 0,
      profileViews: 0,
      isVerifiedBadge: false,
      socialLinks: { github: '', linkedin: '', dribbble: '' },
      availability: {
        isAvailable: true,
        workingDays: [],
        workingHours: { start: '09:00', end: '17:00' },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const user = await User.findById(result.insertedId);

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Email OTP
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ 
      email,
      otp,
      otpExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.isSuspended) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended. Contact admin support.' });
    }

    if (user.isTwoFactorEnabled) {
      return res.status(200).json({
        success: true,
        requiresTwoFactor: true,
        twoFactorToken: generateTwoFactorLoginToken(user._id),
        message: 'Enter your authenticator code to continue',
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Complete login for accounts with 2FA enabled
// @route   POST /api/auth/2fa/login
// @access  Public
exports.verify2FALogin = async (req, res, next) => {
  try {
    const speakeasy = require('speakeasy');
    const { twoFactorToken, token } = req.body;

    if (!twoFactorToken || !token) {
      return res.status(400).json({ success: false, message: '2FA token and code are required' });
    }

    const decoded = jwt.verify(twoFactorToken, process.env.JWT_SECRET);

    if (decoded.purpose !== '2fa-login') {
      return res.status(401).json({ success: false, message: 'Invalid 2FA session' });
    }

    const user = await User.findById(decoded.id);

    if (!user || !user.isTwoFactorEnabled || !user.twoFactorSecret) {
      return res.status(401).json({ success: false, message: '2FA is not enabled for this account' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!verified) {
      return res.status(400).json({ success: false, message: 'Invalid 2FA code' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: '2FA session expired. Please sign in again.' });
    }
    next(error);
  }
};

// @desc    Forgot Password (placeholder — logs token in dev)
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    console.log('[DEV] Password reset link:', resetUrl);

    const message = `
      <h1>You have requested a password reset</h1>
      <p>Please click the link below to reset your password. This link will expire in 10 minutes.</p>
      <a href="${resetUrl}" clicktracking="off">${resetUrl}</a>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'SkillSphere Password Reset',
        message,
      });

      res.status(200).json({ success: true, message: 'Email sent' });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    await User.updateOne(
      { _id: user._id },
      {
        password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10)),
        $unset: { passwordResetToken: '', passwordResetExpires: '' },
      }
    );
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate 2FA Secret
// @route   POST /api/auth/2fa/generate
// @access  Private
exports.generate2FA = async (req, res, next) => {
  try {
    const speakeasy = require('speakeasy');
    const qrcode = require('qrcode');
    
    const user = await User.findById(req.user.id);
    
    const secret = speakeasy.generateSecret({
      name: `SkillSphere (${user.email})`
    });

    user.twoFactorSecret = secret.base32;
    await user.save();

    qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) return res.status(500).json({ success: false, message: 'Error generating QR code' });
      res.status(200).json({ success: true, qrCode: data_url, secret: secret.base32 });
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify and Enable 2FA
// @route   POST /api/auth/2fa/verify
// @access  Private
exports.verify2FA = async (req, res, next) => {
  try {
    const speakeasy = require('speakeasy');
    const { token } = req.body;
    
    const user = await User.findById(req.user.id);
    
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1
    });

    if (verified) {
      user.isTwoFactorEnabled = true;
      await user.save();
      return res.status(200).json({
        success: true,
        message: '2FA enabled successfully',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          isTwoFactorEnabled: user.isTwoFactorEnabled,
        },
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid 2FA token' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Disable 2FA
// @route   POST /api/auth/2fa/disable
// @access  Private
exports.disable2FA = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    user.twoFactorSecret = undefined;
    user.isTwoFactorEnabled = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: '2FA disabled successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
      },
    });
  } catch (error) {
    next(error);
  }
};
