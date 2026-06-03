import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export const CategoryPieChart = ({ transactions = [] }) => {
  
  // 1. Filter out only 'expense' items
  const expenses = transactions.filter((t) => t.type === 'expense');

  // 2. Aggregate expenses by Category
  const categoryMap = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  // 3. Transform map into array suitable for Recharts
  const chartData = Object.keys(categoryMap).map((cat) => ({
    name: cat,
    value: categoryMap[cat],
  }));

  // Define premium styling colors for each category
  const COLORS = {
    Food: '#8b5cf6',          // Purple
    Shopping: '#3b82f6',      // Blue
    Travel: '#14b8a6',        // Teal
    Bills: '#f97316',         // Orange
    Entertainment: '#ec4899',  // Pink
    Education: '#6366f1',      // Indigo
    Salary: '#10b981'         // Emerald
  };

  const DEFAULT_COLOR = '#94a3b8'; // Slate grey for fallback

  // Calculate total expense to show percentages in labels/legend
  const totalExpenseSum = chartData.reduce((sum, item) => sum + item.value, 0);

  // Custom tooltips styling
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = totalExpenseSum > 0 ? ((data.value / totalExpenseSum) * 100).toFixed(1) : 0;
      return (
        <div className="bg-slate-900 border border-slate-800 text-white p-3 rounded-xl shadow-lg text-xs font-semibold">
          <p className="mb-1 text-slate-400">{data.name}</p>
          <p className="text-sm text-brand-400">
            ₹{data.value.toLocaleString('en-IN')} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 w-full min-h-[220px]">
      
      {/* DONUT PIE PLOT CONTAINER */}
      <div className="w-full md:w-1/2 h-[200px]">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm font-medium">
            No expense data to display
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.name] || DEFAULT_COLOR} 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* DETAILED LEGEND LABELS LIST */}
      <div className="w-full md:w-1/2 flex flex-col gap-2">
        {chartData.length === 0 ? (
          <p className="text-xs text-slate-500 text-center md:text-left">Add expenses to unlock category analysis.</p>
        ) : (
          chartData
            .sort((a, b) => b.value - a.value) // Sort highest spends first
            .map((item, idx) => {
              const pct = totalExpenseSum > 0 ? ((item.value / totalExpenseSum) * 100).toFixed(0) : 0;
              const catColor = COLORS[item.name] || DEFAULT_COLOR;
              return (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm" 
                      style={{ backgroundColor: catColor }} 
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-350 truncate max-w-[120px]">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      ₹{item.value.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold w-7 text-right">
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
};
export default CategoryPieChart;
