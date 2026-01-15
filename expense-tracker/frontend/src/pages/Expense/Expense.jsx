import { useState, useEffect } from 'react';
import { API, EXPENSE_EMOJIS, formatCurrency, formatDate, getTodayDate } from '../../utils/helper';
import EmojiPicker from '../../components/EmojiPicker';
import CustomLineChart from '../../components/Charts/CustomLineChart';
import CustomPieChart from '../../components/Charts/CustomPieChart';
import { toast } from 'react-toastify';

const Expense = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    icon: '🛒',
    category: '',
    amount: '',
    date: getTodayDate()
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await API.getAllExpenses();
      setExpenses(response.data);
    } catch (error) {
      console.error('Fetch expense error:', error);
      toast.error('Failed to load expense data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.category.trim()) {
      toast.error('Please enter expense category');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setSubmitting(true);
    try {
      await API.addExpense({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      toast.success('Expense added successfully!');
      setFormData({
        icon: '🛒',
        category: '',
        amount: '',
        date: getTodayDate()
      });
      fetchExpenses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      await API.deleteExpense(id);
      toast.success('Expense deleted');
      fetchExpenses();
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };

  const handleDownload = async () => {
    const result = await API.downloadExpenseExcel();
    if (result.success) {
      toast.success('Download started!');
    } else {
      toast.error(result.message);
    }
  };

  // Calculate totals
  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

  // Prepare pie chart data - by category
  const expenseByCategory = {};
  expenses.forEach(expense => {
    if (!expenseByCategory[expense.category]) {
      expenseByCategory[expense.category] = 0;
    }
    expenseByCategory[expense.category] += expense.amount;
  });

  const pieChartData = Object.entries(expenseByCategory).map(([category, amount]) => ({
    name: category,
    amount,
    percentage: totalExpense > 0 ? ((amount / totalExpense) * 100).toFixed(1) : 0
  })).sort((a, b) => b.amount - a.amount);

  // Prepare line chart data - by date
  const expenseByDate = {};
  expenses.forEach(expense => {
    const dateKey = new Date(expense.date).toISOString().split('T')[0];
    if (!expenseByDate[dateKey]) {
      expenseByDate[dateKey] = 0;
    }
    expenseByDate[dateKey] += expense.amount;
  });

  const lineChartData = Object.entries(expenseByDate)
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .slice(-30)
    .map(([date, amount]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount
    }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Expenses</h1>
          <p className="text-slate-400">Track your spending</p>
        </div>
        <button
          onClick={handleDownload}
          disabled={expenses.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-700/50 text-slate-300 rounded-xl 
            hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Excel
        </button>
      </div>

      {/* Total Expense Card */}
      <div className="bg-gradient-to-r from-rose-500/20 to-rose-600/10 rounded-2xl p-6 border border-rose-500/20">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/25">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Total Expenses</p>
            <p className="text-3xl font-bold text-rose-400">{formatCurrency(totalExpense)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Expense Form */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-6">Add New Expense</h3>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Emoji Picker */}
            <div>
              <label className="block text-slate-400 text-sm font-medium mb-3">Select Icon</label>
              <EmojiPicker
                emojis={EXPENSE_EMOJIS}
                selectedEmoji={formData.icon}
                onSelect={(emoji) => setFormData({ ...formData, icon: emoji })}
              />
            </div>

            {/* Category Input */}
            <div>
              <label className="block text-slate-400 text-sm font-medium mb-2">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Food, Transport, Shopping"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white 
                  placeholder-slate-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all"
              />
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-slate-400 text-sm font-medium mb-2">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">$</span>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white 
                    placeholder-slate-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all"
                />
              </div>
            </div>

            {/* Date Input */}
            <div>
              <label className="block text-slate-400 text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white 
                  focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold 
                rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Expense
                </>
              )}
            </button>
          </form>
        </div>

        {/* Pie Chart */}
        <CustomPieChart
          data={pieChartData}
          title="Expense by Category"
          dataKey="amount"
          nameKey="name"
        />
      </div>

      {/* Line Chart */}
      <CustomLineChart
        data={lineChartData}
        title="Expense Trend (Last 30 Days)"
        lines={[{ dataKey: 'amount', color: '#ef4444', name: 'Expense' }]}
      />

      {/* Expense List */}
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="p-4 border-b border-slate-700/50">
          <h3 className="text-lg font-semibold text-white">Expense History</h3>
        </div>
        
        {expenses.length > 0 ? (
          <div className="divide-y divide-slate-700/50">
            {expenses.map((expense) => (
              <div
                key={expense._id}
                className="flex items-center justify-between p-4 hover:bg-slate-700/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center text-2xl">
                    {expense.icon || '🛒'}
                  </div>
                  <div>
                    <p className="text-white font-medium">{expense.category}</p>
                    <p className="text-slate-500 text-sm">{formatDate(expense.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-rose-400 font-semibold text-lg">
                    -{formatCurrency(expense.amount)}
                  </p>
                  <button
                    onClick={() => handleDelete(expense._id)}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            </div>
            <p className="text-slate-400">No expense records yet</p>
            <p className="text-slate-600 text-sm mt-1">Add your first expense using the form above</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Expense;
