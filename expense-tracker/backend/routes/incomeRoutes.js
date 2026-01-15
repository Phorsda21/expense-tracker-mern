const express = require('express');
const router = express.Router();
const {
  addIncome,
  getAllIncome,
  getIncomeById,
  updateIncome,
  deleteIncome,
  downloadIncomeExcel
} = require('../controllers/incomeController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Excel download route (must be before /:id to avoid conflict)
router.get('/download/excel', downloadIncomeExcel);

// CRUD routes
router.route('/')
  .get(getAllIncome)
  .post(addIncome);

router.route('/:id')
  .get(getIncomeById)
  .put(updateIncome)
  .delete(deleteIncome);

module.exports = router;
