const Job = require('../models/Job');
const User = require('../models/User');
const TrendingSkill = require('../models/TrendingSkill');
const JobInvitation = require('../models/JobInvitation');
const Bid = require('../models/Bid');
const { computeMatches, updateFreelancerEmbedding } = require('../services/aiMatchingService');

// In-memory cache for demo/simplicity. In production, use Redis.
const matchCache = new Map();
const CACHE_TTL = 3600000; // 1 hour

/**
 * @desc    Match job with freelancers
 * @route   POST /api/ai-matching/match-job
 * @access  Private (Client)
 */
exports.matchJob = async (req, res, next) => {
  try {
    const { jobId } = req.body;
    if (!jobId) {
      return res.status(400).json({ success: false, message: 'Please provide a jobId' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Only allow client who posted it, or admin
    if (req.user.role === 'client' && job.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to match this job' });
    }

    // Fetch all active freelancers
    const freelancers = await User.find({ role: 'freelancer', isSuspended: false });

    console.log(`📊 Computing matches for job: ${job.title} against ${freelancers.length} freelancers`);
    const matches = await computeMatches(job, freelancers);

    const responseData = {
      jobId: job._id,
      jobTitle: job.title,
      matches,
      processedAt: new Date().toISOString()
    };

    // Cache the result
    matchCache.set(jobId.toString(), {
      data: responseData,
      timestamp: Date.now()
    });

    res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    console.error('Error in matchJob:', error);
    next(error);
  }
};

/**
 * @desc    Get recommended freelancers (cached)
 * @route   GET /api/ai-matching/recommended-freelancers/:jobId
 * @access  Private
 */
exports.getRecommendedFreelancers = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    // Check cache
    if (matchCache.has(jobId)) {
      const cached = matchCache.get(jobId);
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`✅ Returning cached matches for job: ${jobId}`);
        return res.status(200).json({ success: true, data: cached.data });
      } else {
        matchCache.delete(jobId);
      }
    }

    // If not in cache, fallback to computing it (internal call)
    req.body.jobId = jobId;
    return this.matchJob(req, res, next);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get trending skills
 * @route   GET /api/ai-matching/trending-skills
 * @access  Public
 */
exports.getTrendingSkills = async (req, res, next) => {
  try {
    const skills = await TrendingSkill.find().sort({ count: -1 }).limit(20);
    res.status(200).json({ success: true, data: skills });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Trigger embedding update for freelancer
 * @route   POST /api/ai-matching/update-freelancer-embedding
 * @access  Private (Freelancer)
 */
exports.updateEmbedding = async (req, res, next) => {
  try {
    if (req.user.role !== 'freelancer') {
      return res.status(403).json({ success: false, message: 'Only freelancers can update their skill embedding' });
    }

    console.log(`🤖 Updating embedding for freelancer: ${req.user.id}`);
    const updatedUser = await updateFreelancerEmbedding(req.user.id);
    
    if (!updatedUser) {
      return res.status(500).json({ success: false, message: 'Failed to update embedding' });
    }

    res.status(200).json({ success: true, message: 'Embedding updated successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Invite a freelancer to a job
 * @route   POST /api/ai-matching/invite
 * @access  Private (Client)
 */
exports.inviteFreelancer = async (req, res, next) => {
  try {
    const { jobId, freelancerId } = req.body;

    if (!jobId || !freelancerId) {
      return res.status(400).json({ success: false, message: 'Please provide jobId and freelancerId' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Verify ownership of the job
    if (job.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to invite to this job' });
    }

    const freelancer = await User.findById(freelancerId);
    if (!freelancer || freelancer.role !== 'freelancer') {
      return res.status(404).json({ success: false, message: 'Freelancer not found' });
    }

    // Check if proposal (Bid) already exists
    const existingBid = await Bid.findOne({ job: jobId, freelancer: freelancerId });
    if (existingBid) {
      return res.status(400).json({ success: false, message: 'Freelancer has already applied to this gig' });
    }

    // Check if already invited
    let invitation = await JobInvitation.findOne({ job: jobId, freelancer: freelancerId });
    if (invitation) {
      return res.status(200).json({ success: true, data: invitation, message: 'Already invited' });
    }

    // Create invitation
    invitation = await JobInvitation.create({
      job: jobId,
      client: req.user.id,
      freelancer: freelancerId,
      status: 'pending'
    });

    res.status(201).json({ success: true, data: invitation, message: 'Invitation sent successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get received invitations for logged-in freelancer
 * @route   GET /api/ai-matching/invitations
 * @access  Private (Freelancer)
 */
exports.getFreelancerInvitations = async (req, res, next) => {
  try {
    if (req.user.role !== 'freelancer') {
      return res.status(403).json({ success: false, message: 'Only freelancers can view invitations' });
    }

    const invitations = await JobInvitation.find({ freelancer: req.user.id })
      .populate({
        path: 'job',
        select: 'title description budget category skills requiredSkills createdAt isPaid'
      })
      .populate({
        path: 'client',
        select: 'name email profileImage'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: invitations });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get sent invitations for a specific job
 * @route   GET /api/ai-matching/client-invitations/:jobId
 * @access  Private (Client)
 */
exports.getClientInvitations = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view invitations for this job' });
    }

    const invitations = await JobInvitation.find({ job: jobId });
    res.status(200).json({ success: true, data: invitations });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Respond to an invitation (accept or decline)
 * @route   PUT /api/ai-matching/invitations/:invitationId
 * @access  Private (Freelancer)
 */
exports.respondToInvitation = async (req, res, next) => {
  try {
    const { invitationId } = req.params;
    const { status } = req.body; // 'accepted' or 'declined'

    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid status response' });
    }

    const invitation = await JobInvitation.findById(invitationId);
    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation not found' });
    }

    if (invitation.freelancer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to respond to this invitation' });
    }

    invitation.status = status;
    await invitation.save();

    if (status === 'accepted') {
      // Find the job to get the budget
      const job = await Job.findById(invitation.job);
      
      // Auto-create a pending Bid so the client sees them in proposals list!
      // First make sure no existing Bid exists
      const existingBid = await Bid.findOne({ job: invitation.job, freelancer: req.user.id });
      if (!existingBid && job) {
        await Bid.create({
          job: invitation.job,
          freelancer: req.user.id,
          amount: job.budget || 0,
          proposal: 'Accepted client invitation to discuss the gig.',
          estimatedTime: 'Not specified',
          status: 'pending'
        });
      }
    }

    res.status(200).json({ 
      success: true, 
      data: invitation, 
      message: `Invitation successfully ${status}` 
    });
  } catch (error) {
    next(error);
  }
};
