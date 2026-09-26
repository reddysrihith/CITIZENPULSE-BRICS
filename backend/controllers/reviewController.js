const Review = require('../models/Review');
const User = require('../models/User');
const Payment = require('../models/Payment');
const { createNotification } = require('./notificationController');

// @desc    Add a review
// @route   POST /api/reviews
// @access  Private
exports.addReview = async (req, res, next) => {
  try {
    const { targetUserId, jobId, rating, comment } = req.body;
    const reviewerId = req.user.id;

    if (!targetUserId || !jobId || !rating) {
      return res.status(400).json({ success: false, message: 'Please provide target user, job, and rating' });
    }

    // 1. Fraud Detection: Check if a payment exists between these two users for this job
    // This ensures only people who actually completed a contract can review each other.
    const paymentExists = await Payment.findOne({
      job: jobId,
      status: 'paid',
      $or: [
        { client: reviewerId, freelancer: targetUserId },
        { client: targetUserId, freelancer: reviewerId }
      ]
    });

    if (!paymentExists) {
      return res.status(403).json({ success: false, message: 'Fraud Detection: You can only review users you have completed a paid contract with.' });
    }

    // Check if already reviewed
    const alreadyReviewed = await Review.findOne({
      reviewer: reviewerId,
      reviewee: targetUserId,
      job: jobId
    });

    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this user for this job' });
    }

    const review = await Review.create({
      reviewer: reviewerId,
      reviewee: targetUserId,
      job: jobId,
      rating,
      comment,
      isVerified: true
    });

    // 2. Calculate Weighted Reputation Score
    const allReviews = await Review.find({ reviewee: targetUserId });
    
    // Weighted logic: Recent reviews hold more weight (e.g., within 30 days = 1.2x multiplier)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let totalWeight = 0;
    let weightedSum = 0;

    allReviews.forEach(rev => {
      let weight = 1.0;
      if (rev.createdAt > thirtyDaysAgo) {
        weight = 1.2; // 20% boost for recent reviews
      }
      weightedSum += (rev.rating * weight);
      totalWeight += weight;
    });

    const newAverage = (weightedSum / totalWeight).toFixed(2);

    await User.findByIdAndUpdate(targetUserId, {
      averageRating: newAverage,
      reviewCount: allReviews.length
    });

    await createNotification({
      user: targetUserId,
      title: 'New verified review',
      message: `You received a ${rating}-star review.`,
      type: 'review',
      link: `/profile/${targetUserId}`,
      metadata: { reviewId: review._id, jobId },
    });

    res.status(201).json({ success: true, data: review, message: 'Review submitted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user reviews
// @route   GET /api/reviews/:userId
// @access  Public
exports.getUserReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name profileImage role')
      .populate('job', 'title')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
};
