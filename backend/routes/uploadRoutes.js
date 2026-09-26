const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { uploadFile } = require('../controllers/uploadController');

const router = express.Router();

router.post('/', protect, uploadFile);

module.exports = router;
