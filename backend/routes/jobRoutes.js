const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
  matchJobs,
  applyToJob,
  getJobProposals,
  updateProposalStatus,
  getOngoingProjects,
  updateProjectProgress,
} = require('../controllers/jobController');

const router = express.Router();

// Public routes
router.get('/', getJobs);
router.get('/ongoing', protect, getOngoingProjects);
router.put('/ongoing/:contractId/progress', protect, updateProjectProgress);
router.get('/:id', getJob);
router.post('/match', protect, authorize('freelancer'), matchJobs);
router.post('/:id/apply', protect, authorize('freelancer'), applyToJob);
router.get('/:id/proposals', protect, authorize('client'), getJobProposals);
router.put('/:jobId/proposals/:proposalId', protect, authorize('client'), updateProposalStatus);

// Protected client routes
router.post('/', protect, authorize('client'), createJob);
router.put('/:id', protect, authorize('client'), updateJob);
router.delete('/:id', protect, authorize('client'), deleteJob);

module.exports = router;
