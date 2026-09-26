const crypto = require('crypto');
const Razorpay = require('razorpay');
const Bid = require('../models/Bid');
const Job = require('../models/Job');
const Payment = require('../models/Payment');
const { createNotification } = require('./notificationController');

const getRazorpayClient = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay keys are not configured');
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// @desc    Create Razorpay order for an accepted proposal
// @route   POST /api/payments/create-order
// @access  Private (client)
exports.createOrder = async (req, res, next) => {
  try {
    const { proposalId } = req.body;

    const proposal = await Bid.findById(proposalId).populate('freelancer', 'name email');
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    if (proposal.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Accept the proposal before starting payment' });
    }

    const job = await Job.findById(proposal.job);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const existingPaid = await Payment.findOne({ proposal: proposal._id, status: { $in: ['paid', 'released'] } });
    if (existingPaid) {
      return res.status(400).json({ success: false, message: 'This proposal has already been paid' });
    }

    const amount = Number(proposal.amount);
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Proposal amount is invalid' });
    }

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `proposal_${proposal._id.toString().slice(-20)}`,
      notes: {
        jobId: job._id.toString(),
        proposalId: proposal._id.toString(),
        clientId: req.user.id,
        freelancerId: proposal.freelancer._id.toString(),
      },
    });

    const payment = await Payment.create({
      job: job._id,
      proposal: proposal._id,
      client: req.user.id,
      freelancer: proposal.freelancer._id,
      amount,
      currency: 'INR',
      status: 'created',
      razorpayOrderId: order.id,
    });

    res.status(201).json({
      success: true,
      keyId: process.env.RAZORPAY_KEY_ID,
      order,
      payment,
      freelancer: proposal.freelancer,
      job: {
        _id: job._id,
        title: job.title,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/payments/verify
// @access  Private (client)
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing Razorpay verification fields' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        status: 'paid',
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paidAt: new Date(),
      },
      { new: true }
    ).populate('job', 'title').populate('freelancer', 'name email');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    // Update the proposal (Bid) status to paid
    await Bid.findByIdAndUpdate(payment.proposal, { status: 'paid' });

    await createNotification({
      user: payment.freelancer._id,
      title: 'Payment received',
      message: `Payment for "${payment.job.title}" has been verified and added to escrow.`,
      type: 'payment',
      link: '/transactions',
      metadata: { paymentId: payment._id, jobId: payment.job._id },
    });

    res.status(200).json({ success: true, message: 'Payment verified successfully', data: payment });
  } catch (err) {
    next(err);
  }
};

// @desc    Get transactions for current user
// @route   GET /api/payments/my-transactions
// @access  Private
exports.getMyTransactions = async (req, res, next) => {
  try {
    const query = req.user.role === 'client'
      ? { client: req.user.id }
      : req.user.role === 'freelancer'
        ? { freelancer: req.user.id }
        : {};

    const payments = await Payment.find(query)
      .populate('job', 'title category')
      .populate('proposal', 'amount status')
      .populate('client', 'name email')
      .populate('freelancer', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (err) {
    next(err);
  }
};

// @desc    Release escrow/payment to freelancer record
// @route   POST /api/payments/:id/release
// @access  Private (admin)
exports.releasePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('job', 'title')
      .populate('freelancer', 'name email');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (!['paid', 'released'].includes(payment.status)) {
      return res.status(400).json({ success: false, message: 'Only paid payments can be released' });
    }

    payment.status = 'released';
    payment.releasedAt = new Date();
    payment.releaseNotes = req.body.releaseNotes || 'Released by admin';

    // Razorpay Route transfer can be plugged here when linked account IDs are configured.
    if (process.env.RAZORPAY_ROUTE_ENABLED === 'true') {
      payment.razorpayTransferId = req.body.transferId || `manual_release_${Date.now()}`;
    }

    await payment.save();
    await createNotification({
      user: payment.freelancer._id,
      title: 'Payment released',
      message: `Payment for "${payment.job.title}" has been released.`,
      type: 'payment',
      link: '/transactions',
      metadata: { paymentId: payment._id },
    });

    res.status(200).json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};

// @desc    Refund a Razorpay payment
// @route   POST /api/payments/:id/refund
// @access  Private (admin)
exports.refundPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('job', 'title');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (!payment.razorpayPaymentId && process.env.RAZORPAY_REFUNDS_ENABLED === 'true') {
      return res.status(400).json({ success: false, message: 'Razorpay payment ID is required for live refund' });
    }

    if (process.env.RAZORPAY_REFUNDS_ENABLED === 'true') {
      const razorpay = getRazorpayClient();
      const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
        amount: req.body.amount ? Math.round(Number(req.body.amount) * 100) : undefined,
        notes: {
          reason: req.body.reason || 'Refunded by admin',
          paymentRecordId: payment._id.toString(),
        },
      });
      payment.razorpayRefundId = refund.id;
    }

    payment.status = 'refunded';
    payment.refundReason = req.body.reason || 'Refunded by admin';
    payment.refundedAt = new Date();
    await payment.save();

    await createNotification({
      user: payment.client,
      title: 'Payment refunded',
      message: `Refund has been recorded for "${payment.job.title}".`,
      type: 'payment',
      link: '/transactions',
      metadata: { paymentId: payment._id },
    });

    res.status(200).json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};
