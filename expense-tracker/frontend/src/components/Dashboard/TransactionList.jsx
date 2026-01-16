import { formatCurrency, formatDate } from '../../utils/helper';

const TransactionList = ({ transactions, title, emptyMessage }) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="p-8">
        <h3 className="text-xl font-bold text-white mb-6 tracking-tight">{title}</h3>
        <div className="py-12 text-center bg-white/5 rounded-3xl border border-white/5">
          <p className="text-slate-500 font-medium">{emptyMessage || 'No transactions yet'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
       
      </div>
      
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {transactions.map((transaction, index) => (
          <div
            key={transaction._id || index}
            className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all duration-300 group"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 duration-300
                ${transaction.type === 'income' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                {transaction.icon || (transaction.type === 'income' ? '💰' : '🛒')}
              </div>
              <div>
                <p className="text-white font-semibold tracking-tight">
                  {transaction.source || transaction.category || transaction.title}
                </p>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mt-0.5">
                  {formatDate(transaction.date)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-bold text-lg ${transaction.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionList;