const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getAnalyticsOverview } = require('../controllers/analyticsController');

// GET /api/analytics - Protected Route
router.get('/', authMiddleware, getAnalyticsOverview);

module.exports = router;