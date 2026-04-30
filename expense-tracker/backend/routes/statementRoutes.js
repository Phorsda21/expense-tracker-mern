const express = require('express');
const router = express.Router();
const multer = require('multer');
const { parseStatement, importTransactions } = require('../controllers/statementController');
const { protect } = require('../middleware/authMiddleware');

// Configure multer for memory storage (PDF files up to 10MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// POST /api/statement/parse - Upload and parse bank statement PDF
router.post('/parse', protect, upload.single('statement'), parseStatement);

// POST /api/statement/import - Import selected transactions
router.post('/import', protect, importTransactions);

module.exports = router;
