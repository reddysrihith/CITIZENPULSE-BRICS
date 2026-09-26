const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  sendMessage,
  getConversation,
  getChatContacts
} = require('../controllers/messageController');

const router = express.Router();

router.use(protect);

router.post('/', sendMessage);
router.get('/contacts', getChatContacts);
router.get('/conversation/:userId', getConversation);

module.exports = router;
