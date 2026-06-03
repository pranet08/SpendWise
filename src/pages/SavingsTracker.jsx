import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { FiTarget, FiAward, FiFlag, FiTrendingUp, FiHeart } from 'react-icons/fi';

export const SavingsTracker = () => {
  const { savingsGoal, currentSavings, updateSavingsGoal, updateCurrentSavings } = useApp();

  // Input states
  const [goalInput, setGoalInput] = useState(savingsGoal.toString());
  const [savedInput, setSavedInput] = useState(currentSavings.toString());

  // 1. Calculations
  const remainingTarget = savingsGoal - currentSavings;
  const progressPercent = savingsGoal > 0 ? (currentSavings / savingsGoal) * 100 : 0;

  // Handle Target Goal Form submit
  const handleSaveGoal = (e) => {
    e.preventDefault();
    if (!goalInput || Number(goalInput) <= 0) return;
    updateSavingsGoal(Number(goalInput));
  };

  // Handle Saved Progress Form submit
  const handleSaveProgress = (e) => {
    e.preventDefault();
    if (!savedInput || Number(savedInput) < 0) return;
    updateCurrentSavings(Number(savedInput));
  };

  // 2. Select Motivational Tips dynamically based on completion tier
  const getMotivationalTip = () => {
    if (progressPercent >= 100) {
      return {
        banner: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-250 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-350',
        title: 'Target Achieved! 🏆',
        desc: 'Incredible work! You have fully completed your target savings goal. You are setting yourself up for financial freedom!',
        icon: <FiAward className="w-8 h-8 text-emerald-555 grow-0" />
      };
    } else if (progressPercent >= 75) {
      return {
        banner: 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-250 dark:border-indigo-900/50 text-indigo-800 dark:text-indigo-350',
        title: 'Almost There! 🎯',
        desc: 'You have cleared over 75% of your target. A small final push is all you need to cross the finish line.',
        icon: <FiTarget className="w-8 h-8 text-brand-555 grow-0" />
      };
    } else if (progressPercent >= 50) {
      return {
        banner: 'bg-blue-50 dark:bg-blue-950/20 border-blue-250 dark:border-blue-900/50 text-blue-800 dark:text-blue-350',
        title: 'Halfway Mark Passed! 🚀',
        desc: 'Solid effort! You have saved more than half of your targeted milestone. Keep consistency going!',
        icon: <FiFlag className="w-8 h-8 text-blue-555 grow-0" />
      };
    } else if (progressPercent > 0) {
      return {
        banner: 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300',
        title: 'Every Step Counts! 🌱',
        desc: 'You started your savings journey. Automating small transfers weekly is a great way to grow your capital without stress.',
        icon: <FiHeart className="w-8 h-8 text-rose-555 grow-0" />
      };
    } else {
      return {
        banner: 'bg-slate-55 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300',
        title: 'Set Your Goal 💸',
        desc: 'Define a savings target. Saving even a small percentage of your paycheck creates a massive financial buffer over time.',
        icon: <FiTrendingUp className="w-8 h-8 text-slate-500 grow-0" />
      };
    }
  };

  const tip = getMotivationalTip();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* INPUT SETTINGS HEADER GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Adjust Savings Goal */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Savings Goal</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">Set a savings target to track your progress toward your financial milestones.</p>
          </div>

          <form onSubmit={handleSaveGoal} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Goal Amount (₹)
              </label>
              <input
                type="number"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                min="1"
                placeholder="e.g. 50000"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-xl text-xs font-semibold shadow hover:shadow-md transition-all duration-200"
            >
              Update Goal
            </button>
          </form>
        </div>

        {/* Card 2: Update Current Savings Balance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Update Saved Amount</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">Enter the amount you currently have saved in your accounts.</p>
          </div>

          <form onSubmit={handleSaveProgress} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Amount Saved (₹)
              </label>
              <input
                type="number"
                value={savedInput}
                onChange={(e) => setSavedInput(e.target.value)}
                min="0"
                placeholder="e.g. 32000"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-700 dark:border-slate-800 text-slate-250 rounded-xl text-xs font-semibold shadow transition-all duration-200"
            >
              Save Progress
            </button>
          </form>
        </div>
      </div>

      {/* METERS AND MILESTONES DETAIL VIEW */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        
        {/* MOTIVATIONAL BANNER BLOCK */}
        <div className={`p-6 border rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6 ${tip.banner}`}>
          <div className="shrink-0 p-2 bg-white/40 dark:bg-black/10 rounded-xl shadow-inner">
            {tip.icon}
          </div>
          <div className="text-center sm:text-left">
            <h4 className="font-bold text-sm uppercase tracking-wider mb-1">{tip.title}</h4>
            <p className="text-xs leading-normal">{tip.desc}</p>
          </div>
        </div>

        {/* METRICS METERS ROW */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-end gap-4 text-sm">
            <div>
              <span className="text-slate-400 text-xs block font-bold uppercase tracking-wider">CURRENTLY SAVED</span>
              <span className="text-3xl font-black text-slate-950 dark:text-white">
                ₹{currentSavings.toLocaleString('en-IN')}
              </span>
            </div>
            
            <div className="flex gap-8 text-right sm:text-right">
              <div>
                <span className="text-slate-400 text-xs block font-bold uppercase tracking-wider">REMAINING NEEDED</span>
                <span className="text-lg font-bold text-slate-700 dark:text-slate-300">
                  {remainingTarget > 0 ? `₹${remainingTarget.toLocaleString('en-IN')}` : '₹0 (Goal Met!)'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-xs block font-bold uppercase tracking-wider">SAVINGS GOAL</span>
                <span className="text-lg font-bold text-slate-700 dark:text-slate-300">
                  ₹{savingsGoal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* DYNAMIC FILL PROGRESS METER */}
          <div className="space-y-2">
            <div className="w-full h-4 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progressPercent, 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-brand-500 via-indigo-500 to-emerald-500"
              />
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
              <span>{progressPercent.toFixed(0)}% completed</span>
              <span>
                {progressPercent >= 100 
                  ? 'Completed!' 
                  : `${(100 - progressPercent).toFixed(0)}% left`
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
export default SavingsTracker;
