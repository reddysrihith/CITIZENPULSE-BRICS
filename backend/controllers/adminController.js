const User = require('../models/User');
const Job = require('../models/Job');
const Bid = require('../models/Bid');
const Payment = require('../models/Payment');
const Dispute = require('../models/Dispute');
const AdminLog = require('../models/AdminLog');

const logAdminAction = async (req, action, targetType, targetId, message, metadata = {}) => {
  await AdminLog.create({
    admin: req.user.id,
    action,
    targetType,
    targetId,
    message,
    metadata,
  });
};

exports.getStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalClients,
      totalFreelancers,
      totalAdmins,
      suspendedUsers,
      verifiedFreelancers,
      totalGigs,
      pendingGigs,
      approvedGigs,
      rejectedGigs,
      totalProposals,
      acceptedProposals,
      paidProposals,
      totalDisputes,
      openDisputes,
      highRiskDisputes,
      paymentStats,
      topCategories,
      recentLogs,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'client' }),
      User.countDocuments({ role: 'freelancer' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ isSuspended: true }),
      User.countDocuments({ role: 'freelancer', isVerifiedBadge: true }),
      Job.countDocuments(),
      Job.countDocuments({ status: 'pending' }),
      Job.countDocuments({ $or: [{ status: 'approved' }, { status: { $exists: false } }] }),
      Job.countDocuments({ status: 'rejected' }),
      Bid.countDocuments(),
      Bid.countDocuments({ status: 'accepted' }),
      Bid.countDocuments({ status: 'paid' }),
      Dispute.countDocuments(),
      Dispute.countDocuments({ status: { $in: ['open', 'under_review'] } }),
      Dispute.countDocuments({ fraudRisk: 'high', status: { $ne: 'resolved' } }),
      Payment.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            amount: { $sum: '$amount' },
          },
        },
      ]),
      Job.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      AdminLog.find().populate('admin', 'name email').sort({ createdAt: -1 }).limit(6).lean(),
    ]);

    const paymentsByStatus = paymentStats.reduce((acc, item) => {
      acc[item._id] = { count: item.count, amount: item.amount };
      return acc;
    }, {});

    const paidAmount = paymentsByStatus.paid?.amount || 0;
    const releasedAmount = paymentsByStatus.released?.amount || 0;
    const refundedAmount = paymentsByStatus.refunded?.amount || 0;
    const platformRevenue = Math.max(0, Math.round((paidAmount + releasedAmount - refundedAmount) * 0.1));

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          clients: totalClients,
          freelancers: totalFreelancers,
          admins: totalAdmins,
          suspended: suspendedUsers,
          verifiedFreelancers,
        },
        gigs: {
          total: totalGigs,
          pending: pendingGigs,
          approved: approvedGigs,
          rejected: rejectedGigs,
        },
        proposals: {
          total: totalProposals,
          accepted: acceptedProposals,
          paid: paidProposals,
          successRate: totalProposals ? Math.round((paidProposals / totalProposals) * 100) : 0,
        },
        payments: {
          total: paymentStats.reduce((sum, item) => sum + item.count, 0),
          amount: paymentStats.reduce((sum, item) => sum + item.amount, 0),
          platformRevenue,
          byStatus: paymentsByStatus,
        },
        disputes: {
          total: totalDisputes,
          open: openDisputes,
          highRisk: highRiskDisputes,
        },
        topCategories,
        recentLogs,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const since = new Date();
    since.setMonth(since.getMonth() - 6);

    const [monthlyPayments, categoryStats, roleStats, paymentStatusStats, gigStatusStats] = await Promise.all([
      Payment.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            amount: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      Job.aggregate([
        { $group: { _id: '$category', gigs: { $sum: 1 }, budget: { $sum: '$budget' } } },
        { $sort: { gigs: -1 } },
      ]),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      Payment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$amount' } } }]),
      Job.aggregate([{ $group: { _id: { $ifNull: ['$status', 'approved'] }, count: { $sum: 1 } } }]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        monthlyPayments,
        categoryStats,
        roleStats,
        paymentStatusStats,
        gigStatusStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const { role, status, search } = req.query;
    const query = {};

    if (role && role !== 'all') query.role = role;
    if (status === 'suspended') query.isSuspended = true;
    if (status === 'active') query.isSuspended = { $ne: true };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password -otp -otpExpires -passwordResetToken -passwordResetExpires -twoFactorSecret')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    const { isSuspended } = req.body;

    if (req.params.id === req.user.id && isSuspended) {
      return res.status(400).json({ success: false, message: 'Admins cannot suspend their own account' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isSuspended: Boolean(isSuspended),
        suspendedAt: isSuspended ? new Date() : null,
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await logAdminAction(
      req,
      isSuspended ? 'suspend_user' : 'activate_user',
      'User',
      user._id,
      `${isSuspended ? 'Suspended' : 'Activated'} ${user.email}`,
      { isSuspended: Boolean(isSuspended) }
    );

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.updateFreelancerVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isVerifiedBadge = Boolean(req.body.isVerifiedBadge);
    await user.save({ validateBeforeSave: false });

    await logAdminAction(
      req,
      user.isVerifiedBadge ? 'verify_user' : 'remove_user_verification',
      'User',
      user._id,
      `${user.isVerifiedBadge ? 'Verified' : 'Removed verification from'} user ${user.email}`
    );

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!['client', 'freelancer', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    if (req.params.id === req.user.id && role !== 'admin') {
      return res.status(400).json({ success: false, message: 'Admins cannot remove their own admin role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await logAdminAction(req, 'change_user_role', 'User', user._id, `Changed ${user.email} role to ${role}`, { role });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.getGigs = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const gigs = await Job.find(query)
      .populate('client', 'name email role isSuspended')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const proposalCounts = await Bid.aggregate([{ $group: { _id: '$job', count: { $sum: 1 } } }]);
    const countByJob = proposalCounts.reduce((acc, item) => {
      acc[item._id.toString()] = item.count;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      count: gigs.length,
      data: gigs.map((gig) => ({
        ...gig,
        status: gig.status || 'approved',
        proposalCount: countByJob[gig._id.toString()] || 0,
      })),
    });
  } catch (error) {
    next(error);
  }
};

exports.updateGigStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid gig status' });
    }

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      {
        status,
        rejectionReason: status === 'rejected' ? rejectionReason || 'Rejected by admin' : '',
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).populate('client', 'name email');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }

    await logAdminAction(req, `${status}_gig`, 'Job', job._id, `${status} gig "${job.title}"`, { rejectionReason });

    res.status(200).json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

exports.deleteGig = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }

    await Bid.deleteMany({ job: job._id });
    await logAdminAction(req, 'delete_gig', 'Job', job._id, `Deleted gig "${job.title}"`);

    res.status(200).json({ success: true, message: 'Gig deleted' });
  } catch (error) {
    next(error);
  }
};

exports.getPayments = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { razorpayOrderId: { $regex: search, $options: 'i' } },
        { razorpayPaymentId: { $regex: search, $options: 'i' } },
      ];
    }

    const payments = await Payment.find(query)
      .populate('job', 'title category')
      .populate('proposal', 'amount status')
      .populate('client', 'name email')
      .populate('freelancer', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    next(error);
  }
};

exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { status, refundReason } = req.body;

    if (!['created', 'paid', 'released', 'refunded', 'failed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid payment status' });
    }

    const timestampField = {
      paid: 'paidAt',
      released: 'releasedAt',
      refunded: 'refundedAt',
      failed: 'failedAt',
    }[status];

    const update = { status };
    if (timestampField) update[timestampField] = new Date();
    if (status === 'refunded') update.refundReason = refundReason || 'Refunded by admin';

    const payment = await Payment.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('job', 'title category')
      .populate('client', 'name email')
      .populate('freelancer', 'name email');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (status === 'paid' || status === 'released') {
      await Bid.findByIdAndUpdate(payment.proposal, { status: 'paid' });
    }

    await logAdminAction(req, `mark_payment_${status}`, 'Payment', payment._id, `Marked payment ${payment.razorpayOrderId} as ${status}`, { refundReason });

    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

exports.getDisputes = async (req, res, next) => {
  try {
    const { status, risk, search } = req.query;
    const query = {};

    if (status && status !== 'all') query.status = status;
    if (risk && risk !== 'all') query.fraudRisk = risk;
    if (search) {
      query.$or = [
        { reason: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const disputes = await Dispute.find(query)
      .populate('payment', 'amount status razorpayOrderId razorpayPaymentId')
      .populate('job', 'title category')
      .populate('openedBy', 'name email role')
      .populate('againstUser', 'name email role')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: disputes.length, data: disputes });
  } catch (error) {
    next(error);
  }
};

exports.createDispute = async (req, res, next) => {
  try {
    const dispute = await Dispute.create(req.body);
    await logAdminAction(req, 'create_dispute', 'Dispute', dispute._id, `Created dispute: ${dispute.reason}`, {
      priority: dispute.priority,
      fraudRisk: dispute.fraudRisk,
    });

    res.status(201).json({ success: true, data: dispute });
  } catch (error) {
    next(error);
  }
};

exports.updateDispute = async (req, res, next) => {
  try {
    const allowed = ['status', 'priority', 'fraudRisk', 'resolution', 'adminNotes'];
    const update = {};

    allowed.forEach((key) => {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    });

    if (['resolved', 'rejected'].includes(update.status)) {
      update.resolvedBy = req.user.id;
      update.resolvedAt = new Date();
    }

    const dispute = await Dispute.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true })
      .populate('payment', 'amount status razorpayOrderId')
      .populate('job', 'title')
      .populate('openedBy', 'name email')
      .populate('againstUser', 'name email');

    if (!dispute) {
      return res.status(404).json({ success: false, message: 'Dispute not found' });
    }

    await logAdminAction(req, 'update_dispute', 'Dispute', dispute._id, `Updated dispute: ${dispute.reason}`, update);

    res.status(200).json({ success: true, data: dispute });
  } catch (error) {
    next(error);
  }
};

exports.getLogs = async (req, res, next) => {
  try {
    const { action, targetType } = req.query;
    const query = {};

    if (action && action !== 'all') query.action = action;
    if (targetType && targetType !== 'all') query.targetType = targetType;

    const logs = await AdminLog.find(query)
      .populate('admin', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    next(error);
  }
};
