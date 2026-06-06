import { useEffect } from 'react';

const DeleteModal = ({ isOpen, onClose, onConfirm, title, message, type = 'danger' }) => {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const accentFrom = type === 'danger' ? 'from-rose-500'     : 'from-indigo-500';
    const accentTo   = type === 'danger' ? 'to-rose-600'       : 'to-indigo-600';
    const shadow     = type === 'danger' ? 'shadow-rose-500/25' : 'shadow-indigo-500/25';
    const iconBg     = type === 'danger' ? 'bg-rose-500/10 text-rose-400' : 'bg-indigo-500/10 text-indigo-400';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-700/50 w-full max-w-sm p-6 animate-fadeIn">
                <div className="flex flex-col items-center text-center">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${iconBg}`}>
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">{title || 'Delete Item'}</h3>
                    <p className="text-slate-400 mb-6">
                        {message || 'Are you sure you want to delete this item? This action cannot be undone.'}
                    </p>

                    <div className="flex gap-3 w-full">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-1 px-4 py-2.5 text-white rounded-xl font-medium transition-all shadow-lg
                                bg-gradient-to-r ${accentFrom} ${accentTo} hover:opacity-90 ${shadow}`}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteModal;
