import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { FiSliders, FiAlertTriangle, FiCheckCircle, FiInfo, FiTag } from 'react-icons/fi';

export const BudgetPlanner = () => {
  const { transactions, monthlyBudget, updateBudget, currency } = useApp();
  const [budgetInput, setBudgetInput] = useState(monthlyBudget.toString());

  const currentMonth = new Date().toISOString().substring(0, 7);

  // Calculate total expenses this month
  const thisMonthExpenses = transactions
    .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonth))
    .reduce((sum, t) => sum + t.amount, 0);

  const utilizationPercentage = monthlyBudget > 0 ? (thisMonthExpenses / monthlyBudget) * 100 : 0;
  const remainingBudget = monthlyBudget - thisMonthExpenses;

  // Save budget changes
  const handleSaveBudget = (e) => {
    e.preventDefault();
    if (!budgetInput || Number(budgetInput) <= 0) return;
    updateBudget(Number(budgetInput));
  };

  // Determine indicator colors depending on budget utilization percentage
  let progressColor = 'bg-emerald-500';
  let bannerBg = 'bg-emerald-50 dark:bg-emerald-950/20';
  let bannerBorder = 'border-emerald-250 dark:border-emerald-900/50';
  let bannerText = 'text-emerald-800 dark:text-emerald-400';
  let bannerIcon = <FiCheckCircle className="w-4 h-4 shrink-0" />;
  let bannerMessage = 'Healthy budget buffer. Your spending speed is well within safe thresholds.';

  if (utilizationPercentage > 100) {
    progressColor = 'bg-rose-500';
    bannerBg = 'bg-rose-50 dark:bg-rose-950/25';
    bannerBorder = 'border-rose-250 dark:border-rose-900/50';
    bannerText = 'text-rose-800 dark:text-rose-455';
    bannerIcon = <FiAlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />;
    bannerMessage = 'Overspent limit! Critical spending detected above your set limit. Optimize your costs immediately.';
  } else if (utilizationPercentage >= 90) {
    progressColor = 'bg-orange-500';
    bannerBg = 'bg-orange-50 dark:bg-orange-950/25';
    bannerBorder = 'border-orange-250 dark:border-orange-900/50';
    bannerText = 'text-orange-850 dark:text-orange-400';
    bannerIcon = <FiAlertTriangle className="w-4 h-4 shrink-0 text-orange-500" />;
    bannerMessage = 'Danger threshold reached: You have utilized over 90% of your budget limit.';
  } else if (utilizationPercentage >= 70) {
    progressColor = 'bg-amber-500';
    bannerBg = 'bg-amber-50 dark:bg-amber-950/25';
    bannerBorder = 'border-amber-250 dark:border-amber-900/50';
    bannerText = 'text-amber-800 dark:text-amber-400';
    bannerIcon = <FiInfo className="w-4 h-4 shrink-0 text-amber-500" />;
    bannerMessage = 'Approaching limit warning: You have spent 70%+ of your allocated monthly budget.';
  }

  // Category spending breakdown for this month
  const categorySpends = transactions
    .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonth))
    .reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});

  // Category specific benchmark limit (25% of total budget per category for warnings)
  const categoryBenchmarkLimit = monthlyBudget * 0.25;

  const overspentCategories = Object.keys(categorySpends).filter(
    (cat) => categorySpends[cat] > categoryBenchmarkLimit
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-900">
        <div>
          <h2 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Budget</h2>
          <p className="text-[10px] text-slate-500 mt-0.5">Stay within your monthly budget.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Adjust Budget limit Card */}
        <div className="saas-card p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-805 rounded-md">
                <FiSliders className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Monthly Budget</h3>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal mb-5">
              Set a monthly spending limit to keep track of your spending and avoid overspending.
            </p>
          </div>

          <form onSubmit={handleSaveBudget} className="space-y-3.5">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Limit Threshold ({currency})
              </label>
              <input
                type="number"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                min="1"
                placeholder="e.g. 30000"
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-lg text-xs focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-lg text-[10px] font-bold uppercase shadow transition-colors"
            >
              Save
            </button>
          </form>
        </div>

        {/* Budget Status details */}
        <div className="saas-card p-4 lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Budget Overview</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Compare your budget against your actual spending.</p>
          </div>

          <div className={`p-2.5 border rounded-lg flex items-start gap-2 my-2.5 ${bannerBg} ${bannerBorder} ${bannerText}`}>
            {bannerIcon}
            <div className="text-[9.5px] font-bold leading-normal">{bannerMessage}</div>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between items-end text-xs">
              <div>
                <span className="text-slate-400 font-semibold text-[8.5px] block">CURRENT SPENDING</span>
                <span className="text-lg font-black text-slate-950 dark:text-white">
                  {currency}{thisMonthExpenses.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 font-semibold text-[8.5px] block">MONTHLY LIMIT</span>
                <span className="text-sm font-bold text-slate-655 dark:text-slate-350">
                  {currency}{monthlyBudget.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* DYNAMIC COLOR PROGRESS BAR */}
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
                transition={{ duration: 0.5 }}
                className={`h-full rounded-full ${progressColor}`}
              />
            </div>

            <div className="flex justify-between items-center text-[9px] text-slate-455 font-bold pt-0.5 uppercase">
              <span>{utilizationPercentage.toFixed(0)}% used</span>
              <span>
                {remainingBudget >= 0 
                  ? `${currency}${remainingBudget.toLocaleString('en-IN')} remaining`
                  : `Over Budget By ${currency}${Math.abs(remainingBudget).toLocaleString('en-IN')}`
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* WARNINGS PANEL IF OVERSPENT CATEGORIES DETECTED */}
      {overspentCategories.length > 0 && (
        <div className="p-3 border border-rose-200 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/10 rounded-xl space-y-1.5">
          <div className="flex items-center gap-1.5 text-rose-800 dark:text-rose-455 text-[10px] font-bold uppercase tracking-wider">
            <FiAlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            Categories Over Budget
          </div>
          <p className="text-[9px] text-slate-500 font-semibold">
            The following categories have exceeded the recommended single-category benchmark limit ({currency}{categoryBenchmarkLimit.toLocaleString('en-IN')}):
          </p>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {overspentCategories.map((cat) => (
              <span key={cat} className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 text-[8.5px] font-extrabold">
                {cat}: {currency}{categorySpends[cat].toLocaleString('en-IN')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CATEGORY BREAKDOWN METERS */}
      <div className="saas-card p-4">
        <div className="mb-3">
          <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Category Spending</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Spending breakdown by category for this month</p>
        </div>

        {Object.keys(categorySpends).length === 0 ? (
          <div className="text-center py-10 text-slate-550 text-xs font-semibold">
            No expenses registered in this month.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {Object.keys(categorySpends).map((cat, idx) => {
              const spend = categorySpends[cat];
              const ratio = Math.min((spend / categoryBenchmarkLimit) * 100, 100);
              const isOver = spend > categoryBenchmarkLimit;

              return (
                <div key={idx} className="space-y-1 border border-slate-100 dark:border-slate-800/80 p-2.5 rounded-xl">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="p-1 bg-slate-50 dark:bg-slate-950 text-slate-500 rounded-md">
                        <FiTag className="w-3 h-3" />
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{cat}</span>
                    </div>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {currency}{spend.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="w-full h-1 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${isOver ? 'bg-rose-500' : (ratio > 75 ? 'bg-amber-500' : 'bg-emerald-500')}`}
                      style={{ width: `${ratio}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[7.5px] text-slate-400 font-bold uppercase tracking-wider">
                    <span className={isOver ? 'text-rose-500' : 'text-slate-400'}>
                      {isOver ? 'Over Budget' : 'Within Budget'}
                    </span>
                    <span>{((spend / monthlyBudget) * 100).toFixed(0)}% of total budget</span>
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
