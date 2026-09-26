const Job = require('../models/Job');
const User = require('../models/User');
const Bid = require('../models/Bid');
const mongoose = require('mongoose');
const { createNotification } = require('./notificationController');

// @desc    Create a new job (client only)
// @route   POST /api/jobs
// @access  Private (client)
exports.createJob = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      requiredSkills,
      skills,
      budget,
      budgetMin,
      budgetMax,
      deadline,
      milestones,
      documents,
      location,
    } = req.body;
    const normalizedSkills = Array.isArray(requiredSkills || skills)
      ? (requiredSkills || skills)
      : String(requiredSkills || skills || '').split(',').map((skill) => skill.trim()).filter(Boolean);
    const normalizedBudgetMax = Number(budgetMax || budget || 0);
    const job = await Job.create({
      title,
      description,
      category,
      requiredSkills: normalizedSkills,
      skills: normalizedSkills,
      budget: normalizedBudgetMax || Number(budget),
      budgetMin: budgetMin ? Number(budgetMin) : undefined,
      budgetMax: normalizedBudgetMax || undefined,
      deadline: deadline || undefined,
      milestones: Array.isArray(milestones) ? milestones : [],
      documents: Array.isArray(documents) ? documents : [],
      location,
      client: req.user.id,
      status: process.env.NODE_ENV === 'development' ? 'approved' : 'pending',
    });
    await createNotification({
      user: req.user.id,
      title: 'Gig submitted for approval',
      message: `"${job.title}" is saved and waiting for admin approval.`,
      type: 'gig',
      link: `/jobs/${job._id}`,
      metadata: { jobId: job._id },
    });
    res.status(201).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all jobs (public)
// @route   GET /api/jobs
// @access  Public
exports.getJobs = async (req, res, next) => {
  try {
    const { search, category, minBudget, maxBudget, location, skill, rating, experience, sort } = req.query;
    let userId;
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        // Ignore invalid token
      }
    }

    const query = {
      $or: [
        { status: 'approved' },
        { status: { $exists: false } },
      ],
    };

    if (userId) {
      query.$or.push({ client: userId });
    }

    // --- Advanced Search Engine Logic ---
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { skills: searchRegex },
          { requiredSkills: searchRegex }
        ]
      });
    }

    if (skill) {
      const skillRegex = { $regex: skill, $options: 'i' };
      query.$and = query.$and || [];
      query.$and.push({ $or: [{ skills: skillRegex }, { requiredSkills: skillRegex }] });
    }

    if (location) {
      const locationRegex = { $regex: location, $options: 'i' };
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { 'location.city': locationRegex },
          { 'location.country': locationRegex },
        ],
      });
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (minBudget || maxBudget) {
      query.$and = query.$and || [];
      const budgetFilter = {};
      if (minBudget) budgetFilter.$gte = Number(minBudget);
      if (maxBudget) budgetFilter.$lte = Number(maxBudget);
      query.$and.push({
        $or: [
          { budget: budgetFilter },
          { budgetMax: budgetFilter },
        ],
      });
    }

    let sortObj = { createdAt: -1 }; // default newest
    if (sort === 'budget-high') sortObj = { budget: -1 };
    else if (sort === 'budget-low') sortObj = { budget: 1 };
    else if (sort === 'oldest') sortObj = { createdAt: 1 };
    // -----------------------------------

    let jobs;
    if (process.env.ATLAS_SEARCH_ENABLED === 'true' && search) {
      const atlasPipeline = [
        {
          $search: {
            index: process.env.ATLAS_SEARCH_INDEX || 'jobs_search',
            compound: {
              should: [
                { text: { query: search, path: 'title' } },
                { text: { query: search, path: 'description' } },
                { text: { query: search, path: 'category' } },
                { text: { query: search, path: 'requiredSkills' } },
                { text: { query: search, path: 'skills' } },
              ],
            },
          },
        },
        { $match: query },
        { $sort: sortObj },
        { $limit: 100 },
        {
          $lookup: {
            from: 'users',
            localField: 'client',
            foreignField: '_id',
            as: 'client',
            pipeline: [{ $project: { name: 1, email: 1 } }],
          },
        },
        { $unwind: { path: '$client', preserveNullAndEmptyArrays: true } },
      ];
      jobs = await Job.aggregate(atlasPipeline);
    } else {
      jobs = await Job.find(query).populate('client', 'name email').sort(sortObj).lean();
    }
    const bidCounts = await Bid.aggregate([
      { $group: { _id: '$job', count: { $sum: 1 } } },
    ]);
    const paidBids = await Bid.find({ status: 'paid' });
    const paidJobIds = new Set(paidBids.map(b => b.job.toString()));
    const countByJob = bidCounts.reduce((acc, item) => {
      acc[item._id.toString()] = item.count;
      return acc;
    }, {});
    const data = jobs.map((job) => ({
      ...job,
      isPaid: paidJobIds.has(job._id.toString()),
      proposals: Array.from({ length: countByJob[job._id.toString()] || 0 }),
    }));
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
exports.getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('client', 'name email').lean();
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    const paidBid = await Bid.findOne({ job: job._id, status: 'paid' });
    job.isPaid = !!paidBid;
    res.status(200).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a job (owner only)
