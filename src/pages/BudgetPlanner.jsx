import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { FiSliders, FiAlertTriangle, FiCheckCircle, FiInfo, FiTrendingDown, FiTag } from 'react-icons/fi';

export const BudgetPlanner = () => {
  const { transactions, monthlyBudget, updateBudget } = useApp();
  const [budgetInput, setBudgetInput] = useState(monthlyBudget.toString());

  // Derive current month identifier: e.g. "2026-06"
  const currentMonth = new Date().toISOString().substring(0, 7);

  // 1. Calculate total expenses of this current month
  const thisMonthExpenses = transactions
    .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonth))
    .reduce((sum, t) => sum + t.amount, 0);

  // 2. Compute utilization metrics
  const utilizationPercentage = monthlyBudget > 0 ? (thisMonthExpenses / monthlyBudget) * 100 : 0;
  const remainingBudget = monthlyBudget - thisMonthExpenses;

  // Handle Budget input submission
  const handleSaveBudget = (e) => {
    e.preventDefault();
    if (!budgetInput || Number(budgetInput) <= 0) return;
    updateBudget(Number(budgetInput));
  };

  // Determine indicator colors and flags depending on budget utilization percentage
  let progressColor = 'bg-brand-500';
  let bannerBg = 'bg-emerald-50 dark:bg-emerald-950/20';
  let bannerBorder = 'border-emerald-250 dark:border-emerald-900/50';
  let bannerText = 'text-emerald-800 dark:text-emerald-350';
  let bannerIcon = <FiCheckCircle className="w-5 h-5 shrink-0" />;
  let bannerMessage = 'Perfect! Your expenses are well within your set budget limits.';

  if (utilizationPercentage > 100) {
    progressColor = 'bg-rose-500';
    bannerBg = 'bg-rose-50 dark:bg-rose-950/25';
    bannerBorder = 'border-rose-250 dark:border-rose-900/50';
    bannerText = 'text-rose-800 dark:text-rose-350';
    bannerIcon = <FiAlertTriangle className="w-5 h-5 shrink-0 text-rose-550" />;
    bannerMessage = 'Action Required: You have exceeded your monthly spending limit!';
  } else if (utilizationPercentage >= 80) {
    progressColor = 'bg-amber-500';
    bannerBg = 'bg-amber-50 dark:bg-amber-950/25';
    bannerBorder = 'border-amber-250 dark:border-amber-900/50';
    bannerText = 'text-amber-800 dark:text-amber-350';
    bannerIcon = <FiInfo className="w-5 h-5 shrink-0 text-amber-550" />;
    bannerMessage = 'Warning: You have used over 80% of your allocated monthly budget.';
  }

  // 3. Category breakdown spends of the current month
  const categorySpends = transactions
    .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonth))
    .reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT CARD: UPDATE BUDGET SETTING FORM */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-brand-100 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 rounded-xl">
                <FiSliders className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">Adjust Budget</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Set a monthly spending limit to keep track of your spending and avoid overspending.
            </p>
          </div>

          <form onSubmit={handleSaveBudget} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Monthly Budget (₹)
              </label>
              <input
                type="number"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                min="1"
                placeholder="e.g. 30000"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-xl text-xs font-semibold shadow hover:shadow-md transition-all duration-200"
            >
              Update Limit
            </button>
          </form>
        </div>

        {/* RIGHT CARD: UTILIZATION OVERVIEW PROGRESS (Takes 2 columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Monthly Budget Status</h3>
            <p className="text-xs text-slate-500 mt-1">Compare your budget against your actual spending.</p>
          </div>

          {/* WARNING/HEALTH ALERT BANNER */}
          <div className={`p-4 border rounded-2xl flex items-start gap-3 my-4 ${bannerBg} ${bannerBorder} ${bannerText}`}>
            {bannerIcon}
            <div className="text-xs font-semibold leading-normal">{bannerMessage}</div>
          </div>

          {/* MAIN METER COMPOSITIONS */}
          <div className="space-y-4">
            <div className="flex justify-between items-end text-sm">
              <div>
                <span className="text-slate-400 text-xs block">CURRENT SPENDING</span>
                <span className="text-2xl font-black text-slate-950 dark:text-white">
                  ₹{thisMonthExpenses.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-xs block">MONTHLY BUDGET</span>
                <span className="text-lg font-bold text-slate-650 dark:text-slate-300">
                  ₹{monthlyBudget.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* PROGRESS METER BAR */}
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full rounded-full ${progressColor}`}
              />
            </div>

            <div className="flex justify-between items-center text-xs text-slate-500 font-semibold pt-1">
              <span>{utilizationPercentage.toFixed(0)}% used</span>
              <span>
                {remainingBudget >= 0 
                  ? `₹${remainingBudget.toLocaleString('en-IN')} remaining`
                  : `Overspent by ₹${Math.abs(remainingBudget).toLocaleString('en-IN')}`
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORY UTILIZATION PANEL */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Category Spending</h3>
          <p className="text-xs text-slate-500 mt-1">Spending breakdown by category for this month</p>
        </div>

        {Object.keys(categorySpends).length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-sm">
            No expenses registered in this month yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.keys(categorySpends).map((cat, idx) => {
              const spend = categorySpends[cat];
              // Percent of total budget spent on this category
              const catPercent = monthlyBudget > 0 ? ((spend / monthlyBudget) * 100).toFixed(1) : 0;
              
              return (
                <div key={idx} className="space-y-2 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-slate-100 dark:bg-slate-950 text-slate-650 dark:text-slate-350 rounded-lg">
                        <FiTag className="w-3.5 h-3.5" />
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{cat}</span>
                    </div>
                    <span className="font-black text-slate-950 dark:text-white">
                      ₹{spend.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden mt-2">
                    <div 
                      className="h-full bg-brand-500 rounded-full"
                      style={{ width: `${Math.min(parseFloat(catPercent) * 2, 100)}%` }} // Scaled relative representation
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                    <span>Status</span>
                    <span>{catPercent}% of total budget</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};
export default BudgetPlanner;
