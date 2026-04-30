import { useState } from 'react';
import { API, formatCurrency } from '../../utils/helper';
import { toast } from 'react-toastify';

const ImportStatement = () => {
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [selected, setSelected] = useState({});
  const [importResult, setImportResult] = useState(null);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
      setFile(selectedFile);
      setTransactions([]);
      setSelected({});
      setImportResult(null);
    }
  };

  // Parse the PDF with AI
  const handleParse = async () => {
    if (!file) {
      toast.error('Please select a PDF file first');
      return;
    }

    setParsing(true);
    const toastId = toast.loading('AI is analyzing your bank statement...');

    try {
      const formData = new FormData();
      formData.append('statement', file);

      const response = await API.parseStatement(formData);
      const data = response.data.data;

      setTransactions(data);
      // Select all by default
      const allSelected = {};
      data.forEach((_, i) => { allSelected[i] = true; });
      setSelected(allSelected);

      toast.update(toastId, {
        render: `Found ${data.length} transactions!`,
        type: 'success',
        isLoading: false,
        autoClose: 3000
      });
    } catch (error) {
      toast.update(toastId, {
        render: error.response?.data?.message || 'Failed to parse bank statement',
        type: 'error',
        isLoading: false,
        autoClose: 5000
      });
    } finally {
      setParsing(false);
    }
  };

  // Toggle individual transaction
  const toggleSelect = (index) => {
    setSelected(prev => ({ ...prev, [index]: !prev[index] }));
  };

  // Select/Deselect all
  const selectAll = () => {
    const allSelected = {};
    transactions.forEach((_, i) => { allSelected[i] = true; });
    setSelected(allSelected);
  };

  const deselectAll = () => {
    setSelected({});
  };

  // Count selected
  const selectedCount = Object.values(selected).filter(Boolean).length;
  const selectedIncome = transactions.filter((t, i) => selected[i] && t.type === 'income');
  const selectedExpense = transactions.filter((t, i) => selected[i] && t.type === 'expense');
  const totalIncome = selectedIncome.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  const totalExpense = selectedExpense.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  // Import selected transactions
  const handleImport = async () => {
    const toImport = transactions.filter((_, i) => selected[i]);
    if (toImport.length === 0) {
      toast.error('Please select at least one transaction to import');
      return;
    }

    setImporting(true);
    try {
      const response = await API.importTransactions({ transactions: toImport });
      setImportResult(response.data.imported);
      toast.success(response.data.message);
      // Clear state after successful import
      setTransactions([]);
      setSelected({});
      setFile(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to import transactions');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Import Bank Statement</h1>
        <p className="text-slate-400">Upload a PDF bank statement and AI will extract your transactions</p>
      </div>

      {/* Upload Section */}
      <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">
          <span className="mr-2">📄</span>Upload Statement
        </h3>

        <div className="space-y-4">
          {/* Drop Zone */}
          <label
            htmlFor="statement-upload"
            className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl transition-all cursor-pointer
              ${file
                ? 'border-emerald-500/50 bg-emerald-500/5'
                : 'border-slate-600 hover:border-indigo-500/50 hover:bg-indigo-500/5'
              }`}
          >
            {file ? (
              <>
                <svg className="w-10 h-10 text-emerald-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-emerald-400 font-medium">{file.name}</p>
                <p className="text-slate-500 text-sm mt-1">{(file.size / 1024).toFixed(1)} KB — Click to change</p>
              </>
            ) : (
              <>
                <svg className="w-10 h-10 text-slate-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-slate-400 font-medium">Click to upload PDF</p>
                <p className="text-slate-600 text-sm mt-1">Bank statement PDF files only (max 10MB)</p>
              </>
            )}
            <input
              id="statement-upload"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
              disabled={parsing}
            />
          </label>

          {/* Analyze Button */}
          {file && transactions.length === 0 && (
            <button
              onClick={handleParse}
              disabled={parsing}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold
                rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25"
            >
              {parsing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Analyze Statement
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Import Success Message */}
      {importResult && (
        <div className="bg-emerald-500/10 rounded-2xl p-6 border border-emerald-500/20">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-emerald-400 font-semibold text-lg">Import Complete!</p>
              <p className="text-slate-400 text-sm">
                {importResult.income} income and {importResult.expense} expense records added to your account.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Preview Table */}
      {transactions.length > 0 && (
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
          {/* Table Header */}
          <div className="p-4 border-b border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Transactions Found ({transactions.length})
              </h3>
              <p className="text-slate-500 text-sm mt-0.5">
                {selectedCount} selected — {selectedIncome.length} income ({formatCurrency(totalIncome)}) · {selectedExpense.length} expense ({formatCurrency(totalExpense)})
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={selectAll}
                className="px-3 py-1.5 text-sm bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Select All
              </button>
              <button
                onClick={deselectAll}
                className="px-3 py-1.5 text-sm bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Deselect All
              </button>
            </div>
          </div>

          {/* Transaction Rows */}
          <div className="divide-y divide-slate-700/50 max-h-[500px] overflow-y-auto">
            {transactions.map((t, index) => (
              <div
                key={index}
                onClick={() => toggleSelect(index)}
                className={`flex items-center gap-4 p-4 cursor-pointer transition-colors
                  ${selected[index]
                    ? 'bg-slate-700/20 hover:bg-slate-700/30'
                    : 'opacity-50 hover:opacity-70'
                  }`}
              >
                {/* Checkbox */}
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors
                  ${selected[index]
                    ? 'bg-indigo-500 border-indigo-500'
                    : 'border-slate-600'
                  }`}
                >
                  {selected[index] && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0
                  ${t.type === 'income' ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}
                >
                  {t.icon || (t.type === 'income' ? '💰' : '🛒')}
                </div>

                {/* Description & Category */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{t.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-slate-500 text-sm">{t.date}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-500 text-sm">{t.category}</span>
                  </div>
                </div>

                {/* Type Badge */}
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0
                  ${t.type === 'income'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {t.type === 'income' ? 'Income' : 'Expense'}
                </span>

                {/* Amount */}
                <p className={`font-semibold text-lg flex-shrink-0 w-28 text-right
                  ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}
                >
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </p>
              </div>
            ))}
          </div>

          {/* Import Button */}
          <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
            <button
              onClick={handleImport}
              disabled={importing || selectedCount === 0}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold
                rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
            >
              {importing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Import {selectedCount} Selected Transaction{selectedCount !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* How It Works Section */}
      {transactions.length === 0 && !importResult && (
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-4 bg-slate-700/20 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-indigo-400 font-bold text-sm">1</span>
              </div>
              <div>
                <p className="text-white font-medium text-sm">Upload PDF</p>
                <p className="text-slate-500 text-xs mt-0.5">Upload your bank statement PDF file</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-slate-700/20 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-purple-400 font-bold text-sm">2</span>
              </div>
              <div>
                <p className="text-white font-medium text-sm">AI Analyzes</p>
                <p className="text-slate-500 text-xs mt-0.5">AI detects income vs expense automatically</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-slate-700/20 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-emerald-400 font-bold text-sm">3</span>
              </div>
              <div>
                <p className="text-white font-medium text-sm">Select & Import</p>
                <p className="text-slate-500 text-xs mt-0.5">Choose which transactions to import</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportStatement;
