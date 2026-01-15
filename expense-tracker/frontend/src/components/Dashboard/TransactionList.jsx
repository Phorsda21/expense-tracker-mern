import { formatCurrency, formatDate } from '../../utils/helper';

const TransactionList = ({ transactions, title, emptyMessage }) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="py-12 text-center">
          <div className="w-16 h-16 mx-auto bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-slate-400">{emptyMessage || 'No transactions yet'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {transactions.map((transaction, index) => (
          <div
            key={transaction._id || index}
            className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl 
              hover:bg-slate-700/50 transition-all duration-200 transaction-item"
          >
            <div className="flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl
                ${transaction.type === 'income' 
                  ? 'bg-emerald-500/20' 
                  : 'bg-rose-500/20'
                }`}>
                {transaction.icon || (transaction.type === 'income' ? '💰' : '🛒')}
              </div>
              <div>
                <p className="text-white font-medium">
                  {transaction.source || transaction.category || transaction.title}
                </p>
                <p className="text-slate-500 text-sm">{formatDate(transaction.date)}</p>
              </div>
            </div>
            <p className={`font-semibold text-lg ${
              transaction.type === 'income' 
                ? 'text-emerald-400' 
                : 'text-rose-400'
            }`}>
              {transaction.type === 'income' ? '+' : '-'}
              {formatCurrency(transaction.amount)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionList;
