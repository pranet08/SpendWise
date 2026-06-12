import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { 
  FiAward, 
  FiPlus, 
  FiTrash2, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiTrendingUp,
  FiZap,
  FiActivity,
  FiSmile
} from 'react-icons/fi';

const CHALLENGE_TEMPLATES = [
  {
    id: 'save-money-month',
    title: 'Save Money Challenge',
    description: 'Build a net positive saving reserve across your goals this month.',
    type: 'savings',
    unit: '₹',
    difficulty: 'Medium',
    difficultyColor: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/30',
    durationDays: 30,
    badge: 'Savings Pro',
    rewardTier: 'Silver',
    customizable: true,
    presets: [5000, 10000, 25000]
  },
  {
    id: 'save-daily',
    title: 'Daily Savings Challenge',
    description: 'Build consistency by making deposits into your goals on distinct days.',
    type: 'daily-savings',
    unit: 'days',
    difficulty: 'Medium',
    difficultyColor: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/30',
    durationDays: 30,
    badge: 'Daily Saver',
    rewardTier: 'Silver',
    customizable: true,
    presets: [10, 20, 30] // Target days
  },
  {
    id: 'no-food-delivery',
    title: 'No Food Delivery',
    description: 'Cook at home and avoid any Food Delivery orders for 30 days.',
    type: 'no-food-delivery',
    target: 30,
    unit: 'days',
    difficulty: 'Medium',
    difficultyColor: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/30',
    durationDays: 30,
    badge: 'Chef Master',
    rewardTier: 'Silver',
    customizable: false
  },
  {
    id: 'no-shopping-week',
    title: 'No Shopping Week',
    description: 'Restrict all elective shopping expenses for 7 consecutive days.',
    type: 'no-shopping-week',
    target: 7,
    unit: 'days',
    difficulty: 'Easy',
    difficultyColor: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30',
    durationDays: 7,
    badge: 'Minimalist',
    rewardTier: 'Bronze',
    customizable: false
  },
  {
    id: 'spend-less-last-month',
    title: 'Spend Less Than Last Month',
    description: 'Ensure total monthly spending is less than last month\'s total.',
    type: 'spend-less-last-month',
    unit: '₹',
    difficulty: 'Medium',
    difficultyColor: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/30',
    durationDays: 30,
    badge: 'Spend Master',
    rewardTier: 'Gold',
    customizable: false
  },
  {
    id: 'weekend-no-spend',
    title: 'Weekend No-Spend Challenge',
    description: 'Go Saturday and Sunday without logging any expense transactions.',
    type: 'weekend-no-spend',
    target: 2,
    unit: 'days',
    difficulty: 'Hard',
    difficultyColor: 'text-rose-700 dark:text-rose-455 bg-rose-50 dark:bg-rose-955/20 border-rose-250 dark:border-rose-900/30',
    durationDays: 2,
    badge: 'Frugal Guru',
    rewardTier: 'Gold',
    customizable: false
  }
];

