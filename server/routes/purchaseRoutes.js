const express = require('express');
const router = express.Router();
const multer = require('multer');
const { scanBill } = require('../controllers/purchaseController');
const protect = require('../middleware/authMiddleware'); // Assuming you have this

// Configure Multer for temporary storage
const upload = multer({ dest: 'uploads/' });

// Route: POST /api/purchases/scan
// 1. Authenticate user
// 2. Upload file locally
// 3. Run controller logic
router.post('/scan', protect, upload.single('billImage'), scanBill);

module.exports = router;