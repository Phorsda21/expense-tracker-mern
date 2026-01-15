const Income = require('../models/Income');
const xlsx = require('xlsx');

// @desc    Add new income
// @route   POST /api/income
// @access  Private
const addIncome = async (req, res) => {
  try {
    const { icon, source, amount, date } = req.body;

    const income = await Income.create({
      user: req.user._id,
      icon: icon || '💰',
      source,
      amount,
      date: date || new Date()
    });

    res.status(201).json(income);
  } catch (error) {
    console.error('Add income error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get all income for user
// @route   GET /api/income
// @access  Private
const getAllIncome = async (req, res) => {
  try {
    const income = await Income.find({ user: req.user._id }).sort({ date: -1 });
    res.json(income);
  } catch (error) {
    console.error('Get income error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get single income
// @route   GET /api/income/:id
// @access  Private
const getIncomeById = async (req, res) => {
  try {
    const income = await Income.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }

    res.json(income);
  } catch (error) {
    console.error('Get income by id error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Update income
// @route   PUT /api/income/:id
// @access  Private
const updateIncome = async (req, res) => {
  try {
    const income = await Income.findOne({ _id: req.params.id, user: req.user._id });

    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }

    const { icon, source, amount, date } = req.body;

    income.icon = icon || income.icon;
    income.source = source || income.source;
    income.amount = amount !== undefined ? amount : income.amount;
    income.date = date || income.date;

    const updatedIncome = await income.save();
    res.json(updatedIncome);
  } catch (error) {
    console.error('Update income error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Delete income
// @route   DELETE /api/income/:id
// @access  Private
const deleteIncome = async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }

    res.json({ message: 'Income deleted successfully' });
  } catch (error) {
    console.error('Delete income error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Download income as Excel
// @route   GET /api/income/download/excel
// @access  Private
const downloadIncomeExcel = async (req, res) => {
  try {
    const income = await Income.find({ user: req.user._id }).sort({ date: -1 });

    // Prepare data for Excel
    const data = income.map((item, index) => ({
      'S.No': index + 1,
      'Source': item.source,
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
      { wch: 25 },  // Source
      { wch: 15 },  // Amount
      { wch: 15 }   // Date
    ];

    xlsx.utils.book_append_sheet(workbook, worksheet, 'Income');

    // Generate buffer
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set headers for download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=income_report.xlsx');
    
    res.send(buffer);
  } catch (error) {
    console.error('Download income excel error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

module.exports = {
  addIncome,
  getAllIncome,
  getIncomeById,
  updateIncome,
  deleteIncome,
  downloadIncomeExcel
};
