import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { CategoryPieChart } from '../charts/CategoryPieChart';
import { MonthlyBarChart } from '../charts/MonthlyBarChart';
import { TrendsLineChart } from '../charts/TrendsLineChart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiTrendingUp, FiShoppingBag, FiActivity, FiBriefcase } from 'react-icons/fi';

export const Analytics = () => {
  const { transactions, savingsGoals, currency } = useApp();

  const expenses = transactions.filter((t) => t.type === 'expense');
  const totalExpensesCount = expenses.length;
  const totalExpensesSum = expenses.reduce((sum, t) => sum + t.amount, 0);

  // 1. Calculate Top Spending Category
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

  // 2. Calculate Monthly Average Spend
  const uniqueMonths = new Set(
    expenses.map((t) => {
      try {
        return new Date(t.date).toISOString().substring(0, 7);
      } catch (e) {
        return '';
      }
    }).filter(Boolean)
  );
  
  const totalMonthsCount = uniqueMonths.size || 1;
  const monthlyAverageSpend = totalExpensesSum / totalMonthsCount;

  // 3. Balance Over Time (Cumulative Balance Progression)
  const getBalanceOverTimeData = () => {
    const monthlyNetMap = transactions.reduce((acc, curr) => {
      const monthStr = curr.date.substring(0, 7);
      if (!acc[monthStr]) acc[monthStr] = 0;
      acc[monthStr] += curr.type === 'income' ? curr.amount : -curr.amount;
      return acc;
    }, {});

    const sortedMonths = Object.keys(monthlyNetMap).sort();
    let cumulativeNet = 0;

    return sortedMonths.map((m) => {
      cumulativeNet += monthlyNetMap[m];
      let monthLabel = m;
      try {
        const d = new Date(m + '-01');
        monthLabel = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      } catch (e) {}
      
      return {
        month: monthLabel,
        "Balance": cumulativeNet
      };
    });
  };

  const balanceData = getBalanceOverTimeData();

  const CustomNetTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      return (
        <div className="bg-slate-950 border border-slate-800 text-white p-2.5 rounded-lg shadow-lg text-[10px] font-bold">
          <p className="mb-1 text-slate-400">Balance</p>
          <p className="text-emerald-450">{currency}{val.toLocaleString('en-IN')}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-900">
        <div>
          <h2 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Analytics</h2>
          <p className="text-[10px] text-slate-500 mt-0.5">Understand your spending habits.</p>
        </div>
      </div>

      {/* 1. METRICS HIGHLIGHT ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Top category card */}
        <div className="saas-card p-4 flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 rounded-lg shrink-0">
            <FiShoppingBag className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Top Spending Category</p>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5 truncate">
              {highestCategoryName}
            </h3>
            <p className="text-[9px] text-slate-450 mt-0.5 font-bold">
              Spent: {currency}{highestCategoryAmount.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Monthly Average card */}
        <div className="saas-card p-4 flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0">
            <FiTrendingUp className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Average Monthly Spending</p>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
              {currency}{monthlyAverageSpend.toLocaleString('en-IN')}
            </h3>
            <p className="text-[9px] text-slate-450 mt-0.5 font-bold">
              Over {totalMonthsCount} months
            </p>
          </div>
        </div>

        {/* Total Transactions card */}
        <div className="saas-card p-4 flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
            <FiActivity className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Total Transactions</p>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
              {totalExpensesCount} Payments
            </h3>
            <p className="text-[9px] text-slate-450 mt-0.5 font-bold">
              Total spent: {currency}{totalExpensesSum.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Goals Summary Portfolio value card */}
        <div className="saas-card p-4 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">
            <FiBriefcase className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Goals Saved</p>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
              {savingsGoals.length} Targets
            </h3>
            <p className="text-[9px] text-slate-450 mt-0.5 font-bold">
              Saved: {currency}{savingsGoals.reduce((sum, g) => sum + g.currentSaved, 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      {/* 2. CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Income vs Expenses Chart */}
        <div className="saas-card p-4">
          <div className="mb-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Income vs Expenses</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Monthly comparison of income vs expenses</p>
          </div>
          <MonthlyBarChart transactions={transactions} />
        </div>

        {/* Daily Spending Line Chart */}
        <div className="saas-card p-4">
          <div className="mb-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Daily Spending</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Daily spending trend for this month</p>
          </div>
          <TrendsLineChart transactions={transactions} />
        </div>
      </div>

      {/* 3. ADDITIONAL DETAIL ANALYSIS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        
        {/* Balance Over Time Line Chart */}
        <div className="lg:col-span-3 saas-card p-4 flex flex-col justify-between">
          <div className="mb-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Balance Over Time</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Cumulative running balance sum history</p>
          </div>

          <div className="h-48">
            {balanceData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400 text-xs font-semibold">
                No transactions recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={balanceData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800/40" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${currency}${v >= 1000 ? v / 1000 + 'k' : v}`} />
                  <Tooltip content={<CustomNetTooltip />} />
                  <Area type="monotone" dataKey="Balance" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorBalance)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Spending by Category breakdown */}
        <div className="lg:col-span-2 saas-card p-4 flex flex-col justify-between">
          <div className="mb-2">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Spending by Category</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Share breakdown of total monthly spending</p>
          </div>
          <div className="h-48 flex items-center justify-center">
            <CategoryPieChart transactions={transactions} />
          </div>
        </div>

      </div>
    </motion.div>
  );
};
export default Analytics;
