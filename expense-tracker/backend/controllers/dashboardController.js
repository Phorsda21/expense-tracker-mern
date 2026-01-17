const Income = require('../models/Income');
const Expense = require('../models/Expense');

// @desc    Get dashboard summary statistics
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const { year, month } = req.query;

    // Build date filter
    let dateFilter = { user: userId };

    if (year) {
      const startDate = new Date(year, month ? month - 1 : 0, 1);
      const endDate = new Date(year, month ? month : 12, 0, 23, 59, 59);
      dateFilter.date = { $gte: startDate, $lte: endDate };
    }

    // Get all income and expenses (for available years)
    const allUserIncome = await Income.find({ user: userId });
    const allUserExpenses = await Expense.find({ user: userId });

    // Extract available years
    const incomeYears = allUserIncome.map(item => new Date(item.date).getFullYear());
    const expenseYears = allUserExpenses.map(item => new Date(item.date).getFullYear());
    const availableYears = [...new Set([...incomeYears, ...expenseYears])].sort((a, b) => b - a);

    // Apply filter if exists, otherwise use all data for totals/breakdowns within filter context
    // Actually, if we want "Dashboard" to be filterable, we should apply filter to the main queries.
    // But if no filter, do we show ALL? Yes.

    const filteredIncome = year ? await Income.find(dateFilter) : allUserIncome;
    const filteredExpenses = year ? await Expense.find(dateFilter) : allUserExpenses;

    // Calculate totals
    const totalIncome = filteredIncome.reduce((sum, item) => sum + item.amount, 0);
    const totalExpense = filteredExpenses.reduce((sum, item) => sum + item.amount, 0);
    const totalBalance = totalIncome - totalExpense;

    // Chart Data
    // If filtered, show daily data for that range. 
    // If NOT filtered, previous logic was "Last 60 days". 
    // Let's keep "Last 60 Days" if NO filter is applied, to avoid overcrowding the chart with 5 years of data.

    let chartIncome = filteredIncome;
    let chartExpenses = filteredExpenses;

    if (!year) {
      // Default view: Last 60 days
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      chartIncome = await Income.find({
        user: userId,
        date: { $gte: sixtyDaysAgo }
      }).sort({ date: 1 });

      chartExpenses = await Expense.find({
        user: userId,
        date: { $gte: sixtyDaysAgo }
      }).sort({ date: 1 });
    } else {
      // If filtered, sort by date
      chartIncome.sort((a, b) => new Date(a.date) - new Date(b.date));
      chartExpenses.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    // Prepare chart data - group by date
    const chartDataMap = new Map();

    chartIncome.forEach(item => {
      const dateKey = new Date(item.date).toISOString().split('T')[0];
      if (!chartDataMap.has(dateKey)) {
        chartDataMap.set(dateKey, { date: dateKey, income: 0, expense: 0, incomeSources: [] });
      }
      const dayData = chartDataMap.get(dateKey);
      dayData.income += item.amount;
      dayData.incomeSources.push({ source: item.source, amount: item.amount });
    });

    chartExpenses.forEach(item => {
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
      }),
      name: new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }));

    // Recent Transactions (Affected by filter? Usually "Recent" implies latest, regardless of filter, 
    // BUT if I look at "2023", maybe I want to see transactions from 2023. 
    // Let's rely on filtered data for transactions too if filter is present.
    // If no filter, show global recent.

    let recentTxIncome = filteredIncome;
    let recentTxExpense = filteredExpenses;

    // If no filter, we already fetched all, but we want to sort and limit.
    // If filter, we accept the filtered list.

    // Sort and limit
    const recentIncomeTransactions = [...recentTxIncome].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    const recentExpenseTransactions = [...recentTxExpense].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

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

    // Calculate expense breakdown by category (using filtered data)
    const expenseByCategory = {};
    filteredExpenses.forEach(expense => {
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

    // Calculate income breakdown by source (using filtered data)
    const incomeBySource = {};
    filteredIncome.forEach(income => {
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
      availableYears, // Send available years to frontend
      totalBalance,
      totalIncome,
      totalExpense,
      chartData: formattedChartData,
      recentTransactions,
      expenseBreakdown,
      incomeBreakdown,
      transactionCount: {
        income: filteredIncome.length,
        expense: filteredExpenses.length
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
