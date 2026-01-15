const Income = require('../models/Income');
const Expense = require('../models/Expense');

// @desc    Get dashboard summary statistics
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all income and expenses
    const allIncome = await Income.find({ user: userId });
    const allExpenses = await Expense.find({ user: userId });

    // Calculate totals
    const totalIncome = allIncome.reduce((sum, item) => sum + item.amount, 0);
    const totalExpense = allExpenses.reduce((sum, item) => sum + item.amount, 0);
    const totalBalance = totalIncome - totalExpense;

    // Get last 60 days for chart data
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Get recent income (last 60 days)
    const recentIncome = await Income.find({
      user: userId,
      date: { $gte: sixtyDaysAgo }
    }).sort({ date: 1 });

    // Get recent expenses (last 60 days)
    const recentExpenses = await Expense.find({
      user: userId,
      date: { $gte: sixtyDaysAgo }
    }).sort({ date: 1 });

    // Prepare chart data - group by date
    const chartDataMap = new Map();

    recentIncome.forEach(item => {
      const dateKey = new Date(item.date).toISOString().split('T')[0];
      if (!chartDataMap.has(dateKey)) {
        chartDataMap.set(dateKey, { date: dateKey, income: 0, expense: 0 });
      }
      chartDataMap.get(dateKey).income += item.amount;
    });

    recentExpenses.forEach(item => {
      const dateKey = new Date(item.date).toISOString().split('T')[0];
      if (!chartDataMap.has(dateKey)) {
        chartDataMap.set(dateKey, { date: dateKey, income: 0, expense: 0 });
      }
      chartDataMap.get(dateKey).expense += item.amount;
    });

    // Convert to array and sort by date
    const chartData = Array.from(chartDataMap.values()).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    // Format chart data for display
    const formattedChartData = chartData.map(item => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }));

    // Get recent transactions (last 5 of each type)
    const recentIncomeTransactions = await Income.find({ user: userId })
      .sort({ date: -1 })
      .limit(5);

    const recentExpenseTransactions = await Expense.find({ user: userId })
      .sort({ date: -1 })
      .limit(5);

    // Combine and sort recent transactions
    const recentTransactions = [
      ...recentIncomeTransactions.map(item => ({
        _id: item._id,
        type: 'income',
        icon: item.icon,
        title: item.source,
        amount: item.amount,
        date: item.date
      })),
      ...recentExpenseTransactions.map(item => ({
        _id: item._id,
        type: 'expense',
        icon: item.icon,
        title: item.category,
        amount: item.amount,
        date: item.date
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

    // Calculate expense breakdown by category
    const expenseByCategory = {};
    allExpenses.forEach(expense => {
      if (!expenseByCategory[expense.category]) {
        expenseByCategory[expense.category] = 0;
      }
      expenseByCategory[expense.category] += expense.amount;
    });

    const expenseBreakdown = Object.entries(expenseByCategory).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpense > 0 ? ((amount / totalExpense) * 100).toFixed(1) : 0
    })).sort((a, b) => b.amount - a.amount);

    // Calculate income breakdown by source
    const incomeBySource = {};
    allIncome.forEach(income => {
      if (!incomeBySource[income.source]) {
        incomeBySource[income.source] = 0;
      }
      incomeBySource[income.source] += income.amount;
    });

    const incomeBreakdown = Object.entries(incomeBySource).map(([source, amount]) => ({
      source,
      amount,
      percentage: totalIncome > 0 ? ((amount / totalIncome) * 100).toFixed(1) : 0
    })).sort((a, b) => b.amount - a.amount);

    res.json({
      totalBalance,
      totalIncome,
      totalExpense,
      chartData: formattedChartData,
      recentTransactions,
      expenseBreakdown,
      incomeBreakdown,
      transactionCount: {
        income: allIncome.length,
        expense: allExpenses.length
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

module.exports = {
  getDashboardStats
};
