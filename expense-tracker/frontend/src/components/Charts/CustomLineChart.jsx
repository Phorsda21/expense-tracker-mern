import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomLineChart = ({ data, title, lines }) => {
  // Simple dollar formatter for the chart
  const formatDollar = (val) => `$${Number(val).toLocaleString()}`;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-md">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{label}</p>
          {payload.map((item, index) => (
            <p key={index} className="text-sm font-bold" style={{ color: item.color }}>
              {item.name}: {formatDollar(item.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-bold text-white mb-6 px-2">{title}</h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              {lines.map((line, i) => (
                <linearGradient key={i} id={`color${line.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={line.color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={line.color} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" opacity={0.05} vertical={false} />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 1 }} />
            {lines.map((line, i) => (
              <Area
                key={i}
                type="monotone"
                dataKey={line.dataKey}
                stroke={line.color}
                strokeWidth={3}
                fillOpacity={1}
                fill={`url(#color${line.dataKey})`}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CustomLineChart;