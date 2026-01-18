
import { useState, useEffect } from 'react';
import { API, formatCurrency } from '../../utils/helper';
import DeleteModal from '../../components/DeleteModal';
import { toast } from 'react-toastify';

const Currency = () => {
    const [currencies, setCurrencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        rate: ''
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchCurrencies();
    }, []);

    const fetchCurrencies = async () => {
        try {
            const response = await API.getCurrencies();
            setCurrencies(response.data);
        } catch (error) {
            console.error('Fetch currency error:', error);
            toast.error('Failed to load currencies');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Please enter currency name');
            return;
        }
        if (!formData.rate || parseFloat(formData.rate) <= 0) {
            toast.error('Please enter a valid exchange rate');
            return;
        }

        setSubmitting(true);
        try {
            if (editingId) {
                await API.updateCurrency(editingId, {
                    name: formData.name,
                    rate: parseFloat(formData.rate)
                });
                toast.success('Currency updated successfully');
                setEditingId(null);
            } else {
                await API.addCurrency({
                    name: formData.name,
                    rate: parseFloat(formData.rate)
                });
                toast.success('Currency added successfully');
            }

            setFormData({ name: '', rate: '' });
            fetchCurrencies();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save currency');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (currency) => {
        setFormData({ name: currency.name, rate: currency.rate });
        setEditingId(currency._id);
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
            await API.deleteCurrency(deleteModal.id);
            toast.success('Currency deleted');
            fetchCurrencies();
            setDeleteModal({ show: false, id: null });
        } catch (error) {
            toast.error('Failed to delete currency');
        }
    };

    const handleCancelEdit = () => {
        setFormData({ name: '', rate: '' });
        setEditingId(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Custom Currencies</h1>
                    <p className="text-slate-400">Manage your custom currencies and exchange rates</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Add/Edit Currency Form */}
                <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 h-fit">
                    <h3 className="text-lg font-semibold text-white mb-6">
                        {editingId ? 'Edit Currency' : 'Add New Currency'}
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name Input */}
                        <div>
                            <label className="block text-slate-400 text-sm font-medium mb-2">Currency Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Euro, Yen"
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white 
                  placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                            />
                        </div>

                        {/* Rate Input */}
                        <div>
                            <label className="block text-slate-400 text-sm font-medium mb-2">Exchange Rate (1 USD = ?)</label>
                            <p className="text-xs text-slate-500 mb-2">How many units of this currency equal 1 USD?</p>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={formData.rate}
                                    onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.0001"
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white 
                    placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                />
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold 
                    rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
                            >
                                {submitting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    editingId ? 'Update Currency' : 'Add Currency'
                                )}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="px-6 py-3.5 bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-600 transition-all"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Currency List */}
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
                    <div className="p-4 border-b border-slate-700/50">
                        <h3 className="text-lg font-semibold text-white">Your Currencies</h3>
                    </div>

                    {currencies.length > 0 ? (
                        <div className="divide-y divide-slate-700/50">
                            {currencies.map((currency) => (
                                <div
                                    key={currency._id}
                                    className="flex items-center justify-between p-4 hover:bg-slate-700/20 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-xl font-bold text-indigo-400">
                                            {currency.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{currency.name}</p>
                                            <p className="text-slate-500 text-sm">Rate: {currency.rate}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEdit(currency)}
                                            className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(currency._id)}
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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-slate-400">No custom currencies</p>
                            <p className="text-slate-600 text-sm mt-1">Add a currency to use it in transactions</p>
                        </div>
                    )}
                </div>

                <DeleteModal
                    isOpen={deleteModal.show}
                    onClose={() => setDeleteModal({ show: false, id: null })}
                    onConfirm={confirmDelete}
                    title="Delete Currency"
                    message="Are you sure you want to delete this currency? This might affect transactions using it."
                />
            </div>
        </div>
    );
};

export default Currency;
