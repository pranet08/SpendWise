import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { CategoryPieChart } from '../charts/CategoryPieChart';
import { MonthlyBarChart } from '../charts/MonthlyBarChart';
import { TrendsLineChart } from '../charts/TrendsLineChart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiTrendingUp, FiShoppingBag, FiActivity, FiBriefcase, FiCheckSquare } from 'react-icons/fi';

export const Analytics = () => {
  const { transactions, savingsGoals, calculateFinancialHealth, currency } = useApp();

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

  // 3. NET WORTH TREND CALCULATION (Chonological running sum)
  const getNetWorthData = () => {
    // Group transaction net change by month
    const monthlyNetMap = transactions.reduce((acc, curr) => {
      const monthStr = curr.date.substring(0, 7); // 'YYYY-MM'
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
        "Net Worth": cumulativeNet
      };
    });
  };

  const netWorthData = getNetWorthData();

  // Custom tooltips styling for Net Worth
  const CustomNetTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      return (
        <div className="bg-slate-950 border border-slate-800 text-white p-2.5 rounded-lg shadow-lg text-[10px] font-bold">
          <p className="mb-1 text-slate-400">Balance Valuation</p>
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
      className="space-y-5"
    >
      {/* 1. METRICS HIGHLIGHT ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Top category card */}
        <div className="saas-card p-4 flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-lg shrink-0">
            <FiShoppingBag className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Top Expenditure</p>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5 truncate">
              {highestCategoryName}
            </h3>
            <p className="text-[9px] text-slate-400 mt-0.5 font-bold">
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
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Monthly Outflow Mean</p>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
              {currency}{monthlyAverageSpend.toLocaleString('en-IN')}
            </h3>
            <p className="text-[9px] text-slate-400 mt-0.5 font-bold">
              Grouped over {totalMonthsCount} months
            </p>
          </div>
        </div>

        {/* Total Expenses volume card */}
        <div className="saas-card p-4 flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
            <FiActivity className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Ledger Ledger Volume</p>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
              {totalExpensesCount} Settlements
            </h3>
            <p className="text-[9px] text-slate-400 mt-0.5 font-bold">
              Gross expenses: {currency}{totalExpensesSum.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Goals Summary Portfolio value card */}
        <div className="saas-card p-4 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">
            <FiBriefcase className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Active Savings Goals</p>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
              {savingsGoals.length} Targets
            </h3>
            <p className="text-[9px] text-slate-400 mt-0.5 font-bold">
              Saved: {currency}{savingsGoals.reduce((sum, g) => sum + g.currentSaved, 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      {/* 2. MAIN CHARTS GRID (Monthly compare & Daily trends) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Monthly Compare grouped bar chart */}
        <div className="saas-card p-5">
          <div className="mb-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Monthly Cash Flows</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Historical monthly comparison of income vs expenses</p>
          </div>
          <MonthlyBarChart transactions={transactions} />
        </div>

        {/* Daily expense trend line chart */}
        <div className="saas-card p-5">
          <div className="mb-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Daily Spending Trends</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Outflow progression over current billing cycle</p>
          </div>
          <TrendsLineChart transactions={transactions} />
        </div>
      </div>

      {/* 3. ADDITIONAL DETAIL ANALYSIS ROW (Net Worth Trend & Category proportion share) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        
        {/* Net Worth Progression (Cumulative Cash Balance Line Chart) - 3 Columns */}
        <div className="lg:col-span-3 saas-card p-5 flex flex-col justify-between">
          <div className="mb-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Net Worth Progression</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Cumulative running balance sum history</p>
          </div>

          <div className="h-56">
            {netWorthData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400 text-xs font-semibold">
                No historical ledger entries to calculate Net Worth.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={netWorthData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800/40" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${currency}${v >= 1000 ? v / 1000 + 'k' : v}`} />
                  <Tooltip content={<CustomNetTooltip />} />
                  <Area type="monotone" dataKey="Net Worth" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorNetWorth)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category breakdown pie chart - 2 Columns */}
        <div className="lg:col-span-2 saas-card p-5 flex flex-col justify-between">
          <div className="mb-2">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Category Proportions</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Share breakdown of total monthly spending</p>
          </div>
          <div className="h-56 flex items-center justify-center">
            <CategoryPieChart transactions={transactions} />
          </div>
        </div>

      </div>
    </motion.div>
  );
};
export default Analytics;
