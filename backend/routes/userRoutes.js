const express = require('express');
const { updateProfile, getUsers, getPublicProfile } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public route — no auth required
router.get('/public/:username', getPublicProfile);

router.put('/profile', protect, updateProfile);

// Admin route (mounted at /api/admin/users in server.js, but handled here for simplicity or we can match exactly)
router.get('/', protect, authorize('admin'), getUsers);

module.exports = router;

