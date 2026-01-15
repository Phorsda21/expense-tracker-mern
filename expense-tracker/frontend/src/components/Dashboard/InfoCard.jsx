import { formatCurrency } from '../../utils/helper';

const InfoCard = ({ title, value, icon, color = 'indigo', trend, trendValue }) => {
  const colorClasses = {
    indigo: {
      bg: 'from-indigo-500/20 to-indigo-600/10',
      border: 'border-indigo-500/20',
      icon: 'from-indigo-500 to-indigo-600',
      text: 'text-indigo-400',
    },
    green: {
      bg: 'from-emerald-500/20 to-emerald-600/10',
      border: 'border-emerald-500/20',
      icon: 'from-emerald-500 to-emerald-600',
      text: 'text-emerald-400',
    },
    red: {
      bg: 'from-rose-500/20 to-rose-600/10',
      border: 'border-rose-500/20',
      icon: 'from-rose-500 to-rose-600',
      text: 'text-rose-400',
    },
    purple: {
      bg: 'from-purple-500/20 to-purple-600/10',
      border: 'border-purple-500/20',
      icon: 'from-purple-500 to-purple-600',
      text: 'text-purple-400',
    },
  };

  const classes = colorClasses[color] || colorClasses.indigo;

  return (
    <div className={`bg-gradient-to-br ${classes.bg} rounded-2xl p-6 border ${classes.border} 
      hover:shadow-lg hover:shadow-${color}-500/10 transition-all duration-300`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
          <p className={`text-2xl lg:text-3xl font-bold ${classes.text}`}>
            {formatCurrency(value)}
          </p>
          
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {trend === 'up' ? (
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              )}
              <span className={`text-sm font-medium ${trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {trendValue}%
              </span>
              <span className="text-slate-500 text-sm">vs last month</span>
            </div>
          )}
        </div>
        
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${classes.icon} flex items-center justify-center shadow-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default InfoCard;
