import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { CategoryPieChart } from '../charts/CategoryPieChart';
import { MonthlyBarChart } from '../charts/MonthlyBarChart';
import { TrendsLineChart } from '../charts/TrendsLineChart';
import { FiTrendingUp, FiShoppingBag, FiLayers, FiActivity } from 'react-icons/fi';

export const Analytics = () => {
  const { transactions } = useApp();

  // 1. Separate income and expenses
  const expenses = transactions.filter((t) => t.type === 'expense');
  const totalExpensesCount = expenses.length;
  const totalExpensesSum = expenses.reduce((sum, t) => sum + t.amount, 0);

  // 2. Calculate Highest spending category
  const categorySummary = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  let highestCategoryName = 'None';
  let highestCategoryAmount = 0;
  
  Object.keys(categorySummary).forEach((cat) => {
    if (categorySummary[cat] > highestCategoryAmount) {
      highestCategoryAmount = categorySummary[cat];
      highestCategoryName = cat;
    }
  });

  // 3. Calculate Monthly Average Spend
  // Get all unique months present in transactions
  const uniqueMonths = new Set(
    expenses.map((t) => {
      try {
        return new Date(t.date).toISOString().substring(0, 7); // 'YYYY-MM'
      } catch (e) {
        return '';
      }
    }).filter(Boolean)
  );
  
  const totalMonthsCount = uniqueMonths.size || 1;
  const monthlyAverageSpend = totalExpensesSum / totalMonthsCount;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* STATS HIGHLIGHT WIDGETS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Highest Spending Category */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-455 rounded-2xl shrink-0">
            <FiShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Top Category</p>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              {highestCategoryName}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Total spent: ₹{highestCategoryAmount.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Monthly Average Spend */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-brand-100 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 rounded-2xl shrink-0">
            <FiTrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Monthly Average</p>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              ₹{monthlyAverageSpend.toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Calculated across {totalMonthsCount} month(s)
            </p>
          </div>
        </div>

        {/* Total Spends Count */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl shrink-0">
            <FiActivity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Transactions</p>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              {totalExpensesCount} Transactions
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Total spent: ₹{totalExpensesSum.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      {/* CHART SECTION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Monthly Comparison (Bar Chart) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Monthly Comparison</h3>
            <p className="text-xs text-slate-500 mt-0.5">Monthly breakdown of income vs expenses</p>
          </div>
          <MonthlyBarChart transactions={transactions} />
        </div>

        {/* Daily Outlay Trends (Line Chart) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Daily Trends</h3>
            <p className="text-xs text-slate-500 mt-0.5">Daily spending trend for this month</p>
          </div>
          <TrendsLineChart transactions={transactions} />
        </div>
      </div>

      {/* Category breakdown pie chart (Full Width) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Expenses by Category</h3>
          <p className="text-xs text-slate-500 mt-0.5">Percentage share of monthly spending</p>
        </div>
        <div className="max-w-3xl mx-auto py-4">
          <CategoryPieChart transactions={transactions} />
        </div>
      </div>
    </motion.div>
  );
};
export default Analytics;
