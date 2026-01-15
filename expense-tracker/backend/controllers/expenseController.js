const Expense = require('../models/Expense');
const xlsx = require('xlsx');

// @desc    Add new expense
// @route   POST /api/expense
// @access  Private
const addExpense = async (req, res) => {
  try {
    const { icon, category, amount, date } = req.body;

    const expense = await Expense.create({
      user: req.user._id,
      icon: icon || '🛒',
      category,
      amount,
      date: date || new Date()
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error('Add expense error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get all expenses for user
// @route   GET /api/expense
// @access  Private
const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get single expense
// @route   GET /api/expense/:id
// @access  Private
const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(expense);
  } catch (error) {
    console.error('Get expense by id error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Update expense
// @route   PUT /api/expense/:id
// @access  Private
const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const { icon, category, amount, date } = req.body;

    expense.icon = icon || expense.icon;
    expense.category = category || expense.category;
    expense.amount = amount !== undefined ? amount : expense.amount;
    expense.date = date || expense.date;

    const updatedExpense = await expense.save();
    res.json(updatedExpense);
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expense/:id
// @access  Private
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Download expenses as Excel
// @route   GET /api/expense/download/excel
// @access  Private
const downloadExpenseExcel = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });

    // Prepare data for Excel
    const data = expenses.map((item, index) => ({
      'S.No': index + 1,
      'Category': item.category,
      'Amount': item.amount,
      'Date': new Date(item.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }));

    // Create workbook and worksheet
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(data);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 8 },   // S.No
      { wch: 25 },  // Category
      { wch: 15 },  // Amount
      { wch: 15 }   // Date
    ];

    xlsx.utils.book_append_sheet(workbook, worksheet, 'Expenses');

    // Generate buffer
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set headers for download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=expense_report.xlsx');
    
    res.send(buffer);
  } catch (error) {
    console.error('Download expense excel error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

module.exports = {
  addExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  downloadExpenseExcel
};
