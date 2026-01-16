import { formatCurrency } from '../../utils/helper';

const InfoCard = ({ title, value, icon, color = 'indigo', trend, trendValue }) => {
  const colorClasses = {
    indigo: {
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
      iconBg: 'bg-indigo-500/20',
      iconColor: 'text-indigo-400',
      text: 'text-white',
    },
    green: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
      text: 'text-white',
    },
    red: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      iconBg: 'bg-rose-500/20',
      iconColor: 'text-rose-400',
      text: 'text-white',
    }
  };

  const classes = colorClasses[color] || colorClasses.indigo;

  return (
    <div className={`${classes.bg} ${classes.border} border backdrop-blur-md rounded-[2rem] p-7 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/20 group`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1 uppercase tracking-tight">{title}</p>
          <h3 className={`text-3xl font-bold ${classes.text} tracking-tight`}>
            {formatCurrency(value)}
          </h3>
          
          {trend !== undefined && (
            <div className="flex items-center gap-1.5 mt-3">
              <span className={`flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {trend === 'up' ? '↑' : '↓'} {trendValue}%
              </span>
              <span className="text-slate-500 text-xs font-medium">vs last month</span>
            </div>
          )}
        </div>
        
        <div className={`${classes.iconBg} ${classes.iconColor} w-14 h-14 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default InfoCard;