import { useState, useEffect } from 'react';
import { API, formatCurrency, formatDate, getTodayDate, formatDateForInput } from '../../utils/helper';
import EmojiPicker from '../../components/EmojiPicker';
import CustomBarChart from '../../components/Charts/CustomBarChart';
import CustomPieChart from '../../components/Charts/CustomPieChart';

import { toast } from 'react-toastify';

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    icon: '💰',
    source: '',
    amount: '',
    date: getTodayDate(),
    currency: 'USD'
  });
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchIncomes();
    fetchCurrencies();
  }, []);

  const fetchIncomes = async () => {
    try {
      const response = await API.getAllIncome();
      setIncomes(response.data);
    } catch (error) {
      console.error('Fetch income error:', error);
      toast.error('Failed to load income data');
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

    if (!formData.source.trim()) {
      toast.error('Please enter income source');
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
        await API.updateIncome(editId, {
          ...formData,
          amount: finalAmount
        });
        toast.success('Income updated successfully!');
        setEditMode(false);
        setEditId(null);
      } else {
        await API.addIncome({
          ...formData,
          amount: finalAmount
        });
        toast.success('Income added successfully!');
      }

      setFormData({
        icon: '💰',
        source: '',
        amount: '',
        date: getTodayDate(),
        currency: 'USD'
      });
      fetchIncomes();
    } catch (error) {
      toast.error(error.response?.data?.message || (editMode ? 'Failed to update income' : 'Failed to add income'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditMode(true);
    setEditId(item._id);
    setFormData({
      icon: item.icon,
      source: item.source,
      amount: item.amount,
      date: formatDateForInput(item.date),
      currency: 'USD' // Reset to USD as amount is stored in USD
    });
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditId(null);
    setFormData({
      icon: '💰',
      source: '',
      amount: '',
      date: getTodayDate(),
      currency: 'USD'
    });
  };

  const [confirmingId, setConfirmingId] = useState(null);

  const confirmDelete = async (id) => {
    try {
      await API.deleteIncome(id);
      toast.success('Income deleted');
      fetchIncomes();
      setConfirmingId(null);
    } catch (error) {
      toast.error('Failed to delete income');
    }
  };

  const handleDownload = async () => {
    const result = await API.downloadIncomeExcel();
    if (result.success) {
      toast.success('Download started!');
    } else {
      toast.error(result.message);
    }
  };

  // Filter Logic
  const availableYears = [...new Set(incomes.map(item => new Date(item.date).getFullYear()))].sort((a, b) => b - a);

  const filteredIncomes = incomes.filter(item => {
    const itemDate = new Date(item.date);
    const itemYear = itemDate.getFullYear();
    const itemMonth = itemDate.getMonth() + 1;

    if (selectedYear && itemYear !== parseInt(selectedYear)) return false;
    if (selectedYear && selectedMonth && itemMonth !== parseInt(selectedMonth)) return false;
    return true;
  });

  // Calculate totals
  const totalIncome = filteredIncomes.reduce((sum, item) => sum + item.amount, 0);

  // Prepare chart data
  const incomeBySource = {};
  const incomeByDate = {}; // Group by date

  filteredIncomes.forEach(income => {
    // By Source
    if (!incomeBySource[income.source]) {
      incomeBySource[income.source] = 0;
    }
    incomeBySource[income.source] += income.amount;

    // By Date
    const dateKey = new Date(income.date).toISOString().split('T')[0];
    if (!incomeByDate[dateKey]) {
      incomeByDate[dateKey] = { amount: 0, sources: [] };
    }
    incomeByDate[dateKey].amount += income.amount;
    incomeByDate[dateKey].sources.push({ source: income.source, amount: income.amount });
  });

  const sourceChartData = Object.entries(incomeBySource).map(([source, amount]) => ({
    name: source,
    amount,
    percentage: totalIncome > 0 ? ((amount / totalIncome) * 100).toFixed(1) : 0
  })).sort((a, b) => b.amount - a.amount);

  const dateChartData = Object.entries(incomeByDate)
    .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
    .map(([date, data]) => ({
      name: new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      amount: data.amount,
      incomeSources: data.sources // Pass sources to chart data
    }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Helper to get currency symbol or name
  const getCurrencyLabel = () => {
    if (formData.currency === 'USD') return '$';
    const curr = currencies.find(c => c._id === formData.currency);
    return curr ? curr.name : '$';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Income</h1>
          <p className="text-slate-400">Manage your income sources</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              if (!e.target.value) setSelectedMonth('');
            }}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500 transition-colors"
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
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            disabled={incomes.length === 0}
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

      {/* Total Income Card */}
      <div className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 rounded-2xl p-6 border border-emerald-500/20">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Total Income</p>
            <p className="text-3xl font-bold text-emerald-400">{formatCurrency(totalIncome)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add/Edit Income Form */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">
              {editMode ? 'Edit Income' : 'Add New Income'}
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
            {/* Emoji Picker */}
            <div>
              <label className="block text-slate-400 text-sm font-medium mb-3">Select Icon</label>
              <EmojiPicker
                selectedEmoji={formData.icon}
                onSelect={(emoji) => setFormData({ ...formData, icon: emoji })}
              />
            </div>

            {/* Source Input */}
            <div>
              <label className="block text-slate-400 text-sm font-medium mb-2">Income Source</label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="e.g., Salary, Freelance, Investment"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white 
                  placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            {/* Currency Selection */}
            <div>
              <label className="block text-slate-400 text-sm font-medium mb-2">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white 
                  focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none"
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
                    placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all`}
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
                  focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold 
                rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
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
                  Add Income
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

        {/* Charts */}
        <div className="space-y-6">
          <CustomPieChart
            data={sourceChartData}
            title="Income Distribution"
            dataKey="amount"
            nameKey="name"
          />
        </div>
      </div>

      {/* Bar Chart */}
      <CustomBarChart
        data={dateChartData.slice(selectedYear ? 0 : -6)}
        title={selectedYear ? "Income History" : "Income History (Last 6 Entries)"}
        dataKey="amount"
        color="#10b981"
      />

      {/* Income List */}
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="p-4 border-b border-slate-700/50">
          <h3 className="text-lg font-semibold text-white">Income History</h3>
        </div>

        {filteredIncomes.length > 0 ? (
          <div className="divide-y divide-slate-700/50">
            {filteredIncomes.map((income) => (
              <div
                key={income._id}
                className="flex items-center justify-between p-4 hover:bg-slate-700/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-2xl">
                    {income.icon || '💰'}
                  </div>
                  <div>
                    <p className="text-white font-medium">{income.source}</p>
                    <p className="text-slate-500 text-sm">{formatDate(income.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {confirmingId === income._id ? (
                    /* ── Inline confirmation strip ── */
                    <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/25 rounded-xl px-3 py-1.5 animate-fadeIn">
                      <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" />
                      </svg>
                      <span className="text-rose-300 text-xs font-medium whitespace-nowrap">Delete this?</span>
                      <button
                        onClick={() => setConfirmingId(null)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => confirmDelete(income._id)}
                        className="px-2.5 py-1 text-xs font-medium text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors shadow-sm shadow-rose-500/30"
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    /* ── Normal action buttons ── */
                    <>
                      <p className="text-emerald-400 font-semibold text-lg">
                        +{formatCurrency(income.amount)}
                      </p>
                      <button
                        onClick={() => setConfirmingId(income._id)}
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEdit(income)}
                        className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <p className="text-slate-400">No income records yet</p>
            <p className="text-slate-600 text-sm mt-1">Add your first income using the form above</p>
          </div>
        )}
      </div>


    </div>
  );
};

export default Income;
