import axiosInstance from './axiosInstance';

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount || 0);
};

// Format date for display
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Format date for input
export const formatDateForInput = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

// Get today's date formatted for input
export const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

// Download file utility
export const downloadFile = async (url, filename) => {
  try {
    const response = await axiosInstance.get(url, { responseType: 'blob' });
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
    return { success: true };
  } catch (error) {
    console.error('Download error:', error);
    return { success: false, message: 'Download failed' };
  }
};

// API endpoints
export const API = {
  // Auth
  login: (data) => axiosInstance.post('/api/auth/login', data),
  register: (data) => axiosInstance.post('/api/auth/register', data),
  getProfile: () => axiosInstance.get('/api/auth/profile'),

  // Dashboard
  getDashboard: (year, month) => {
    let query = '';
    if (year) query += `?year=${year}`;
    if (month) query += year ? `&month=${month}` : `?month=${month}`;
    return axiosInstance.get(`/api/dashboard${query}`);
  },

  // Income
  getAllIncome: () => axiosInstance.get('/api/income'),
  addIncome: (data) => axiosInstance.post('/api/income', data),
  deleteIncome: (id) => axiosInstance.delete(`/api/income/${id}`),
  updateIncome: (id, data) => axiosInstance.put(`/api/income/${id}`, data),
  downloadIncomeExcel: () => downloadFile('/api/income/download/excel', 'income_report.xlsx'),

  // Expense
  getAllExpenses: () => axiosInstance.get('/api/expense'),
  addExpense: (data) => axiosInstance.post('/api/expense', data),
  deleteExpense: (id) => axiosInstance.delete(`/api/expense/${id}`),
  updateExpense: (id, data) => axiosInstance.put(`/api/expense/${id}`, data),
  downloadExpenseExcel: () => downloadFile('/api/expense/download/excel', 'expense_report.xlsx'),

  // Custom Currencies
  addCurrency: (data) => axiosInstance.post('/api/currency', data),
  getCurrencies: () => axiosInstance.get('/api/currency'),
  deleteCurrency: (id) => axiosInstance.delete(`/api/currency/${id}`),
  updateCurrency: (id, data) => axiosInstance.put(`/api/currency/${id}`, data),

  // Receipt Scanning
  scanReceipt: (formData) => axiosInstance.post('/api/receipt/scan', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 30000, // Increased timeout to 30 seconds for AI processing
  }),

  // Bank Statement Import
  parseStatement: (formData) => axiosInstance.post('/api/statement/parse', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 60000, // 60 seconds for large PDFs
  }),
  importTransactions: (data) => axiosInstance.post('/api/statement/import', data),
};

// Income emojis
export const INCOME_EMOJIS = [
  '💰', '💵', '💸', '🏦', '💳', '📈', '💼', '🎯', '🏠', '🎁',
  '💎', '🪙', '📊', '🤑', '💲', '🏆', '⭐', '🎰', '📱', '💻'
];

// Expense emojis  
export const EXPENSE_EMOJIS = [
  '🛒', '🍔', '🚗', '🏠', '⚡', '📱', '🎬', '✈️', '💊', '📚',
  '👕', '🎮', '☕', '🍕', '🚌', '🏥', '💇', '🎵', '🐕', '🎂'
];

// Chart colors
export const CHART_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#14b8a6', // Teal
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
];

export default API;
