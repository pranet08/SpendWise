import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../context/AppContext';

export const TrendsLineChart = ({ transactions = [] }) => {
  const { currency } = useApp();
  
  const expenses = transactions.filter((t) => t.type === 'expense');

  const dailyMap = expenses.reduce((acc, curr) => {
    const dateStr = curr.date;
    acc[dateStr] = (acc[dateStr] || 0) + curr.amount;
    return acc;
  }, {});

  const chartData = Object.keys(dailyMap)
    .map((dateKey) => {
      let formattedLabel = dateKey;
      try {
        const dateObj = new Date(dateKey);
        formattedLabel = dateObj.toLocaleString('en-US', { month: 'short', day: 'numeric' });
      } catch (e) {}

      return {
        rawDate: dateKey,
        date: formattedLabel,
        Amount: dailyMap[dateKey]
      };
    })
    .sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950 border border-slate-800 text-white p-2.5 rounded-lg shadow-lg text-[10px] font-bold">
          <p className="mb-1 text-slate-400 font-semibold">{data.date}</p>
          <p className="text-brand-400">{currency}{data.Amount.toLocaleString('en-IN')}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full min-h-[220px]">
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-full text-slate-400 text-xs font-semibold">
          No spending data available. Add expense transactions to track trends.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="#e2e8f0" 
              className="dark:stroke-slate-800/40"
            />

            <XAxis 
              dataKey="date" 
              tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis 
              tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${currency}${v >= 1000 ? v / 1000 + 'k' : v}`}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="Amount"
              stroke="#6366f1"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorAmount)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
export default TrendsLineChart;
