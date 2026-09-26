const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { addReview, getUserReviews } = require('../controllers/reviewController');

const router = express.Router();

router.post('/', protect, addReview);
router.get('/:userId', getUserReviews);

module.exports = router;
