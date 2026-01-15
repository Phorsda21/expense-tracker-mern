const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  icon: {
    type: String,
    default: '💰'
  },
  source: {
    type: String,
    required: [true, 'Income source is required'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Income', incomeSchema);
