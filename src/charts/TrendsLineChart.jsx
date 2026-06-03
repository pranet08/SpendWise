import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const TrendsLineChart = ({ transactions = [] }) => {
  
  // 1. Filter out only expenses
  const expenses = transactions.filter((t) => t.type === 'expense');

  // 2. Group expenses by calendar date
  const dailyMap = expenses.reduce((acc, curr) => {
    const dateStr = curr.date; // Format is 'YYYY-MM-DD'
    acc[dateStr] = (acc[dateStr] || 0) + curr.amount;
    return acc;
  }, {});

  // 3. Convert to array and sort chronologically by date keys
  const chartData = Object.keys(dailyMap)
    .map((dateKey) => {
      // Format label to "Month Day": e.g. "2026-06-03" -> "Jun 3"
      let formattedLabel = dateKey;
      try {
        const dateObj = new Date(dateKey);
        formattedLabel = dateObj.toLocaleString('en-US', { month: 'short', day: 'numeric' });
      } catch (e) {
        // Fallback to original key if date parsing fails
      }

      return {
        rawDate: dateKey,
        date: formattedLabel,
        Amount: dailyMap[dateKey]
      };
    })
    .sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));

  // Custom tooltips styling
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-800 text-white p-3 rounded-xl shadow-lg text-xs font-semibold">
          <p className="mb-1 text-slate-400">{data.date}</p>
          <p className="text-sm text-brand-400">₹{data.Amount.toLocaleString('en-IN')}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[280px]">
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-full text-slate-400 text-sm font-medium">
          No spending data available. Add expense transactions to track trends.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            {/* 4. Define SVG Gradient for gradient fill under the line chart */}
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="#e2e8f0" 
              className="dark:stroke-slate-800/60"
            />

            <XAxis 
              dataKey="date" 
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis 
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${v >= 1000 ? v / 1000 + 'k' : v}`}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Line / Area component */}
            <Area
              type="monotone"
              dataKey="Amount"
              stroke="#8b5cf6"
              strokeWidth={2.5}
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
