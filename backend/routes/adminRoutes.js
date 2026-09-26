const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getStats,
  getUsers,
  updateUserStatus,
  updateFreelancerVerification,
  updateUserRole,
  getGigs,
  updateGigStatus,
  deleteGig,
  getPayments,
  updatePaymentStatus,
  getDisputes,
  createDispute,
  updateDispute,
  getLogs,
  getAnalytics,
} = require('../controllers/adminController');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/analytics', getAnalytics);
router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);
router.patch('/users/:id/verify', updateFreelancerVerification);
router.patch('/users/:id/role', updateUserRole);
router.get('/gigs', getGigs);
router.patch('/gigs/:id/status', updateGigStatus);
router.delete('/gigs/:id', deleteGig);
router.get('/payments', getPayments);
router.patch('/payments/:id/status', updatePaymentStatus);
router.get('/disputes', getDisputes);
router.post('/disputes', createDispute);
router.patch('/disputes/:id', updateDispute);
router.get('/logs', getLogs);

module.exports = router;
