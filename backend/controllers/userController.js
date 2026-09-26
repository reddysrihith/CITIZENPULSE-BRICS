const User = require('../models/User');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
      user.skills = req.body.skills || user.skills;
      user.profileImage = req.body.profileImage || user.profileImage;
      user.hourlyRate = req.body.hourlyRate || user.hourlyRate;
      user.username = req.body.username || user.username;
      
      // Professional Profile fields
      user.portfolio = req.body.portfolio || user.portfolio;
      user.resume = req.body.resume || user.resume;
      user.certifications = req.body.certifications || user.certifications;
      user.experience = req.body.experience || user.experience;
      if (req.body.availability !== undefined) {
        user.availability = req.body.availability;
      }

      // Update password if provided
      if (req.body.password) {
        user.password = req.body.password;
      }

      const { updateFreelancerEmbedding } = require('../services/aiMatchingService');
      const updatedUser = await user.save();

      if (updatedUser.role === 'freelancer') {
        updateFreelancerEmbedding(updatedUser._id).catch(err => console.error("Background embedding update failed:", err));
      }

      res.json({
        success: true,
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          bio: updatedUser.bio,
          skills: updatedUser.skills,
          profileImage: updatedUser.profileImage,
          hourlyRate: updatedUser.hourlyRate,
          username: updatedUser.username,
          portfolio: updatedUser.portfolio,
          resume: updatedUser.resume,
          certifications: updatedUser.certifications,
          experience: updatedUser.experience,
          availability: updatedUser.availability,
          isVerified: updatedUser.isVerified
        }
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Get public profile by username or email
// @route   GET /api/users/public/:username
// @access  Public
exports.getPublicProfile = async (req, res, next) => {
  try {
    const identifier = req.params.username;

    // Try to find by username first, fallback to email
    let user = await User.findOne({ username: identifier }).select(
      'name bio skills profileImage portfolio certifications experience location averageRating hourlyRate isVerifiedBadge availability username socialLinks role createdAt'
    );

    if (!user) {
      user = await User.findOne({ email: identifier }).select(
        'name bio skills profileImage portfolio certifications experience location averageRating hourlyRate isVerifiedBadge availability username socialLinks role createdAt'
      );
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

