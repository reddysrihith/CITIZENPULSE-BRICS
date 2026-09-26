const Dispute = require('../models/Dispute');
const Job = require('../models/Job');
const Bid = require('../models/Bid');
const { createNotification } = require('./notificationController');

// @desc    Raise a new dispute
// @route   POST /api/disputes
// @access  Private
exports.raiseDispute = async (req, res, next) => {
  try {
    const { contractId, reason, description, evidence } = req.body;

    if (!contractId || !reason) {
      return res.status(400).json({ success: false, message: 'Contract ID and reason are required' });
    }

    const contract = await Bid.findById(contractId).populate('job');
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    const isFreelancer = contract.freelancer.toString() === req.user.id;
    const isClient = contract.job?.client?.toString() === req.user.id;

    if (!isFreelancer && !isClient) {
      return res.status(403).json({ success: false, message: 'Not authorized to raise a dispute for this contract' });
    }

    const againstUser = isClient ? contract.freelancer : contract.job.client;

    // Check if open dispute already exists
    const existingDispute = await Dispute.findOne({
      proposal: contractId,
      status: { $in: ['open', 'under_review'] }
    });

    if (existingDispute) {
      return res.status(400).json({ success: false, message: 'There is already an active dispute for this contract.' });
    }

    const dispute = await Dispute.create({
      job: contract.job._id,
      proposal: contract._id,
      openedBy: req.user.id,
      againstUser,
      reason,
      description,
      evidence: Array.isArray(evidence) ? evidence : [],
      status: 'open',
      priority: 'medium'
    });

    await createNotification({
      user: againstUser,
      title: 'Dispute opened',
      message: `A dispute was opened for "${contract.job.title}".`,
      type: 'dispute',
      link: '/active-contracts',
      metadata: { disputeId: dispute._id, contractId },
    });

    res.status(201).json({ success: true, data: dispute, message: 'Dispute raised successfully. An admin will review it shortly.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my disputes
// @route   GET /api/disputes/my-disputes
// @access  Private
exports.getMyDisputes = async (req, res, next) => {
  try {
    const disputes = await Dispute.find({
      $or: [
        { openedBy: req.user.id },
        { againstUser: req.user.id }
      ]
    })
    .populate('job', 'title')
    .populate('openedBy', 'name role')
    .populate('againstUser', 'name role')
    .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: disputes.length, data: disputes });
  } catch (error) {
    next(error);
  }
};
