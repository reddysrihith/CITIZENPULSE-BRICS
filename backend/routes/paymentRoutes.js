const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createOrder,
  verifyPayment,
  getMyTransactions,
  releasePayment,
  refundPayment,
} = require('../controllers/paymentController');

const router = express.Router();

router.post('/create-order', protect, authorize('client'), createOrder);
router.post('/verify', protect, authorize('client'), verifyPayment);
router.get('/my-transactions', protect, getMyTransactions);
router.post('/:id/release', protect, authorize('admin'), releasePayment);
router.post('/:id/refund', protect, authorize('admin'), refundPayment);

module.exports = router;
