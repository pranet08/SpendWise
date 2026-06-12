import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { FiTarget, FiPlus, FiTrash2, FiEdit2, FiTag, FiCalendar, FiArrowRight, FiCheck } from 'react-icons/fi';

export const SavingsTracker = () => {
  const { 
    savingsGoals, 
    addSavingsGoal, 
    editSavingsGoal, 
    deleteSavingsGoal, 
    addSavingsProgress,
    currency 
  } = useApp();

  // Modal control states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  // Quick Deposit modal state
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');

  // Form states for Savings Goal
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentSaved, setCurrentSaved] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('medium');

  const [errors, setErrors] = useState({});

  // Calculations
  const totalSaved = savingsGoals.reduce((sum, g) => sum + g.currentSaved, 0);
  const totalTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  // Open Form to Add Goal
  const handleOpenAddGoal = () => {
    setEditingGoal(null);
    setTitle('');
    setTargetAmount('');
    setCurrentSaved('');
    setDeadline('');
    setPriority('medium');
    setErrors({});
    setIsModalOpen(true);
  };

  // Open Form to Edit Goal
  const handleOpenEditGoal = (goal) => {
    setEditingGoal(goal);
    setTitle(goal.title);
    setTargetAmount(goal.targetAmount.toString());
    setCurrentSaved(goal.currentSaved.toString());
    setDeadline(goal.deadline || '');
    setPriority(goal.priority || 'medium');
    setErrors({});
    setIsModalOpen(true);
  };

  // Handle Form Submit
  const handleSubmitGoal = (e) => {
    e.preventDefault();

    // Validation
    const formErrors = {};
    if (!title.trim()) formErrors.title = 'Title is required';
    if (!targetAmount || Number(targetAmount) <= 0) formErrors.targetAmount = 'Target amount must be greater than 0';

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    const goalData = {
      title: title.trim(),
      targetAmount: Number(targetAmount),
      currentSaved: Number(currentSaved || 0),
      deadline: deadline || '',
      priority
    };

    if (editingGoal) {
      editSavingsGoal(editingGoal.id, goalData);
    } else {
      addSavingsGoal(goalData);
    }

    setIsModalOpen(false);
  };

  // Open Deposit Modal
  const handleOpenDeposit = (goalId) => {
    setSelectedGoalId(goalId);
    setDepositAmount('');
    setIsDepositOpen(true);
  };

  // Handle Quick Deposit
  const handleSubmitDeposit = (e) => {
    e.preventDefault();
    if (!depositAmount || Number(depositAmount) <= 0) return;
    addSavingsProgress(selectedGoalId, Number(depositAmount));
    setIsDepositOpen(false);
  };

  // Calculate estimated completion based on monthly average savings (mocked logically)
  const getEstimatedCompletion = (g) => {
    if (g.currentSaved >= g.targetAmount) return 'Goal Met!';
    const remaining = g.targetAmount - g.currentSaved;
    // Assume user saves 10% of standard 30,000 monthly income/budget default = 3,000 per month
    const months = Math.ceil(remaining / 3000);
    if (months <= 1) return 'Within a month';
    return `Approx. ${months} months`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      
      {/* 1. PORTFOLIO SUMMARY WIDGET */}
      <div className="saas-card p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Savings Portfolio Balance</span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {currency}{totalSaved.toLocaleString('en-IN')}
            </h2>
            <p className="text-[10px] text-slate-500 mt-1">
              Target goal amount: {currency}{totalTarget.toLocaleString('en-IN')} ({savingsGoals.length} Active Goals)
            </p>
          </div>

          <button
            onClick={handleOpenAddGoal}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-lg text-xs font-semibold shadow transition-all duration-150 shrink-0"
          >
            <FiPlus className="w-3.5 h-3.5" />
            New Savings Goal
          </button>
        </div>

        {/* Global Progress Bar */}
        {savingsGoals.length > 0 && (
          <div className="mt-5 space-y-2">
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(overallProgress, 100)}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
              <span>{overallProgress.toFixed(0)}% Overall Progress</span>
              <span>{totalSaved >= totalTarget ? 'All Target Met!' : `${(100 - overallProgress).toFixed(0)}% Left`}</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. GOALS GRID */}
      {savingsGoals.length === 0 ? (
        <div className="saas-card p-8 text-center text-xs text-slate-500">
          No savings goals created yet. Click "New Savings Goal" to define your targets!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {savingsGoals.map((g) => {
            const progress = g.targetAmount > 0 ? (g.currentSaved / g.targetAmount) * 100 : 0;
            const remaining = Math.max(0, g.targetAmount - g.currentSaved);
            const isCompleted = g.currentSaved >= g.targetAmount;

            return (
              <div key={g.id} className="saas-card p-4 flex flex-col justify-between hover:border-slate-350 dark:hover:border-slate-700 transition-colors">
                
                {/* Header (Title, Priority tag, actions) */}
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate max-w-[140px]">{g.title}</h4>
                      <span className={`inline-block px-1.5 py-0.2 rounded text-[8px] font-bold uppercase mt-1 ${
                        g.priority === 'high' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400' :
                        g.priority === 'medium' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' :
                        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {g.priority}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditGoal(g)}
                        className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded transition-colors"
                        title="Edit"
                      >
                        <FiEdit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => deleteSavingsGoal(g.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded transition-colors"
                        title="Delete"
                      >
                        <FiTrash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span className="text-slate-400 font-semibold block">SAVED</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {currency}{g.currentSaved.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 font-semibold block">TARGET</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {currency}{g.targetAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Goal Progress bar */}
                  <div className="mt-3.5 space-y-1">
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-slate-400 font-semibold">
                      <span>{progress.toFixed(0)}% Saved</span>
                      <span>{isCompleted ? 'Goal Met!' : `${currency}${remaining.toLocaleString('en-IN')} Left`}</span>
                    </div>
                  </div>
                </div>

                {/* Footer status (estimated completion, deposit button) */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/40 flex items-center justify-between gap-2 text-[9px]">
                  <div className="min-w-0">
                    {g.deadline ? (
                      <span className="text-slate-400 flex items-center gap-1 truncate">
                        <FiCalendar className="w-3 h-3 text-slate-400 shrink-0" />
                        {new Date(g.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">No deadline</span>
                    )}
                    <p className="text-slate-500 mt-0.5 font-bold truncate">{getEstimatedCompletion(g)}</p>
                  </div>

                  {!isCompleted && (
                    <button
                      onClick={() => handleOpenDeposit(g.id)}
                      className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded text-[9px] font-bold transition-colors"
                    >
                      + Add Funds
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* savings GOAL MODAL FORM */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 pointer-events-auto" onClick={() => setIsModalOpen(false)} />
            <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-sm shadow-xl p-5 pointer-events-auto"
              >
                <div className="flex justify-between items-center pb-3 border-b mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    {editingGoal ? 'Edit Goal parameters' : 'New Savings Goal'}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900">✕</button>
                </div>

                <form onSubmit={handleSubmitGoal} className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Goal Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Vacation Fund"
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg text-xs focus:outline-none"
                    />
                    {errors.title && <p className="text-[9px] text-rose-500 mt-1">{errors.title}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Target Amount ({currency})</label>
                      <input
                        type="number"
                        value={targetAmount}
                        onChange={(e) => setTargetAmount(e.target.value)}
                        placeholder="50000"
                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg text-xs focus:outline-none"
                      />
                      {errors.targetAmount && <p className="text-[9px] text-rose-500 mt-1">{errors.targetAmount}</p>}
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Already Saved ({currency})</label>
                      <input
                        type="number"
                        value={currentSaved}
                        onChange={(e) => setCurrentSaved(e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Priority</label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg text-xs focus:outline-none"
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Deadline Date</label>
                      <input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t mt-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-3 py-1.5 border hover:bg-slate-50 text-[10px] uppercase font-bold rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] uppercase font-bold hover:bg-slate-800"
                    >
                      {editingGoal ? 'Save Parameters' : 'Create Goal'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* QUICK DEPOSIT FUNDS MODAL */}
      <AnimatePresence>
        {isDepositOpen && (
          <>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 pointer-events-auto" onClick={() => setIsDepositOpen(false)} />
            <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-xs shadow-xl p-5 pointer-events-auto"
              >
                <div className="flex justify-between items-center pb-2 border-b mb-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-900 dark:text-white">Deposit Savings Funds</h3>
                  <button onClick={() => setIsDepositOpen(false)} className="text-slate-400 hover:text-slate-900">✕</button>
                </div>

                <form onSubmit={handleSubmitDeposit} className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Contribution Amount ({currency})</label>
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="e.g. 5000"
                      min="1"
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsDepositOpen(false)}
                      className="px-2.5 py-1.5 border hover:bg-slate-50 text-[9px] uppercase font-bold rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-2.5 py-1.5 bg-slate-900 text-white rounded text-[9px] uppercase font-bold hover:bg-slate-800"
                    >
                      Confirm Deposit
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

    </motion.div>
  );
};
export default SavingsTracker;
