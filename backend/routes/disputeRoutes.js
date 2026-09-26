const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { raiseDispute, getMyDisputes } = require('../controllers/disputeController');

const router = express.Router();

router.post('/', protect, raiseDispute);
router.get('/my-disputes', protect, getMyDisputes);

module.exports = router;