// @route   PUT /api/jobs/:id
// @access  Private (owner)
exports.updateJob = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, client: req.user.id });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
    Object.assign(job, req.body);
    await job.save();
    res.status(200).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a job (owner only)
// @route   DELETE /api/jobs/:id
// @access  Private (owner)
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, client: req.user.id });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
    res.status(200).json({ success: true, message: 'Job deleted' });
  } catch (err) {
    next(err);
  }
};

// @desc    AI-powered job matching (placeholder)
// @route   POST /api/jobs/match
// @access  Private (freelancer)
exports.matchJobs = async (req, res, next) => {
  try {
    // In a real implementation, you would send freelancer profile data to an AI service
    // and receive a ranked list of job IDs. Here we return all jobs sorted by budget.
    const jobs = await Job.find().sort({ budget: -1 }).limit(20);
    res.status(200).json({ success: true, data: jobs });
  } catch (err) {
    next(err);
  }
};

// @desc    Apply to a job as a freelancer
// @route   POST /api/jobs/:id/apply
// @access  Private (freelancer)
exports.applyToJob = async (req, res, next) => {
  try {
    const { coverLetter, proposal, bidAmount, amount, estimatedTime, attachments } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.client?.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot apply to your own job' });
    }

    const bid = await Bid.create({
      job: job._id,
      freelancer: req.user.id,
      amount: Number(bidAmount || amount),
      proposal: coverLetter || proposal,
      estimatedTime: estimatedTime || '',
      attachments: Array.isArray(attachments) ? attachments : [],
    });

    await createNotification({
      user: job.client,
      title: 'New proposal received',
      message: `A freelancer submitted a proposal for "${job.title}".`,
      type: 'proposal',
      link: `/jobs/${job._id}`,
      metadata: { jobId: job._id, proposalId: bid._id },
    });

    res.status(201).json({ success: true, data: bid });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already submitted a proposal for this job' });
    }
    next(err);
  }
};

// @desc    Get proposals for a client-owned job
// @route   GET /api/jobs/:id/proposals
// @access  Private (job owner)
exports.getJobProposals = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, client: req.user.id });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
    }

    const proposals = await Bid.find({ job: req.params.id })
      .populate('freelancer', 'name email skills hourlyRate profileImage isVerifiedBadge')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: proposals.length, data: proposals });
  } catch (err) {
    next(err);
  }
};

