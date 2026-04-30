const express = require('express');
const router = express.Router();
const multer = require('multer');
const { scanReceipt } = require('../controllers/receiptController');
const { protect } = require('../middleware/authMiddleware');

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post('/scan', protect, upload.single('receipt'), scanReceipt);

module.exports = router;
