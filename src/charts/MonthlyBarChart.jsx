import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useApp } from '../context/AppContext';

export const MonthlyBarChart = ({ transactions = [] }) => {
  const { currency } = useApp();

  const getMonthLabel = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('en-US', { month: 'short' });
    } catch (e) {
      return 'Unknown';
    }
  };

  const monthlyDataMap = transactions.reduce((acc, curr) => {
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

  const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const chartData = Object.values(monthlyDataMap).sort((a, b) => {
    return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950 border border-slate-800 text-white p-3 rounded-lg shadow-lg text-[11px] space-y-1">
          <p className="font-bold text-slate-400 border-b border-slate-800 pb-1 mb-1">{label}</p>
          {payload.map((item, idx) => (
            <p key={idx} style={{ color: item.color }} className="font-bold">
              {item.name}: {currency}{item.value.toLocaleString('en-IN')}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full min-h-[220px]">
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-full text-slate-400 text-xs font-semibold">
          No monthly data to display. Add transactions to generate.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            barGap={6}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="#e2e8f0" 
              className="dark:stroke-slate-800/40"
            />
            <XAxis 
              dataKey="month" 
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${currency}${v >= 1000 ? v / 1000 + 'k' : v}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.03)' }} />
            <Legend 
              iconType="circle" 
              iconSize={6}
              wrapperStyle={{ paddingTop: 10, fontSize: 10, fontWeight: 600 }}
            />
            <Bar 
              name="Income"
              dataKey="Income" 
              fill="#10b981" 
              radius={[3, 3, 0, 0]} 
              maxBarSize={30}
            />
            <Bar 
              name="Expenses"
              dataKey="Expenses" 
              fill="#f43f5e" 
              radius={[3, 3, 0, 0]} 
              maxBarSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
export default MonthlyBarChart;