// @desc    Accept or reject a proposal
// @route   PUT /api/jobs/:jobId/proposals/:proposalId
// @access  Private (job owner)
exports.updateProposalStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be accepted or rejected' });
    }

    const job = await Job.findOne({ _id: req.params.jobId, client: req.user.id });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
    }

    const proposal = await Bid.findOneAndUpdate(
      { _id: req.params.proposalId, job: req.params.jobId },
      { status },
      { new: true }
    ).populate('freelancer', 'name email skills hourlyRate profileImage isVerifiedBadge');

    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    await createNotification({
      user: proposal.freelancer._id,
      title: status === 'accepted' ? 'Proposal accepted' : 'Proposal rejected',
      message: `Your proposal for "${job.title}" was ${status}.`,
      type: 'proposal',
      link: status === 'accepted' ? '/active-contracts' : `/jobs/${job._id}`,
      metadata: { jobId: job._id, proposalId: proposal._id },
    });

    res.status(200).json({ success: true, data: proposal });
  } catch (err) {
    next(err);
  }
};

// @desc    Get ongoing/accepted projects (contracts)
// @route   GET /api/jobs/ongoing
// @access  Private
exports.getOngoingProjects = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'freelancer') {
      query = { freelancer: req.user.id, status: 'accepted' };
    } else if (req.user.role === 'client') {
      const myJobs = await Job.find({ client: req.user.id });
      const jobIds = myJobs.map(job => job._id);
      query = { job: { $in: jobIds }, status: 'accepted' };
    } else {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const contracts = await Bid.find(query)
      .populate({
        path: 'job',
        select: 'title description category budget budgetMin budgetMax deadline milestones client status'
      })
      .populate('freelancer', 'name email profileImage')
      .sort({ updatedAt: -1 });

    const populatedContracts = await Promise.all(contracts.map(async (c) => {
      const contractObj = c.toObject();
      if (contractObj.job && contractObj.job.client) {
        const clientUser = await User.findById(contractObj.job.client, 'name email profileImage');
        contractObj.client = clientUser;
      }
      return contractObj;
    }));

    res.status(200).json({ success: true, count: populatedContracts.length, data: populatedContracts });
  } catch (err) {
    next(err);
  }
};

// @desc    Update progress of an ongoing project (contract)
// @route   PUT /api/jobs/ongoing/:contractId/progress
// @access  Private
exports.updateProjectProgress = async (req, res, next) => {
  try {
    const { progress, submissionNotes, submissionLink, attachments } = req.body;
    
    const contract = await Bid.findById(req.params.contractId).populate('job');
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    const isFreelancer = contract.freelancer.toString() === req.user.id;
    const isClient = contract.job?.client?.toString() === req.user.id;

    if (!isFreelancer && !isClient) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this contract' });
    }

    if (progress !== undefined) {
      contract.progress = Math.min(Math.max(Number(progress), 0), 100);
    }
    if (submissionNotes !== undefined) contract.submissionNotes = submissionNotes;
    if (submissionLink !== undefined) contract.submissionLink = submissionLink;
    if (Array.isArray(attachments)) contract.attachments = attachments;
    contract.progressLogs.push({
      note: submissionNotes || `Progress updated to ${contract.progress}%`,
      progress: contract.progress,
      createdBy: req.user.id,
    });

    await contract.save();

    const recipient = isFreelancer ? contract.job.client : contract.freelancer;
    await createNotification({
      user: recipient,
      title: 'Project progress updated',
      message: `${contract.job.title} is now ${contract.progress}% complete.`,
      type: 'gig',
      link: '/active-contracts',
      metadata: { contractId: contract._id, jobId: contract.job._id },
    });

    const updatedContract = await Bid.findById(contract._id)
      .populate({
        path: 'job',
        select: 'title description category budget budgetMin budgetMax deadline milestones client status'
      })
      .populate('freelancer', 'name email profileImage');

    if (updatedContract.job && updatedContract.job.client) {
      const clientUser = await User.findById(updatedContract.job.client, 'name email profileImage');
      const contractObj = updatedContract.toObject();
      contractObj.client = clientUser;
      return res.status(200).json({ success: true, data: contractObj });
    }

    res.status(200).json({ success: true, data: updatedContract });
  } catch (err) {
    next(err);
  }
};
