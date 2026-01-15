import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CHART_COLORS, formatCurrency } from '../../utils/helper';

const CustomPieChart = ({ data, title, dataKey = 'amount', nameKey = 'name' }) => {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium">{item.name}</p>
          <p className="text-indigo-400">{formatCurrency(item.value)}</p>
          <p className="text-slate-400 text-sm">{item.payload.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
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

  return (
    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={2}
              labelLine={false}
              label={renderCustomizedLabel}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2 max-h-24 overflow-y-auto">
        {data.slice(0, 6).map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
            />
            <span className="text-slate-400 truncate">{item[nameKey]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomPieChart;
