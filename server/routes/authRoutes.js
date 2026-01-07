const express = require('express');
const router = express.Router();
const { register, login, updateProfile } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Public Routes
router.post('/register', register);
router.post('/login', login);

// Protected Route (Update Business Profile)
router.put('/profile', authMiddleware, updateProfile);

module.exports = router;