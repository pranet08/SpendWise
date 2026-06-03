import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const MonthlyBarChart = ({ transactions = [] }) => {
  
  // 1. Helper to format date strings into short month labels: e.g. "2026-05-12" -> "May"
  const getMonthLabel = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('en-US', { month: 'short' }); // Returns 'Jan', 'Feb', etc.
    } catch (e) {
      return 'Unknown';
    }
  };

  // 2. Aggregate transactions by month and category type
  const monthlyDataMap = transactions.reduce((acc, curr) => {
    // Group key is the short month name
    const month = getMonthLabel(curr.date);
    if (!acc[month]) {
      acc[month] = { month, Income: 0, Expenses: 0 };
    }
    
    if (curr.type === 'income') {
      acc[month].Income += curr.amount;
    } else {
      acc[month].Expenses += curr.amount;
    }
    
    return acc;
  }, {});

  // 3. Convert aggregate map into a sorted array of monthly details
  // We'll order months by actual chronological appearance in transactions
  const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const chartData = Object.values(monthlyDataMap).sort((a, b) => {
    return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
  });

  // Custom tooltips styling
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 text-white p-4 rounded-xl shadow-lg text-xs space-y-1.5">
          <p className="font-bold text-slate-300 border-b border-slate-800 pb-1 mb-1.5">{label}</p>
          {payload.map((item, idx) => (
            <p key={idx} style={{ color: item.color }} className="font-semibold">
              {item.name}: ₹{item.value.toLocaleString('en-IN')}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[280px]">
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-full text-slate-400 text-sm font-medium">
          No monthly data to display. Add transactions to generate.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            barGap={8}
          >
            {/* Subtle grid lines */}
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="#e2e8f0" 
              className="dark:stroke-slate-800/60"
            />
            
            {/* X Axis */}
            <XAxis 
              dataKey="month" 
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />

            {/* Y Axis */}
            <YAxis 
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${v >= 1000 ? v / 1000 + 'k' : v}`}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }} />
            
            <Legend 
              iconType="circle" 
              iconSize={8}
              wrapperStyle={{ paddingTop: 15, fontSize: 12, fontWeight: 500 }}
            />

            {/* Income Bar (Emerald Green) */}
            <Bar 
              name="Income"
              dataKey="Income" 
              fill="#10b981" 
              radius={[4, 4, 0, 0]} 
              maxBarSize={40}
            />

            {/* Expense Bar (Rose Red) */}
            <Bar 
              name="Expenses"
              dataKey="Expenses" 
              fill="#f43f5e" 
              radius={[4, 4, 0, 0]} 
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
export default MonthlyBarChart;
