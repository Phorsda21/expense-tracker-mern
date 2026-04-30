import { useState, useEffect } from 'react';
import { API, EXPENSE_EMOJIS, formatCurrency, formatDate, getTodayDate, formatDateForInput } from '../../utils/helper';
import EmojiPicker from '../../components/EmojiPicker';
import CustomLineChart from '../../components/Charts/CustomLineChart';
import CustomPieChart from '../../components/Charts/CustomPieChart';
import DeleteModal from '../../components/DeleteModal';
import { toast } from 'react-toastify';

const Expense = () => {
  const [expenses, setExpenses] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [formData, setFormData] = useState({
    icon: '🛒',
    category: '',
    amount: '',
    date: getTodayDate(),
    currency: 'USD'
  });
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchExpenses();
    fetchCurrencies();
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

  const fetchCurrencies = async () => {
    try {
      const response = await API.getCurrencies();
      setCurrencies(response.data);
    } catch (error) {
      console.error('Fetch currency error:', error);
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
      let finalAmount = parseFloat(formData.amount);

      // Convert if custom currency is selected
      if (formData.currency !== 'USD') {
        const selectedCurrency = currencies.find(c => c._id === formData.currency);
        if (selectedCurrency) {
          finalAmount = finalAmount / selectedCurrency.rate;
        }
      }

      if (editMode) {
        await API.updateExpense(editId, {
          ...formData,
          amount: finalAmount
        });
        toast.success('Expense updated successfully!');
        setEditMode(false);
        setEditId(null);
      } else {
        await API.addExpense({
          ...formData,
          amount: finalAmount
        });
        toast.success('Expense added successfully!');
      }

      setFormData({
        icon: '🛒',
        category: '',
        amount: '',
        date: getTodayDate(),
        currency: 'USD'
      });
      fetchExpenses();
    } catch (error) {
      toast.error(error.response?.data?.message || (editMode ? 'Failed to update expense' : 'Failed to add expense'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditMode(true);
    setEditId(item._id);
    setFormData({
      icon: item.icon,
      category: item.category,
      amount: item.amount,
      date: formatDateForInput(item.date),
      currency: 'USD'
    });
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditId(null);
    setFormData({
      icon: '🛒',
      category: '',
      amount: '',
      date: getTodayDate(),
      currency: 'USD'
    });
  };

  const [deleteModal, setDeleteModal] = useState({
    show: false,
    id: null
  });

  const handleDeleteClick = (id) => {
    setDeleteModal({ show: true, id });
  };

  const confirmDelete = async () => {
    try {
      await API.deleteExpense(deleteModal.id);
      toast.success('Expense deleted');
      fetchExpenses();
      setDeleteModal({ show: false, id: null });
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

  const handleScanReceipt = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);
    const toastId = toast.loading('AI is reading your receipt...');
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('receipt', file);
      
      const response = await API.scanReceipt(formDataToSend);
      const { category, amount, date } = response.data.data;
      
      setFormData(prev => ({
        ...prev,
        category: category || prev.category,
        amount: amount ? String(amount) : prev.amount,
        date: date || prev.date
      }));

      toast.update(toastId, { render: 'Receipt scanned successfully!', type: 'success', isLoading: false, autoClose: 3000 });
    } catch (error) {
      console.error('Scan error:', error);
      toast.update(toastId, { render: error.response?.data?.message || 'Failed to scan receipt. Is your Gemini API key valid?', type: 'error', isLoading: false, autoClose: 5000 });
    } finally {
      setIsScanning(false);
      e.target.value = null; // reset input
    }
  };

  // Filter Logic
  const availableYears = [...new Set(expenses.map(item => new Date(item.date).getFullYear()))].sort((a, b) => b - a);

  const filteredExpenses = expenses.filter(item => {
    const itemDate = new Date(item.date);
    const itemYear = itemDate.getFullYear();
    const itemMonth = itemDate.getMonth() + 1;

    if (selectedYear && itemYear !== parseInt(selectedYear)) return false;
    if (selectedYear && selectedMonth && itemMonth !== parseInt(selectedMonth)) return false;
    return true;
  });

  // Calculate totals
  const totalExpense = filteredExpenses.reduce((sum, item) => sum + item.amount, 0);

  // Prepare pie chart data - by category
  const expenseByCategory = {};
  filteredExpenses.forEach(expense => {
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
  filteredExpenses.forEach(expense => {
    const dateKey = new Date(expense.date).toISOString().split('T')[0];
    if (!expenseByDate[dateKey]) {
      expenseByDate[dateKey] = 0;
    }
    expenseByDate[dateKey] += expense.amount;
  });

  const lineChartData = Object.entries(expenseByDate)
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .slice(-selectedYear ? undefined : 30)
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Expenses</h1>
          <p className="text-slate-400">Track your spending</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              if (!e.target.value) setSelectedMonth('');
            }}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-rose-500 transition-colors"
          >
            <option value="">All Time</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            disabled={!selectedYear}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-rose-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">All Months</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
              <option key={month} value={month}>
                {new Date(0, month - 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>

          <button
            onClick={handleDownload}
            disabled={expenses.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-700/50 text-slate-300 rounded-xl 
                hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Excel
          </button>
        </div>
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
        {/* Add/Edit Expense Form */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">
              {editMode ? 'Edit Expense' : 'Add New Expense'}
            </h3>
            {editMode && (
              <button
                onClick={cancelEdit}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* AI Receipt Scanner */}
            {!editMode && (
              <div className="flex items-center justify-between p-4 bg-rose-500/5 rounded-xl border border-rose-500/20">
                <div>
                  <h4 className="text-sm font-medium text-rose-400">Magic Scan</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Auto-fill using AI</p>
                </div>
                <div>
                  <input 
                    type="file" 
                    id="receipt-upload" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleScanReceipt}
                    disabled={isScanning || submitting}
                  />
                  <label 
                    htmlFor="receipt-upload"
                    className={`flex items-center gap-2 px-4 py-2 ${isScanning || submitting ? 'bg-slate-700 cursor-not-allowed text-slate-500' : 'bg-rose-500 text-white hover:bg-rose-600 cursor-pointer shadow-lg shadow-rose-500/25'} rounded-lg transition-all text-sm font-medium`}
                  >
                    {isScanning ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Scanning...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Upload Image
                      </>
                    )}
                  </label>
                </div>
              </div>
            )}

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

            {/* Currency Selection */}
            <div>
              <label className="block text-slate-400 text-sm font-medium mb-2">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white 
                  focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all appearance-none"
              >
                <option value="USD">USD ($)</option>
                {currencies.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.name} (Rate: {c.rate})
                  </option>
                ))}
              </select>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-slate-400 text-sm font-medium mb-2">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">
                  {formData.currency === 'USD' ? '$' : ''}
                </span>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={`w-full ${formData.currency === 'USD' ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white 
                    placeholder-slate-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all`}
                />
              </div>
              {formData.currency !== 'USD' && (
                <p className="text-xs text-slate-400 mt-1">
                  Will be converted to USD: {formatCurrency(formData.amount / (currencies.find(c => c._id === formData.currency)?.rate || 1))}
                </p>
              )}
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
            {editMode && (
              <button
                type="button"
                onClick={cancelEdit}
                className="w-full py-3.5 bg-slate-700 text-slate-300 font-semibold 
                  rounded-xl hover:bg-slate-600 transition-all"
              >
                Cancel
              </button>
            )}
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

        {filteredExpenses.length > 0 ? (
          <div className="divide-y divide-slate-700/50">
            {filteredExpenses.map((expense) => (
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
                    onClick={() => handleDeleteClick(expense._id)}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleEdit(expense)}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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

      <DeleteModal
        isOpen={deleteModal.show}
        onClose={() => setDeleteModal({ show: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Expense"
        message="Are you sure you want to delete this expense record? This action cannot be undone."
      />
    </div>
  );
};

export default Expense;