export const MoneyChallenges = () => {
  const { 
    challenges, 
    setChallenges, 
    transactions, 
    savingsGoals, 
    activities, 
    addActivity, 
    addNotification, 
    showToast, 
    currency 
  } = useApp();

  // Customization Modal states
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customizingTemplate, setCustomizingTemplate] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [customAmountInput, setCustomAmountInput] = useState('');

  // Live evaluation logic
  const getLiveProgress = (c) => {
    if (c.status === 'Completed' || c.status === 'Failed') {
      return { progress: c.progress, status: c.status, daysLeft: 0 };
    }

    const elapsedMs = new Date() - new Date(c.startDate);
    const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
    const daysLeft = Math.max(0, c.durationDays - elapsedDays);

    if (c.type === 'savings') {
      const totalSaved = savingsGoals.reduce((sum, g) => sum + g.currentSaved, 0);
      const startSaved = c.startTotalSaved || 0;
      const netSaved = Math.max(0, totalSaved - startSaved);

      const isMet = netSaved >= c.target;
      const isExpired = daysLeft === 0;

      let nextStatus = 'Active';
      if (isMet) nextStatus = 'Completed';
      else if (isExpired) nextStatus = 'Failed';
      else if (netSaved >= c.target * 0.8) nextStatus = 'Almost Complete';

      return { progress: netSaved, status: nextStatus, daysLeft };
    }

    if (c.type === 'daily-savings') {
      const goalActivities = activities.filter(
        a => a.type === 'goal' && 
        a.message.startsWith('Added') && 
        new Date(a.timestamp) >= new Date(c.startDate)
      );
      const activeDays = new Set(goalActivities.map(a => a.timestamp.substring(0, 10)));
      const daysCount = activeDays.size;

      const isMet = daysCount >= c.target;
      const isExpired = daysLeft === 0;

      let nextStatus = 'Active';
      if (isMet) nextStatus = 'Completed';
      else if (isExpired) nextStatus = 'Failed';
      else if (daysCount >= c.target * 0.8) nextStatus = 'Almost Complete';

      return { progress: daysCount, status: nextStatus, daysLeft };
    }

    if (c.type === 'no-food-delivery') {
      const deliveryTxs = transactions.filter(t => 
        t.type === 'expense' && 
        new Date(t.date) >= new Date(c.startDate) &&
        (t.category.toLowerCase().includes('delivery') || t.title.toLowerCase().includes('delivery'))
      );
      const failed = deliveryTxs.length > 0;
      const isExpired = daysLeft === 0;

      let nextStatus = 'Active';
      if (failed) nextStatus = 'Failed';
      else if (isExpired) nextStatus = 'Completed';
      else if (daysLeft <= 5) nextStatus = 'Almost Complete';

      return { progress: failed ? 0 : (c.durationDays - daysLeft), status: nextStatus, daysLeft };
    }

    if (c.type === 'no-shopping-week') {
      const shoppingTxs = transactions.filter(t => 
        t.type === 'expense' && 
        new Date(t.date) >= new Date(c.startDate) &&
        (t.category.toLowerCase().includes('shopping') || t.title.toLowerCase().includes('shopping'))
      );
      const failed = shoppingTxs.length > 0;
      const isExpired = daysLeft === 0;

      let nextStatus = 'Active';
      if (failed) nextStatus = 'Failed';
      else if (isExpired) nextStatus = 'Completed';
      else if (daysLeft <= 1) nextStatus = 'Almost Complete';

      return { progress: failed ? 0 : (c.durationDays - daysLeft), status: nextStatus, daysLeft };
    }

    if (c.type === 'spend-less-last-month') {
      const startMonth = c.startDate.substring(0, 7);
      const thisMonthExpenses = transactions
        .filter(t => t.type === 'expense' && t.date.startsWith(startMonth))
        .reduce((sum, t) => sum + t.amount, 0);

      const failed = thisMonthExpenses > c.target;
      const isExpired = daysLeft === 0;

      let nextStatus = 'Active';
      if (failed) nextStatus = 'Failed';
      else if (isExpired) nextStatus = 'Completed';
      else if (thisMonthExpenses >= c.target * 0.9) nextStatus = 'Almost Complete';

      return { progress: thisMonthExpenses, status: nextStatus, daysLeft };
    }

    if (c.type === 'weekend-no-spend') {
      const weekendExpenses = transactions.filter(t => {
        if (t.type !== 'expense') return false;
        const d = new Date(t.date);
        if (d < new Date(c.startDate)) return false;
        const day = d.getDay();
        return day === 0 || day === 6;
      });
      const failed = weekendExpenses.length > 0;
      const isExpired = daysLeft === 0;

      let nextStatus = 'Active';
      if (failed) nextStatus = 'Failed';
      else if (isExpired) nextStatus = 'Completed';

      return { progress: failed ? 0 : (c.durationDays - daysLeft), status: nextStatus, daysLeft };
    }

    return { progress: 0, status: 'Active', daysLeft };
  };

  // Sync challenges on load or when parameters change
  useEffect(() => {
    if (!challenges.length) return;

    let changed = false;
    const updated = challenges.map(c => {
      if (c.status === 'Completed' || c.status === 'Failed') return c;
      const live = getLiveProgress(c);

      if (live.status !== c.status || live.progress !== c.progress) {
        changed = true;
        if (live.status === 'Completed') {
          addActivity('goal', `Completed challenge: "${c.title}"! 🎉 Badge earned: ${c.badge}`);
          addNotification('Challenge Completed! 🏆', `You completed the "${c.title}" challenge and earned the ${c.badge} badge!`, 'success');
          showToast(`Completed Challenge: "${c.title}"! 🎉`, 'success');
        } else if (live.status === 'Failed') {
          addActivity('goal', `Failed challenge: "${c.title}" 🔴`);
          showToast(`Challenge failed: "${c.title}"`, 'error');
        }
        return { 
          ...c, 
          status: live.status, 
          progress: live.progress, 
          completionDate: (live.status === 'Completed' || live.status === 'Failed') ? new Date().toISOString() : undefined 
        };
      }
      return c;
    });

    if (changed) {
      setChallenges(updated);
    }
  }, [transactions, savingsGoals, activities]);

  // Handle starting a challenge template
  const handleStartChallengeTemplate = (template) => {
    // Check if same type is already active
    const active = challenges.find(
      c => c.templateId === template.id && (c.status === 'Active' || c.status === 'Almost Complete')
    );
    if (active) {
      showToast('This challenge is already active!', 'info');
      return;
    }

    if (template.customizable) {
      setCustomizingTemplate(template);
      setSelectedPreset(template.presets[0]);
      setCustomAmountInput('');
      setIsCustomModalOpen(true);
    } else {
      // Start static challenge
      let targetVal = template.target;
      let startTotalSaved = 0;

      if (template.id === 'spend-less-last-month') {
        // Calculate last month expenses
        const prevMonthDate = new Date();
        prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
        const prevMonthStr = prevMonthDate.toISOString().substring(0, 7);
        const lastMonthExpenses = transactions
          .filter(t => t.type === 'expense' && t.date.startsWith(prevMonthStr))
          .reduce((sum, t) => sum + t.amount, 0);
        targetVal = lastMonthExpenses > 0 ? lastMonthExpenses : 10000;
      }

      const newChallenge = {
        id: 'chal-' + Date.now(),
        templateId: template.id,
        title: template.title,
        description: template.id === 'spend-less-last-month' 
          ? `Keep spending below last month\'s total of ${currency}${targetVal.toLocaleString('en-IN')}`
          : template.description,
        type: template.type,
        target: targetVal,
        unit: template.unit,
        badge: template.badge,
        durationDays: template.durationDays,
        startDate: new Date().toISOString(),
        status: 'Active',
        progress: 0,
        startTotalSaved
      };

      setChallenges([newChallenge, ...challenges]);
      addActivity('goal', `Started challenge: "${template.title}" 🚀`);
      showToast(`Challenge started! 🚀`, 'success');
    }
  };

  const handleStartCustomChallenge = (e) => {
    e.preventDefault();
    if (!customizingTemplate) return;

    let targetValue = selectedPreset;
    if (selectedPreset === 'custom') {
      const num = Number(customAmountInput);
      if (!num || num <= 0) {
        showToast('Please enter a valid target amount.', 'error');
        return;
      }
      targetValue = num;
    }

    const currentTotalSaved = savingsGoals.reduce((sum, g) => sum + g.currentSaved, 0);

    const formattedTitle = customizingTemplate.id === 'save-money-month'
      ? `Save ${currency}${targetValue.toLocaleString('en-IN')} Challenge`
      : `Save ₹100 Daily for ${targetValue} Days`;

    const formattedDesc = customizingTemplate.id === 'save-money-month'
      ? `Save at least ${currency}${targetValue.toLocaleString('en-IN')} net additions to goals.`
      : `Reach a savings goal deposit of ₹100+ on ${targetValue} distinct days.`;

    const newChallenge = {
      id: 'chal-' + Date.now(),
      templateId: customizingTemplate.id,
      title: formattedTitle,
      description: formattedDesc,
      type: customizingTemplate.type,
      target: targetValue,
      unit: customizingTemplate.unit,
      badge: customizingTemplate.badge,
      durationDays: customizingTemplate.durationDays,
      startDate: new Date().toISOString(),
      status: 'Active',
      progress: 0,
      startTotalSaved: currentTotalSaved
    };

    setChallenges([newChallenge, ...challenges]);
    setIsCustomModalOpen(false);
    addActivity('goal', `Started challenge: "${formattedTitle}" 🚀`);
    showToast(`Challenge started! 🚀`, 'success');
  };

  const handleCancelChallenge = (id) => {
    const confirmStop = window.confirm('Are you sure you want to stop this challenge? Any current progress will be lost.');
    if (confirmStop) {
      setChallenges(challenges.filter(c => c.id !== id));
      showToast('Challenge stopped.', 'info');
    }
  };

  // Compile active & completed sets
  const activeChallenges = challenges.filter(c => c.status === 'Active' || c.status === 'Almost Complete');
  const completedChallenges = challenges.filter(c => c.status === 'Completed');
  const failedChallenges = challenges.filter(c => c.status === 'Failed');
  const historyChallenges = [...completedChallenges, ...failedChallenges].sort(
    (a, b) => new Date(b.completionDate) - new Date(a.completionDate)
  );

  // Compute Achievements (Interconnected logic)
  const totalSaved = savingsGoals.reduce((sum, g) => sum + g.currentSaved, 0);
  
  // Login/Logging streak check (based on distinct activity days in last 30 days)
  const loggedDates = new Set([
    ...activities.map(a => a.timestamp.substring(0, 10)),
    ...transactions.map(t => t.date.substring(0, 10))
  ]);
  let maxStreak = 0;
  let currentStreak = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().substring(0, 10);
    if (loggedDates.has(dateStr)) {
      currentStreak++;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    } else {
      currentStreak = 0;
    }
  }

  const achievementsList = [
    {
      id: 'first-challenge',
      title: 'First Challenge Completed',
      icon: '🏅',
      description: 'Complete your first money challenge.',
      current: completedChallenges.length,
      target: 1,
      unlocked: completedChallenges.length >= 1
    },
    {
      id: 'five-challenges',
      title: 'Five Challenges Completed',
      icon: '🥈',
      description: 'Complete five money challenges.',
      current: completedChallenges.length,
      target: 5,
      unlocked: completedChallenges.length >= 5
    },
    {
      id: 'savings-master',
      title: 'Savings Master',
      icon: '🥇',
      description: 'Build a net savings cushion of ₹20,000 or complete a Savings challenge.',
      current: totalSaved,
      target: 20000,
      unlocked: totalSaved >= 20000 || completedChallenges.some(c => c.type === 'savings')
    },
    {
      id: 'seven-day-streak',
      title: '7-Day Streak',
      icon: '🔥',
      description: 'Log transactions or goals on 7 consecutive days.',
      current: maxStreak,
      target: 7,
      unlocked: maxStreak >= 7
    },
    {
      id: 'ten-k-saved',
      title: '₹10,000 Saved',
      icon: '💎',
      description: 'Accumulate a total savings balance of ₹10,000.',
      current: totalSaved,
      target: 10000,
      unlocked: totalSaved >= 10000
    },
    {
      id: 'challenge-champion',
      title: 'Challenge Champion',
      icon: '🏆',
      description: 'Complete 3 distinct challenges.',
      current: completedChallenges.length,
      target: 3,
      unlocked: completedChallenges.length >= 3
    }
  ];

  // Statistics Computations
  const successRate = (completedChallenges.length + failedChallenges.length) > 0
    ? Math.round((completedChallenges.length / (completedChallenges.length + failedChallenges.length)) * 100)
    : 0;

  const totalRewards = completedChallenges.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      
      {/* 1. STATISTICS HEADER */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="saas-card p-4 flex flex-col justify-between">
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Active</span>
          <span className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{activeChallenges.length}</span>
        </div>
        <div className="saas-card p-4 flex flex-col justify-between">
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Completed</span>
          <span className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{completedChallenges.length}</span>
        </div>
        <div className="saas-card p-4 flex flex-col justify-between">
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Current Streak</span>
          <span className="text-xl font-extrabold text-amber-500 mt-1 flex items-center gap-1">
            🔥 {maxStreak}d
          </span>
        </div>
        <div className="saas-card p-4 flex flex-col justify-between">
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Success Rate</span>
          <span className="text-xl font-extrabold text-emerald-600 mt-1">{successRate}%</span>
        </div>
        <div className="saas-card p-4 flex flex-col justify-between col-span-2 md:col-span-1">
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Badges Won</span>
          <span className="text-xl font-extrabold text-indigo-500 mt-1">🏆 {totalRewards}</span>
        </div>
      </div>

      {/* 2. ACTIVE CHALLENGE SPOTLIGHT */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Active Challenges</h3>
        {activeChallenges.length === 0 ? (
          <div className="saas-card p-6 text-center text-[10px] text-slate-550 font-semibold italic">
            No active money challenges. Discover and start a challenge below!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeChallenges.map((c) => {
              const live = getLiveProgress(c);
              const pct = c.target > 0 ? Math.min((live.progress / c.target) * 100, 100) : 0;
              const isOverdue = live.daysLeft === 0;

              return (
                <div key={c.id} className="saas-card p-4 flex flex-col justify-between relative overflow-hidden border-slate-300 dark:border-slate-800">
                  <div className="absolute right-0 top-0 p-3 flex gap-2">
                    <span className="px-1.5 py-0.2 rounded text-[7px] font-bold uppercase border bg-brand-50 border-brand-200 text-brand-700 dark:bg-brand-950/20 dark:border-brand-900/40 dark:text-brand-400">
                      {live.status}
                    </span>
                    <button
                      onClick={() => handleCancelChallenge(c.id)}
                      className="text-slate-400 hover:text-rose-500 transition-colors"
                      title="Cancel Challenge"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-sm">🏆</span>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-xs truncate max-w-[200px]">{c.title}</h4>
                    </div>
                    <p className="text-[9.5px] text-slate-500 leading-normal mb-4">{c.description}</p>

                    {/* Progress details */}
                    <div className="space-y-1 mt-3.5">
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-brand-500 rounded-full" 
                          style={{ width: `${pct}%` }} 
                        />
                      </div>
                      <div className="flex justify-between items-center text-[8.5px] text-slate-455 font-bold uppercase">
                        <span>
                          {c.unit === '₹' ? currency : ''}
                          {live.progress.toLocaleString('en-IN')} / {c.unit === '₹' ? currency : ''}
                          {c.target.toLocaleString('en-IN')} {c.unit !== '₹' ? c.unit : ''}
                        </span>
                        <span>{pct.toFixed(0)}% Completed</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800/40 flex items-center justify-between text-[8px] font-bold uppercase text-slate-455">
                    <span>Reward: {c.badge}</span>
                    <span className={isOverdue ? 'text-rose-500' : 'text-slate-550'}>
                      {live.daysLeft} Days Remaining
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. DISCOVER CHALLENGES LIBRARY */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Discover Challenges</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CHALLENGE_TEMPLATES.map((tmpl) => {
            const isActive = activeChallenges.some(ac => ac.templateId === tmpl.id);
            return (
              <div key={tmpl.id} className="saas-card p-4 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-800 transition-colors">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-1.5 py-0.2 rounded text-[7px] font-bold uppercase border ${tmpl.difficultyColor}`}>
                      {tmpl.difficulty}
                    </span>
                    <span className="text-[8.5px] font-bold text-slate-400 uppercase">
                      {tmpl.rewardTier} Reward
                    </span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs mt-1.5">{tmpl.title}</h4>
                  <p className="text-[9px] text-slate-550 mt-1 leading-normal">{tmpl.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/40 flex items-center justify-between gap-3">
                  <span className="text-[8.5px] font-bold text-slate-500 uppercase">{tmpl.durationDays} Days</span>
                  <button
                    disabled={isActive}
                    onClick={() => handleStartChallengeTemplate(tmpl)}
                    className={`px-3 py-1 rounded text-[9px] font-bold uppercase transition-colors shadow-sm ${
                      isActive 
                        ? 'bg-slate-100 text-slate-400 dark:bg-slate-900 cursor-not-allowed border dark:border-slate-800'
                        : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900'
                    }`}
                  >
                    {isActive ? '🟢 Active' : 'Start'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. HISTORY & ACHIEVEMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        
        {/* Challenge History */}
        <div className="lg:col-span-2 saas-card p-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-3 pb-1 border-b dark:border-slate-800">
              Challenge History
            </h3>
            {historyChallenges.length === 0 ? (
              <div className="text-center py-10 text-[9px] text-slate-455 font-bold uppercase italic">
                No past settled challenges.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto thin-scrollbar pr-1">
                {historyChallenges.map((c) => (
                  <div key={c.id} className="p-2 border border-slate-105 dark:border-slate-850 rounded-lg flex items-center justify-between text-[9px] font-semibold gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-850 dark:text-slate-200 truncate">{c.title}</p>
                      <p className="text-[8px] text-slate-400 mt-0.5">
                        Badge: {c.badge} • Ended {new Date(c.completionDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`shrink-0 px-1.5 py-0.2 rounded text-[7px] font-bold uppercase ${
                      c.status === 'Completed' 
                        ? 'bg-emerald-50 border border-emerald-100 text-emerald-605 dark:bg-emerald-950/20' 
                        : 'bg-rose-50 border border-rose-100 text-rose-505 dark:bg-rose-955/20'
                    }`}>
                      {c.status === 'Completed' ? '🎉 Won' : '🔴 Failed'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Achievements & Rewards */}
        <div className="lg:col-span-3 saas-card p-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-3 pb-1 border-b dark:border-slate-800">
            Achievements & Rewards
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto thin-scrollbar pr-1">
            {achievementsList.map((ach) => (
              <div 
                key={ach.id} 
                className={`p-2.5 border rounded-xl flex items-start gap-2.5 transition-all ${
                  ach.unlocked 
                    ? 'border-indigo-200 bg-indigo-50/10 dark:border-indigo-900/30' 
                    : 'border-slate-200 dark:border-slate-850 opacity-60'
                }`}
              >
                <span className={`text-xl shrink-0 ${!ach.unlocked && 'filter grayscale'}`}>{ach.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-center gap-1.5">
                    <p className={`text-[10px] font-extrabold truncate ${ach.unlocked ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>
                      {ach.title}
                    </p>
                    {ach.unlocked && <span className="text-[8px] text-emerald-600 font-bold shrink-0">✓ Unlocked</span>}
                  </div>
                  <p className="text-[8px] text-slate-450 dark:text-slate-450 leading-normal mt-0.5">{ach.description}</p>
                  
                  {/* Progress bar towards unlock */}
                  {!ach.unlocked && ach.target > 1 && (
                    <div className="mt-2 space-y-0.5">
                      <div className="w-full h-1 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-slate-400 rounded-full" 
                          style={{ width: `${Math.min((ach.current / ach.target) * 100, 100)}%` }} 
                        />
                      </div>
                      <div className="flex justify-between text-[7px] font-semibold text-slate-455">
                        <span>
                          {ach.id === 'savings-master' || ach.id === 'ten-k-saved' ? currency : ''}
                          {ach.current.toLocaleString('en-IN')} progress
                        </span>
                        <span>
                          target: {ach.id === 'savings-master' || ach.id === 'ten-k-saved' ? currency : ''}
                          {ach.target.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 5. CUSTOM CHALLENGE START MODAL */}
      <AnimatePresence>
        {isCustomModalOpen && customizingTemplate && (
          <>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 pointer-events-auto" onClick={() => setIsCustomModalOpen(false)} />
            <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-sm shadow-xl p-5 pointer-events-auto"
              >
                <div className="flex justify-between items-center pb-2 border-b mb-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Customize: {customizingTemplate.title}
                  </h3>
                  <button onClick={() => setIsCustomModalOpen(false)} className="text-slate-400 hover:text-slate-900 text-sm font-bold">✕</button>
                </div>

                <form onSubmit={handleStartCustomChallenge} className="space-y-4">
                  <p className="text-[9.5px] text-slate-500 leading-normal">{customizingTemplate.description}</p>
                  
                  <div>
                    <label className="block text-[8.5px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Choose Target {customizingTemplate.type === 'savings' ? `(${currency})` : `(${customizingTemplate.unit})`}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {customizingTemplate.presets.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => { setSelectedPreset(preset); }}
                          className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition-all ${
                            selectedPreset === preset
                              ? 'bg-slate-900 border-slate-900 text-white dark:bg-slate-100 dark:border-slate-100 dark:text-slate-900'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-55 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-350'
                          }`}
                        >
                          {customizingTemplate.type === 'savings' ? currency : ''}
                          {preset.toLocaleString('en-IN')}
                          {customizingTemplate.type !== 'savings' ? ` ${customizingTemplate.unit}` : ''}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setSelectedPreset('custom')}
                        className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition-all ${
                          selectedPreset === 'custom'
                            ? 'bg-slate-900 border-slate-900 text-white dark:bg-slate-100 dark:border-slate-100 dark:text-slate-900'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-55 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-350'
                        }`}
                      >
                        Custom Target
                      </button>
                    </div>
                  </div>

                  {selectedPreset === 'custom' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="space-y-1.5 overflow-hidden"
                    >
                      <label className="block text-[8.5px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                        Enter Custom Target Amount
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={customAmountInput}
                        onChange={(e) => setCustomAmountInput(e.target.value)}
                        placeholder="e.g. 15000"
                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-900 dark:text-white"
                      />
                    </motion.div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-3 border-t">
                    <button
                      type="button"
                      onClick={() => setIsCustomModalOpen(false)}
                      className="px-3 py-1.5 border hover:bg-slate-55 text-[9px] uppercase font-bold rounded-lg text-slate-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[9px] uppercase font-bold hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900"
                    >
                      Start
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

export default MoneyChallenges;
