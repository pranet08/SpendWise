import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { FiPlus, FiTrash2, FiEdit2, FiCalendar } from 'react-icons/fi';

export const SavingsTracker = () => {
  const { 
    savingsGoals, 
    addSavingsGoal, 
    editSavingsGoal, 
    deleteSavingsGoal, 
    addSavingsProgress,
    currency 
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');

  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentSaved, setCurrentSaved] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('medium');

  const [errors, setErrors] = useState({});

  const totalSaved = savingsGoals.reduce((sum, g) => sum + g.currentSaved, 0);
  const totalTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 105 : 0;

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

  const handleSubmitGoal = (e) => {
    e.preventDefault();

    const formErrors = {};
    if (!title.trim()) formErrors.title = 'Title is required';
    if (!targetAmount || Number(targetAmount) <= 0) formErrors.targetAmount = 'Target must be greater than 0';

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

  const handleOpenDeposit = (goalId) => {
    setSelectedGoalId(goalId);
    setDepositAmount('');
    setIsDepositOpen(true);
  };

  const handleSubmitDeposit = (e) => {
    e.preventDefault();
    if (!depositAmount || Number(depositAmount) <= 0) return;
    addSavingsProgress(selectedGoalId, Number(depositAmount));
    setIsDepositOpen(false);
  };

  const getDeadlineFeedback = (deadlineDateStr) => {
    if (!deadlineDateStr) return { formattedDate: 'No deadline', timeLeft: 'No deadline', isExpired: false, daysLeft: Infinity };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const deadline = new Date(deadlineDateStr);
    deadline.setHours(0, 0, 0, 0);
    
    const formattedDate = deadline.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    
    const diffTime = deadline - today;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      const expiredDays = Math.abs(diffDays);
      const expiredText = expiredDays === 1 ? 'Expired yesterday' : `Expired ${expiredDays} days ago`;
      return {
        formattedDate,
        timeLeft: expiredText,
        isExpired: true,
        daysLeft: diffDays
      };
    }
    
    if (diffDays === 0) {
      return {
        formattedDate,
        timeLeft: 'deadline today',
        isExpired: false,
        daysLeft: 0
      };
    }
    
    if (diffDays === 1) {
      return {
        formattedDate,
        timeLeft: '1 day left',
        isExpired: false,
        daysLeft: 1
      };
    }

    const getDaysInMonth = (year, month) => {
      return new Date(year, month + 1, 0).getDate();
    };
    
    let y1 = today.getFullYear();
    let m1 = today.getMonth();
    let d1 = today.getDate();
    
    let y2 = deadline.getFullYear();
    let m2 = deadline.getMonth();
    let d2 = deadline.getDate();
    
    let monthsDiff = (y2 - y1) * 12 + (m2 - m1);
    let daysDiff = 0;
    
    if (d2 < d1) {
      monthsDiff--;
      let targetYear = y1;
      let targetMonth = m1 + monthsDiff;
      if (targetMonth > 11) {
        targetYear += Math.floor(targetMonth / 12);
        targetMonth = targetMonth % 12;
      }
      const maxDays = getDaysInMonth(targetYear, targetMonth);
      const dayToUse = Math.min(d1, maxDays);
      const temp = new Date(targetYear, targetMonth, dayToUse);
      const diffMs = deadline - temp;
      daysDiff = Math.round(diffMs / (1000 * 60 * 60 * 24));
    } else {
      daysDiff = d2 - d1;
    }
    
    let timeLeft = '';
    if (monthsDiff > 0) {
      const monthWord = monthsDiff === 1 ? 'month' : 'months';
      if (daysDiff > 0) {
        const dayWord = daysDiff === 1 ? 'day' : 'days';
        timeLeft = `${monthsDiff} ${monthWord} ${daysDiff} ${dayWord} left`;
      } else {
        timeLeft = `${monthsDiff} ${monthWord} left`;
      }
    } else {
      timeLeft = `${daysDiff} days left`;
    }
    
    return {
      formattedDate,
      timeLeft,
      isExpired: false,
      daysLeft: diffDays
    };
  };

  const getGoalStatus = (g) => {
    const isCompleted = g.currentSaved >= g.targetAmount;
    if (isCompleted) {
      return { label: 'Completed', color: 'bg-emerald-50 border-emerald-250 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-400' };
    }
    
    const feedback = getDeadlineFeedback(g.deadline);
    if (feedback.isExpired) {
      return { label: 'Overdue', color: 'bg-rose-50 border-rose-250 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/40 dark:text-rose-400' };
    }
    
    const pct = g.targetAmount > 0 ? (g.currentSaved / g.targetAmount) * 100 : 0;
    if (pct < 50 && feedback.daysLeft < 30) {
      return { label: 'Falling Behind', color: 'bg-orange-50 border-orange-250 text-orange-705 dark:bg-orange-950/20 dark:border-orange-900/40 dark:text-orange-400' };
    }
    
    return { label: 'On Track', color: 'bg-blue-50 border-blue-250 text-blue-700 dark:bg-blue-950/20 dark:border-blue-900/40 dark:text-blue-400' };
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
          <h2 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Savings</h2>
          <p className="text-[10px] text-slate-500 mt-0.5">Monitor progress toward your savings goals.</p>
        </div>
        <button
          onClick={handleOpenAddGoal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-lg text-xs font-bold transition-colors shadow-sm"
        >
          <FiPlus className="w-3.5 h-3.5" />
          New Goal
        </button>
      </div>

      {/* 1. PORTFOLIO SUMMARY */}
      <div className="saas-card p-5">
        <div>
          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Total Savings</span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-0.5">
            {currency}{totalSaved.toLocaleString('en-IN')}
          </h2>
          <p className="text-[10px] text-slate-500 mt-1 font-semibold">
            Target amount: {currency}{totalTarget.toLocaleString('en-IN')} ({savingsGoals.length} Goals)
          </p>
        </div>

        {savingsGoals.length > 0 && (
          <div className="mt-4 space-y-1.5">
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-855 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
                style={{ width: `${Math.min(overallProgress, 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[9px] text-slate-455 font-bold uppercase">
              <span>{Math.min(overallProgress, 100).toFixed(0)}% Overall Progress</span>
              <span>{totalSaved >= totalTarget ? 'Goal Met!' : 'Progressing'}</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. GOALS GRID */}
      {savingsGoals.length === 0 ? (
        <div className="saas-card p-8 text-center text-xs text-slate-500 font-semibold">
          No active savings goals. Create a goal to begin.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savingsGoals.map((g) => {
            const progress = g.targetAmount > 0 ? (g.currentSaved / g.targetAmount) * 100 : 0;
            const remaining = Math.max(0, g.targetAmount - g.currentSaved);
            const isCompleted = g.currentSaved >= g.targetAmount;
            const feedback = getDeadlineFeedback(g.deadline);
            const statusInfo = getGoalStatus(g);

            return (
              <div key={g.id} className="saas-card p-4 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-800 transition-colors">
                
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-xs truncate max-w-[145px]" title={g.title}>{g.title}</h4>
                        <span className={`px-1.5 py-0.2 rounded text-[7px] font-bold uppercase border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <span className={`inline-block px-1.5 py-0.2 rounded text-[8px] font-bold uppercase mt-1.5 border ${
                        g.priority === 'high' ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/40 dark:text-rose-400' :
                        g.priority === 'medium' ? 'bg-orange-50 border-orange-200 text-orange-705 dark:bg-orange-950/20 dark:border-orange-900/40 dark:text-orange-400' :
                        'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-400'
                      }`}>
                        {g.priority === 'high' ? 'High' : (g.priority === 'medium' ? 'Medium' : 'Low')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEditGoal(g)}
                        className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded transition-colors"
                        title="Edit"
                      >
                        <FiEdit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => deleteSavingsGoal(g.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-955/20 rounded transition-colors"
                        title="Delete"
                      >
                        <FiTrash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3.5 space-y-1">
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[8.5px] text-slate-455 font-bold uppercase">
                      <span>{progress.toFixed(0)}% Saved</span>
                      <span>{isCompleted ? 'Goal Met!' : `${(100 - progress).toFixed(0)}% Left`}</span>
                    </div>
                  </div>

                  {/* 2x2 Details Grid */}
                  <div className="mt-4 grid grid-cols-2 gap-3 text-[10px]">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider text-[8px]">Saved</span>
                      <span className="font-extrabold text-slate-900 dark:text-slate-100 text-[10.5px]">
                        {currency}{g.currentSaved.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider text-[8px]">Target</span>
                      <span className="font-extrabold text-slate-900 dark:text-slate-100 text-[10.5px]">
                        {currency}{g.targetAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider text-[8px]">Deadline</span>
                      <span className="font-extrabold text-slate-900 dark:text-slate-100 text-[10px]">
                        {feedback.formattedDate}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider text-[8px]">Time Left</span>
                      <span className={`font-extrabold text-[9.5px] truncate block ${feedback.isExpired ? 'text-rose-500' : 'text-slate-900 dark:text-slate-100'}`}>
                        {feedback.timeLeft}
                      </span>
                    </div>
                  </div>

                </div>

                <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800/40 flex items-center justify-end gap-2 text-[9px] font-semibold text-slate-550">
                  {!isCompleted && (
                    <button
                      onClick={() => handleOpenDeposit(g.id)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded text-[9px] font-bold uppercase transition-colors"
                    >
                      Add Savings
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
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-sm shadow-xl p-4 pointer-events-auto"
              >
                <div className="flex justify-between items-center pb-2 border-b mb-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    {editingGoal ? 'Edit Goal' : 'New Goal'}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 text-sm font-bold">✕</button>
                </div>

                <form onSubmit={handleSubmitGoal} className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Laptop Fund"
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none"
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
                        placeholder="5000"
                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none"
                      />
                      {errors.targetAmount && <p className="text-[9px] text-rose-500 mt-1">{errors.targetAmount}</p>}
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Saved Amount ({currency})</label>
                      <input
                        type="number"
                        value={currentSaved}
                        onChange={(e) => setCurrentSaved(e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Priority</label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none"
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
                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t mt-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-3 py-1.5 border hover:bg-slate-55 text-[9px] uppercase font-bold rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[9px] uppercase font-bold hover:bg-slate-800"
                    >
                      {editingGoal ? 'Save' : 'Add'}
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
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-xs shadow-xl p-4 pointer-events-auto"
              >
                <div className="flex justify-between items-center pb-2 border-b mb-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-900 dark:text-white">Add Savings</h3>
                  <button onClick={() => setIsDepositOpen(false)} className="text-slate-400 hover:text-slate-900 text-sm font-bold">✕</button>
                </div>

                <form onSubmit={handleSubmitDeposit} className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Deposit Amount ({currency})</label>
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="e.g. 500"
                      min="1"
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsDepositOpen(false)}
                      className="px-2.5 py-1.5 border hover:bg-slate-55 text-[9px] uppercase font-bold rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-2.5 py-1.5 bg-slate-900 text-white rounded text-[9px] uppercase font-bold hover:bg-slate-800"
                    >
                      Add
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
