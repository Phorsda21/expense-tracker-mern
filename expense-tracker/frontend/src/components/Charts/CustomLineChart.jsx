import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { formatCurrency } from '../../utils/helper';

const CustomLineChart = ({ 
  data, 
  title, 
  lines = [{ dataKey: 'amount', color: '#6366f1', name: 'Amount' }],
  showArea = true 
}) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
          <p className="text-slate-400 text-sm mb-2">{label}</p>
          {payload.map((item, index) => (
            <p key={index} className="font-semibold" style={{ color: item.color }}>
              {item.name}: {formatCurrency(item.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center text-slate-500">
          No data available
        </div>
      </div>
    );
  }

  const ChartComponent = showArea ? AreaChart : LineChart;

  return (
    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ChartComponent data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              {lines.map((line, index) => (
                <linearGradient key={index} id={`gradient-${line.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={line.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={line.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={{ stroke: '#334155' }}
              tickLine={false}
            />
            <YAxis 
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={{ stroke: '#334155' }}
              tickLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            {lines.map((line, index) => (
              showArea ? (
                <Area
                  key={index}
                  type="monotone"
                  dataKey={line.dataKey}
                  name={line.name}
                  stroke={line.color}
                  strokeWidth={2}
                  fill={`url(#gradient-${line.dataKey})`}
                />
              ) : (
                <Line
                  key={index}
                  type="monotone"
                  dataKey={line.dataKey}
                  name={line.name}
                  stroke={line.color}
                  strokeWidth={2}
                  dot={{ fill: line.color, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              )
            ))}
          </ChartComponent>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      {lines.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-6">
          {lines.map((line, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: line.color }}
              />
              <span className="text-slate-400 text-sm">{line.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomLineChart;
