const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { chatWithAI } = require('../controllers/chatController');

// POST /api/chat - Protected route
// Ensure chatController.js exists before running this
router.post('/', authMiddleware, chatWithAI);

module.exports = router;