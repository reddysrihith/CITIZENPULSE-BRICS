const express = require('express');
const { 
  register, 
  login, 
  verifyEmail,
  forgotPassword, 
  resetPassword,
  getMe,
  generate2FA,
  verify2FA,
  verify2FALogin,
  disable2FA
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const passport = require('passport');

const router = express.Router();

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // Generate JWT token
    const token = require('jsonwebtoken').sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
  }
);

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/2fa/login', verify2FALogin);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resettoken', resetPassword);
router.get('/me', protect, getMe);

// 2FA Routes
router.post('/2fa/generate', protect, generate2FA);
router.post('/2fa/verify', protect, verify2FA);
router.post('/2fa/disable', protect, disable2FA);

module.exports = router;
