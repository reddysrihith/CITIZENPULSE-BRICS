const express = require('express');
const {
  matchJob,
  getRecommendedFreelancers,
  getTrendingSkills,
  updateEmbedding,
  inviteFreelancer,
  getFreelancerInvitations,
  getClientInvitations,
  respondToInvitation
} = require('../controllers/aiMatchingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/trending-skills', getTrendingSkills);

// Protected routes
router.use(protect);
router.post('/match-job', matchJob);
router.get('/recommended-freelancers/:jobId', getRecommendedFreelancers);
router.post('/update-freelancer-embedding', updateEmbedding);

// Invitations system
router.post('/invite', inviteFreelancer);
router.get('/invitations', getFreelancerInvitations);
router.get('/client-invitations/:jobId', getClientInvitations);
router.put('/invitations/:invitationId', respondToInvitation);

module.exports = router;
