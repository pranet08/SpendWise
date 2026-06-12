import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/StatCard';
import { TransactionModal } from '../components/TransactionModal';
import { CategoryPieChart } from '../charts/CategoryPieChart';
import { TrendsLineChart } from '../charts/TrendsLineChart';
import {
  FiPlus,
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiAward,
  FiArrowRight,
  FiCalendar,
  FiCheck,
  FiCpu,
  FiActivity,
  FiTag,
  FiChevronRight,
  FiInfo
} from 'react-icons/fi';

export const Dashboard = () => {
  const { 
    user, 
    transactions, 
    monthlyBudget, 
    savingsGoals,
    recurringTransactions,
    activities,
    calculateFinancialHealth,
    addTransaction,
    editRecurringTransaction,
    geminiApiKey,
    currency,
    showToast
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeActivityFilter, setActiveActivityFilter] = useState('all');
  
  // AI Explainer state
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState('');
  const [aiError, setAiError] = useState('');

  // 1. CALCULATE FINANCIAL STATS FOR CURRENT MONTH
  const currentMonth = new Date().toISOString().substring(0, 7);
  const currentMonthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  const monthlyIncome = transactions
    .filter((t) => t.type === 'income' && t.date.startsWith(currentMonth))
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = transactions
    .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonth))
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBalance = transactions
    .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);

  const totalSavings = savingsGoals.reduce((sum, g) => sum + g.currentSaved, 0);
  const totalGoalTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);

  const budgetUtilization = monthlyBudget > 0 ? Math.round((monthlyExpenses / monthlyBudget) * 100) : 0;
  const savingsProgress = totalGoalTarget > 0 ? Math.round((totalSavings / totalGoalTarget) * 100) : 0;

  const currentMonthExpenses = transactions.filter((t) => t.type === 'expense' && t.date.startsWith(currentMonth));
  const largestExpense = currentMonthExpenses.length > 0 
    ? currentMonthExpenses.reduce((max, t) => t.amount > max.amount ? t : max, currentMonthExpenses[0])
    : null;

  const categoryExpenses = currentMonthExpenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});
  const highestCategory = Object.keys(categoryExpenses).length > 0
    ? Object.keys(categoryExpenses).reduce((a, b) => categoryExpenses[a] > categoryExpenses[b] ? a : b)
    : 'None';

  const health = calculateFinancialHealth();

  // 2. CONCISE USER-FRIENDLY INSIGHTS
  const getDeterministicInsights = () => {
    const list = [];
    
    // Insight 1: Spending share on top category
    if (highestCategory !== 'None' && monthlyExpenses > 0) {
      const topPct = Math.round((categoryExpenses[highestCategory] / monthlyExpenses) * 100);
      list.push(`You spent ${topPct}% of your budget on ${highestCategory}.`);
    }

    // Insight 2: Savings portfolio increase
    if (totalSavings > 0) {
      list.push(`Your savings increased by ${currency}${totalSavings.toLocaleString('en-IN')} this month.`);
    }

    // Insight 3: Budget usage status
    if (budgetUtilization > 100) {
      list.push(`Monthly spending is higher than your set budget by ${currency}${(monthlyExpenses - monthlyBudget).toLocaleString('en-IN')}.`);
    } else {
      list.push(`You have ${currency}${(monthlyBudget - monthlyExpenses).toLocaleString('en-IN')} left in your budget.`);
    }

    // Insight 4: Savings goal proximity
    const closeGoal = savingsGoals.find(g => {
      const p = g.targetAmount > 0 ? (g.currentSaved / g.targetAmount) * 100 : 0;
      return p >= 75 && p < 100;
    });
    if (closeGoal) {
      list.push(`You are close to reaching your "${closeGoal.title}" savings goal.`);
    }

    return list.slice(0, 4); // Keep it strictly to max 4 items
  };

  const deterministicInsights = getDeterministicInsights();

  // 3. AI ADVISOR (Gemini integration with simulated fallback)
  const explainWithGemini = async () => {
    setIsAiOpen(true);
    setAiLoading(true);
    setAiError('');

    const activeKey = geminiApiKey || import.meta.env.VITE_GEMINI_API_KEY;

    // Direct simulated explanation fallback if no key is present (resembles professional analysis)
    if (!activeKey) {
      setTimeout(() => {
        const fallbackText = `### SpendWise Financial Advisory Report
**Prepared for ${user?.name || 'User'}**

Based on your current month calculations, your **Financial Score is ${health.score} (${health.rating})**. Here is an analysis of your metrics:

*   **Saving Habit**: Your savings rate is currently at **${(monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses)/monthlyIncome*100) : 0).toFixed(0)}%**. Maintaining a threshold of 20% or above is highly recommended to secure long-term capital stability.
*   **Budget Control**: You have utilized **${budgetUtilization}%** of your monthly budget limit. Spending is ${monthlyExpenses > monthlyBudget ? 'above' : 'within'} your desired boundaries.
*   **Money Left This Month**: You currently have **${currency}${(monthlyIncome - monthlyExpenses).toLocaleString('en-IN')}** remaining in cash flow surplus.

**Recommendations:**
1.  **Reduce Food & Dining Spends**: Your highest spending category is **${highestCategory}**. Try placing dining thresholds to increase money left at month-end.
2.  **Automate Savings Deposits**: Consider setting aside a portion of your income immediately when your salary transaction registers.
3.  **Audit Recurring Bills**: You have recurring expenses active. Dismiss inactive trials to reclaim budget room.`;
        setAiText(fallbackText);
        setAiLoading(false);
      }, 800);
      return;
    }

    try {
      const prompt = `You are SpendWise AI, an expert consumer finance advisor. Explain these user metrics. Identify issues, and suggest 3 recommendations. Keep it brief. 

User Metrics:
- Month: ${currentMonthName}
- Income: ${currency}${monthlyIncome.toLocaleString('en-IN')}
- Expenses: ${currency}${monthlyExpenses.toLocaleString('en-IN')}
- Money Left: ${currency}${(monthlyIncome - monthlyExpenses).toLocaleString('en-IN')}
- Savings: ${currency}${totalSavings.toLocaleString('en-IN')}
- Budget Control: ${budgetUtilization}% used
- Financial Score: ${health.score}/100 (${health.rating})
- Insights Calculated: ${deterministicInsights.join('; ')}

Format: Markdown, bold keywords, short lines, professional tone. No math calculation.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) {
        throw new Error('API key invalid or connection error.');
      }

      const data = await response.json();
      if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        setAiText(data.candidates[0].content.parts[0].text);
      } else {
        throw new Error('Empty response received from Gemini.');
      }
    } catch (err) {
      setAiError(err.message || 'Failed to connect to AI server.');
    } finally {
      setAiLoading(false);
    }
  };

  // 4. FILTER UPCOMING BILLS (Due within 15 days)
  const getUpcomingBills = () => {
    const upcoming = [];
    const today = new Date();
    const futureLimit = new Date();
    futureLimit.setDate(today.getDate() + 15);

    recurringTransactions.forEach((rec) => {
      if (!rec.active) return;
      const due = new Date(rec.nextDueDate);
      if (due <= futureLimit) {
        upcoming.push(rec);
      }
    });

    return upcoming.sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate));
  };

  const upcomingBills = getUpcomingBills();

  const handleMarkBillAsPaid = (item) => {
    const newTx = {
      title: `${item.title}`,
      amount: Number(item.amount),
      type: 'expense',
      category: item.category,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: item.paymentMethod,
      notes: `Recurring transaction paid.`,
      isRecurring: true
    };
    addTransaction(newTx);

    const nextDue = new Date(item.nextDueDate);
    if (item.recurrence === 'Daily') {
      nextDue.setDate(nextDue.getDate() + 1);
    } else if (item.recurrence === 'Weekly') {
      nextDue.setDate(nextDue.getDate() + 7);
    } else if (item.recurrence === 'Monthly') {
      nextDue.setMonth(nextDue.getMonth() + 1);
    } else if (item.recurrence === 'Yearly') {
      nextDue.setFullYear(nextDue.getFullYear() + 1);
    }

    const nextDueStr = nextDue.toISOString().split('T')[0];
    editRecurringTransaction(item.id, { ...item, nextDueDate: nextDueStr });
    showToast(`Paid "${item.title}" recurring bill.`, 'success');
  };

  const filteredActivities = activities.filter((act) => {
    if (activeActivityFilter === 'all') return true;
    if (activeActivityFilter === 'income') return act.type === 'income';
    if (activeActivityFilter === 'expense') return act.type === 'expense';
    if (activeActivityFilter === 'savings') return act.type === 'goal';
    if (activeActivityFilter === 'budgets') return act.type === 'budget' || act.type === 'recurring';
    return true;
  }).slice(0, 6);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-900">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Dashboard</h2>
          <p className="text-[10px] text-slate-500 mt-0.5">See your finances at a glance.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-lg text-xs font-bold transition-colors shadow-sm"
        >
          <FiPlus className="w-3.5 h-3.5" />
          Add Transaction
        </button>
      </div>

      {/* 1. SCORE CARD & SUMMARY SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Score widget */}
        <div className="saas-card p-4 flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Financial Score</span>
            <div className="mt-1.5 flex flex-col">
              <span className="text-3xl font-black text-slate-900 dark:text-white leading-none">{health.score}</span>
              <span className={`text-[11px] font-bold mt-1.5 ${
                health.score >= 90 ? 'text-emerald-600 dark:text-emerald-405' :
                health.score >= 70 ? 'text-blue-600 dark:text-blue-400' :
                health.score >= 50 ? 'text-amber-605 dark:text-amber-400' :
                'text-rose-600 dark:text-rose-455'
              }`}>
                {health.rating}
              </span>
            </div>
          </div>

          <div className="space-y-1 mt-4">
            <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Score Breakdown</span>
            <div className="divide-y divide-slate-100 dark:divide-slate-800/40 max-h-32 overflow-y-auto thin-scrollbar">
              {['budget-adherence', 'savings-rate', 'goals-progress', 'budget-buffer'].map((id) => {
                const f = health.factors.find((x) => x.id === id);
                if (!f) return null;
                let displayLabel = f.label;
                if (f.id === 'budget-buffer') {
                  displayLabel = f.pass ? 'Spending Under Control' : 'Spending Too High';
                }
                return (
                  <div key={f.id} className="py-1 flex items-center justify-between gap-2 text-[9px] font-semibold">
                    <span className="text-slate-600 dark:text-slate-400 truncate">{displayLabel}</span>
                    <span className={`shrink-0 ${f.pass ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                      {f.pass ? '✓' : '✗'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Monthly Summary card */}
        <div className="saas-card p-4 lg:col-span-2 flex flex-col justify-between">
          <div className="flex justify-between items-center pb-2 border-b border-slate-150 dark:border-slate-800/80">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{currentMonthName} Summary</h3>
            <span className="text-[9px] font-bold text-slate-400 uppercase">Updated Today</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3">
            <div>
              <span className="text-[9px] text-slate-500 uppercase font-semibold">Income</span>
              <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">+{currency}{monthlyIncome.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 uppercase font-semibold">Expenses</span>
              <p className="text-sm font-extrabold text-rose-600 dark:text-rose-400">-{currency}{monthlyExpenses.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 uppercase font-semibold">Money Left This Month</span>
              <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                {monthlyIncome - monthlyExpenses >= 0 ? '+' : ''}{currency}{(monthlyIncome - monthlyExpenses).toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 uppercase font-semibold">Budget Status</span>
              <p className={`text-sm font-extrabold ${monthlyExpenses > monthlyBudget ? 'text-rose-600' : 'text-emerald-600'}`}>
                {monthlyExpenses > monthlyBudget ? 'Over Budget' : 'Within Budget'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/40 text-[9px] text-slate-500 font-bold">
            <div>
              <span className="text-slate-400 uppercase mr-1">Top Category:</span>
              <span className="text-slate-900 dark:text-slate-100 font-extrabold">{highestCategory}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 uppercase mr-1">Largest Expense:</span>
              <span className="text-slate-900 dark:text-slate-100 font-extrabold">
                {largestExpense ? `${largestExpense.title} (${currency}${largestExpense.amount})` : 'None'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current Balance"
          value={totalBalance}
          icon={<FiDollarSign className="w-4 h-4 text-slate-800 dark:text-slate-100" />}
          color="bg-slate-100 dark:bg-slate-800/50"
          trend={{ type: 'neutral', value: 'Live', text: 'cumulative funds' }}
        />
        <StatCard
          title="Income"
          value={monthlyIncome}
          icon={<FiTrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-450" />}
          color="bg-emerald-50 dark:bg-emerald-950/20"
          trend={{ type: 'neutral', value: 'Salary', text: 'this month' }}
        />
        <StatCard
          title="Expenses"
          value={monthlyExpenses}
          icon={<FiTrendingDown className="w-4 h-4 text-rose-600 dark:text-rose-455" />}
          color="bg-rose-50 dark:bg-rose-950/20"
          trend={{
            type: monthlyExpenses > monthlyBudget ? 'down' : 'up',
            value: `${budgetUtilization}%`,
            text: 'budget usage'
          }}
        />
        <StatCard
          title="Savings"
          value={totalSavings}
          icon={<FiAward className="w-4 h-4 text-blue-600 dark:text-blue-450" />}
          color="bg-blue-50 dark:bg-blue-950/20"
          trend={{
            type: 'neutral',
            value: `${savingsProgress}%`,
            text: 'goal progress'
          }}
        />
      </div>

      {/* 3. CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 saas-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Spending Trend</h3>
            <span className="text-[9px] font-bold text-slate-400 uppercase">Current Cycle</span>
          </div>
          <div className="h-48">
            <TrendsLineChart transactions={transactions} />
          </div>
        </div>

        <div className="lg:col-span-2 saas-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Expense Breakdown</h3>
            <span className="text-[9px] font-bold text-slate-400 uppercase">Proportions</span>
          </div>
          <div className="h-48 flex items-center justify-center">
            <CategoryPieChart transactions={transactions} />
          </div>
        </div>
      </div>

      {/* 4. MID ROW: INSIGHTS & UPCOMING BILLS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Quick Insights */}
        <div className="saas-card p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5 mb-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Quick Insights</h3>
              <button
                onClick={explainWithGemini}
                className="flex items-center gap-1 text-[9px] font-bold text-brand-600 dark:text-brand-400 hover:underline"
              >
                <FiCpu className="w-3.5 h-3.5" />
                ✨ Explain
              </button>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto thin-scrollbar">
              {deterministicInsights.map((insight, index) => (
                <div key={index} className="flex gap-2 items-start text-[10px] text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
                  <span className="text-brand-500 shrink-0 mt-0.5">•</span>
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Bills Checklist */}
        <div className="saas-card p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5 mb-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Upcoming Bills (15 Days)</h3>
              <span className="text-[9px] text-slate-500 font-bold uppercase">{upcomingBills.length} Pending</span>
            </div>

            {upcomingBills.length === 0 ? (
              <div className="py-8 text-center text-[10px] text-slate-500">
                No recurring bills due in the next 15 days.
              </div>
            ) : (
              <div className="space-y-1 max-h-40 overflow-y-auto thin-scrollbar">
                {upcomingBills.map((item) => {
                  const isOverdue = new Date(item.nextDueDate) < new Date();
                  return (
                    <div 
                      key={item.id} 
                      className="p-1.5 border border-slate-100 dark:border-slate-800/80 rounded-lg flex items-center justify-between gap-3 text-[10px] hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors font-semibold"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white truncate">{item.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[8px] text-slate-400">
                          <span className={`font-semibold ${isOverdue ? 'text-rose-500' : 'text-slate-550'}`}>
                            Due: {new Date(item.nextDueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                          <span>•</span>
                          <span>{item.recurrence}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="font-extrabold text-slate-900 dark:text-slate-100">
                          {currency}{Number(item.amount).toLocaleString('en-IN')}
                        </span>
                        <button
                          onClick={() => handleMarkBillAsPaid(item)}
                          className="p-0.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-400 hover:text-emerald-600 rounded border border-slate-200 dark:border-slate-800 transition-colors"
                          title="Mark paid"
                        >
                          <FiCheck className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. BOTTOM ROW: RECENT TRANSACTIONS & ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Recent Transactions */}
        <div className="lg:col-span-2 saas-card p-4">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-1.5">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Recent Transactions</h3>
            <Link
              to="/transactions"
              className="flex items-center gap-1 text-[9px] font-bold text-brand-600 dark:text-brand-400 hover:underline"
            >
              All Records
              <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No transactions recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto thin-scrollbar">
              <table className="w-full text-left border-collapse text-[10px] font-semibold">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[8px] font-bold uppercase text-slate-455">
                    <th className="pb-1.5 pl-1">Title</th>
                    <th className="pb-1.5">Category</th>
                    <th className="pb-1.5">Date</th>
                    <th className="pb-1.5 text-right pr-1">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {transactions.slice(0, 4).map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                      <td className="py-2 pl-1 max-w-[120px] truncate">
                        <p className="font-bold text-slate-900 dark:text-white truncate">{tx.title}</p>
                        <p className="text-[8px] text-slate-400 font-semibold">{tx.paymentMethod}</p>
                      </td>
                      <td className="py-2">
                        <span className="inline-flex items-center gap-1 px-1 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-655 dark:text-slate-350 rounded font-medium text-[8px]">
                          <FiTag className="w-2.5 h-2.5 text-slate-400" />
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-2 text-slate-500">
                        {new Date(tx.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: '2-digit' })}
                      </td>
                      <td className="py-2 text-right font-extrabold pr-1">
                        <span className={tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                          {tx.type === 'income' ? '+' : '-'}{currency}{tx.amount.toLocaleString('en-IN')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Activity Timeline */}
        <div className="saas-card p-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5 mb-2">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Recent Activity</h3>
            <select
              value={activeActivityFilter}
              onChange={(e) => setActiveActivityFilter(e.target.value)}
              className="text-[8px] font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-0.5 focus:outline-none"
            >
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expenses</option>
              <option value="savings">Savings</option>
              <option value="budgets">Budget</option>
            </select>
          </div>

          {filteredActivities.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No recent activity.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-48 overflow-y-auto thin-scrollbar pr-0.5">
              {filteredActivities.slice(0, 5).map((act) => (
                <div key={act.id} className="flex gap-2 items-start text-[9px] font-semibold">
                  <div className={`mt-0.5 p-0.5 rounded shrink-0 ${
                    act.type === 'income' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' :
                    act.type === 'expense' ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400' :
                    act.type === 'goal' ? 'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' :
                    'bg-slate-100 text-slate-655 dark:bg-slate-800 dark:text-slate-455'
                  }`}>
                    <FiActivity className="w-2.5 h-2.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-750 dark:text-slate-350 leading-normal truncate">{act.message}</p>
                    <span className="text-[7.5px] text-slate-400 block mt-0.2">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* GEMINI AI EXPLAINER DRAWER */}
      <AnimatePresence>
        {isAiOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAiOpen(false)}
              className="fixed inset-0 bg-black z-50 pointer-events-auto"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-5 overflow-y-auto flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <FiCpu className="w-4 h-4 text-brand-500" />
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider">AI Explainer</h3>
                  </div>
                  <button
                    onClick={() => setIsAiOpen(false)}
                    className="p-1 hover:bg-slate-150 dark:hover:bg-slate-800 rounded text-slate-500 text-sm font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {aiLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                      <div className="w-6 h-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Analyzing Metrics...</p>
                    </div>
                  ) : aiError ? (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 rounded-xl space-y-2">
                      <div className="flex items-start gap-2 text-rose-800 dark:text-rose-350 text-[10px] leading-relaxed">
                        <FiInfo className="w-4 h-4 shrink-0 text-rose-500" />
                        <div>
                          <p className="font-bold">Error Loading AI</p>
                          <p className="mt-0.5">{aiError}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[10px] leading-relaxed text-slate-655 dark:text-slate-300 space-y-2.5 whitespace-pre-wrap font-semibold prose dark:prose-invert">
                      {aiText}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-[8px] text-slate-455 text-center leading-normal">
                AI recommendations are dynamically parsed based on calculated scoring vectors.
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </motion.div>
  );
};
export default Dashboard;
