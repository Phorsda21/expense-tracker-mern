const express = require('express');
const router = express.Router();
const {
  addExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  downloadExpenseExcel
} = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Excel download route (must be before /:id to avoid conflict)
router.get('/download/excel', downloadExpenseExcel);

// CRUD routes
router.route('/')
  .get(getAllExpenses)
  .post(addExpense);

router.route('/:id')
  .get(getExpenseById)
  .put(updateExpense)
  .delete(deleteExpense);

module.exports = router;
