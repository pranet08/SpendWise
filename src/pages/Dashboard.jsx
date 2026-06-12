import React, { useState, useEffect } from 'react';
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
  FiClock,
  FiAlertTriangle,
  FiActivity,
  FiTag,
  FiBookOpen,
  FiChevronRight
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
    toggleRecurringTransaction,
    editRecurringTransaction,
    geminiApiKey,
    currency,
    showToast
  } = useApp();

  // Local component states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeActivityFilter, setActiveActivityFilter] = useState('all');
  
  // AI Explainer state
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState('');
  const [aiError, setAiError] = useState('');

  // 1. CALCULATE FINANCIAL STATS FOR CURRENT MONTH
  const currentMonth = new Date().toISOString().substring(0, 7); // 'YYYY-MM'
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

  // Budget progress percentage
  const budgetUtilization = monthlyBudget > 0 ? Math.round((monthlyExpenses / monthlyBudget) * 100) : 0;
  
  // Savings goal progress percentage
  const savingsProgress = totalGoalTarget > 0 ? Math.round((totalSavings / totalGoalTarget) * 100) : 0;

  // Largest expense this month
  const currentMonthExpenses = transactions.filter((t) => t.type === 'expense' && t.date.startsWith(currentMonth));
  const largestExpense = currentMonthExpenses.length > 0 
    ? currentMonthExpenses.reduce((max, t) => t.amount > max.amount ? t : max, currentMonthExpenses[0])
    : null;

  // Highest spending category
  const categoryExpenses = currentMonthExpenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});
  const highestCategory = Object.keys(categoryExpenses).length > 0
    ? Object.keys(categoryExpenses).reduce((a, b) => categoryExpenses[a] > categoryExpenses[b] ? a : b)
    : 'None';

  // Get financial health details
  const health = calculateFinancialHealth();

  // 2. CALCULATE DETERMINISTIC INSIGHTS
  const getDeterministicInsights = () => {
    const list = [];
    
    // Average daily spending
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const elapsedDays = Math.min(new Date().getDate(), daysInMonth);
    const avgDaily = Math.round(monthlyExpenses / elapsedDays);
    list.push(`Average daily spending is ${currency}${avgDaily.toLocaleString('en-IN')} over ${elapsedDays} days.`);

    // Budget check
    if (budgetUtilization > 100) {
      list.push(`Budget limit exceeded by ${budgetUtilization - 100}%. Avoid discretionary purchases.`);
    } else if (budgetUtilization > 80) {
      list.push(`Nearing budget limit. Current utilization is at ${budgetUtilization}%.`);
    } else {
      list.push(`Budget utilization is healthy at ${budgetUtilization}% (${currency}${(monthlyBudget - monthlyExpenses).toLocaleString('en-IN')} remaining).`);
    }

    // Largest spend
    if (largestExpense) {
      list.push(`Largest expense: "${largestExpense.title}" of ${currency}${largestExpense.amount.toLocaleString('en-IN')} on ${largestExpense.date}.`);
    }

    // Category spend
    if (highestCategory !== 'None') {
      list.push(`Highest spending category this month: "${highestCategory}" (${currency}${categoryExpenses[highestCategory].toLocaleString('en-IN')}).`);
    }

    // Savings rate
    const savingsRate = monthlyIncome > 0 ? Math.round(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100) : 0;
    if (savingsRate >= 20) {
      list.push(`Excellent savings rate: saving ${savingsRate}% of your current monthly income.`);
    } else if (savingsRate > 0) {
      list.push(`Savings rate is ${savingsRate}%. Try optimizing subscriptions to reach 20% benchmark.`);
    } else if (monthlyIncome > 0) {
      list.push(`Negative savings rate. Spending exceeds monthly earnings by ${currency}${Math.abs(monthlyIncome - monthlyExpenses).toLocaleString('en-IN')}.`);
    }

    return list;
  };

  const deterministicInsights = getDeterministicInsights();

  // 3. TRIGGER REAL GEMINI API CALL FOR EXPLANATIONS
  const explainWithGemini = async () => {
    if (!geminiApiKey) {
      setAiError('Please configure your Gemini API Key in the Settings tab to generate AI explanations.');
      setIsAiOpen(true);
      return;
    }

    setAiLoading(true);
    setAiError('');
    setIsAiOpen(true);

    try {
      const prompt = `You are SpendWise AI, an expert fintech financial coach. Explain these verified user metrics in a clear, brief, professional advisor layout. Identify issues, and suggest 3 highly actionable recommendations. Cite the metrics explicitly. Keep it brief. 

Verified Metrics:
- Current Month: ${currentMonthName}
- Income: ${currency}${monthlyIncome.toLocaleString('en-IN')}
- Expense: ${currency}${monthlyExpenses.toLocaleString('en-IN')}
- Net Flow: ${currency}${(monthlyIncome - monthlyExpenses).toLocaleString('en-IN')}
- Savings Goals Saved: ${currency}${totalSavings.toLocaleString('en-IN')}
- Monthly Budget Utilized: ${budgetUtilization}% (Limit: ${currency}${monthlyBudget.toLocaleString('en-IN')})
- Financial Health Score: ${health.score}/100 (${health.rating})
- Insights Calculated: ${deterministicInsights.join('; ')}

Format: Bullet points, bold keywords, short lines, professional tone. No calculations.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) {
        throw new Error('API key invalid or network error. Check your settings.');
      }

      const data = await response.json();
      if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        setAiText(data.candidates[0].content.parts[0].text);
      } else {
        throw new Error('Empty response received from Gemini.');
      }
    } catch (err) {
      setAiError(err.message || 'Failed to call Gemini API.');
    } finally {
      setAiLoading(false);
    }
  };

  // 4. FILTER UPCOMING BILLS (Due within next 15 days)
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

    // Sort by soonest due
    return upcoming.sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate));
  };

  const upcomingBills = getUpcomingBills();

  // Mark an upcoming bill as paid
  const handleMarkBillAsPaid = (item) => {
    // 1. Add normal transaction
    const newTx = {
      title: `${item.title} (Bill Paid)`,
      amount: Number(item.amount),
      type: 'expense',
      category: item.category,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: item.paymentMethod,
      notes: `Recurring payment marked as paid manually.`,
      isRecurring: true
    };
    addTransaction(newTx);

    // 2. Push nextDueDate forward
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
    showToast(`Marked "${item.title}" bill as paid.`, 'success');
  };

  // 5. FILTER TIMELINE ACTIVITIES
  const filteredActivities = activities.filter((act) => {
    if (activeActivityFilter === 'all') return true;
    if (activeActivityFilter === 'income') return act.type === 'income';
    if (activeActivityFilter === 'expense') return act.type === 'expense';
    if (activeActivityFilter === 'savings') return act.type === 'goal';
    if (activeActivityFilter === 'budgets') return act.type === 'budget' || act.type === 'recurring';
    return true;
  }).slice(0, 8); // limit dashboard view to 8

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      
      {/* 1. TOP SUMMARY BLOCK (Health & Monthly Summary side-by-side) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Flagship: Financial Health Score */}
        <div className="saas-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Financial Health</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                health.score >= 90 ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' :
                health.score >= 70 ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400' :
                'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
              }`}>
                {health.rating}
              </span>
            </div>
            
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white leading-none">{health.score}</span>
              <span className="text-xs text-slate-400 font-semibold">/ 100</span>
            </div>
          </div>

          <div className="space-y-1.5 mt-4">
            <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Contributors</span>
            <div className="divide-y divide-slate-100 dark:divide-slate-800/40 max-h-36 overflow-y-auto thin-scrollbar">
              {health.factors.map((f) => (
                <div key={f.id} className="py-1 flex items-center justify-between gap-2 text-[10px]">
                  <span className="text-slate-650 dark:text-slate-300 truncate">{f.label}</span>
                  <span className={`font-semibold shrink-0 ${f.pass ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                    {f.pass ? '✓ Healthy' : '✗ Weak'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Current Month Financial Summary Card */}
        <div className="saas-card p-5 lg:col-span-2 flex flex-col justify-between">
          <div className="flex justify-between items-center pb-2 border-b border-slate-150 dark:border-slate-800/80">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">{currentMonthName} Financial Statement</h3>
            <span className="text-[10px] font-bold text-slate-400">Deterministic Audit</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3">
            <div>
              <span className="text-[9px] text-slate-500 uppercase font-semibold">Total Income</span>
              <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">+{currency}{monthlyIncome.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 uppercase font-semibold">Total Expenses</span>
              <p className="text-sm font-extrabold text-rose-600 dark:text-rose-400">-{currency}{monthlyExpenses.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 uppercase font-semibold">Net Savings</span>
              <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                {monthlyIncome - monthlyExpenses >= 0 ? '+' : ''}{currency}{(monthlyIncome - monthlyExpenses).toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 uppercase font-semibold">Budget Status</span>
              <p className={`text-sm font-extrabold ${monthlyExpenses > monthlyBudget ? 'text-rose-600' : 'text-emerald-600'}`}>
                {monthlyExpenses > monthlyBudget ? 'Overspent' : 'Healthy'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/40 text-[10px] text-slate-650 dark:text-slate-400">
            <div>
              <span className="font-semibold text-slate-500 mr-1">Top Category:</span>
              <span className="text-slate-900 dark:text-slate-100 font-bold">{highestCategory}</span>
            </div>
            <div className="text-right">
              <span className="font-semibold text-slate-500 mr-1">Largest Expense:</span>
              <span className="text-slate-900 dark:text-slate-100 font-bold">
                {largestExpense ? `${largestExpense.title} (${currency}${largestExpense.amount})` : 'None'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Net Capital Balance"
          value={totalBalance}
          icon={<FiDollarSign className="w-4 h-4 text-brand-600 dark:text-brand-400" />}
          color="bg-slate-100 dark:bg-slate-800/50"
          trend={{ type: 'neutral', value: 'Live', text: 'cumulative funds' }}
        />
        <StatCard
          title="Monthly Income"
          value={monthlyIncome}
          icon={<FiTrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
          color="bg-emerald-50 dark:bg-emerald-950/20"
          trend={{ type: 'neutral', value: 'Salary', text: 'this month' }}
        />
        <StatCard
          title="Monthly Expenses"
          value={monthlyExpenses}
          icon={<FiTrendingDown className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
          color="bg-rose-50 dark:bg-rose-950/20"
          trend={{
            type: monthlyExpenses > monthlyBudget ? 'down' : 'up',
            value: `${budgetUtilization}%`,
            text: 'budget utilization'
          }}
        />
        <StatCard
          title="Savings Portfolio"
          value={totalSavings}
          icon={<FiAward className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
          color="bg-blue-50 dark:bg-blue-950/20"
          trend={{
            type: 'neutral',
            value: `${savingsProgress}%`,
            text: 'average progress'
          }}
        />
      </div>

      {/* 3. CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 saas-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs">Spending Velocity</h3>
            <span className="text-[10px] font-bold text-slate-400">Current Cycle</span>
          </div>
          <div className="h-56">
            <TrendsLineChart transactions={transactions} />
          </div>
        </div>

        <div className="lg:col-span-2 saas-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs">Expenditures Category</h3>
            <span className="text-[10px] font-bold text-slate-400">Proportions</span>
          </div>
          <div className="h-56 flex items-center justify-center">
            <CategoryPieChart transactions={transactions} />
          </div>
        </div>
      </div>

      {/* 4. MID ROW: INSIGHTS & UPCOMING BILLS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Smart Insights Panel */}
        <div className="saas-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-xs">Audit Smart Insights</h3>
              <button
                onClick={explainWithGemini}
                className="flex items-center gap-1 text-[10px] font-bold text-brand-600 dark:text-brand-400 hover:underline"
              >
                <FiCpu className="w-3.5 h-3.5" />
                Explain with Gemini
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto thin-scrollbar pr-1">
              {deterministicInsights.map((insight, index) => (
                <div key={index} className="flex gap-2 items-start text-[11px] text-slate-650 dark:text-slate-350 leading-relaxed py-0.5">
                  <span className="text-brand-500 font-bold shrink-0 mt-0.5">•</span>
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Bills Checklist */}
        <div className="saas-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-xs">Upcoming Bills (15 Days)</h3>
              <span className="text-[10px] text-slate-500 font-bold">{upcomingBills.length} Bills Pending</span>
            </div>

            {upcomingBills.length === 0 ? (
              <div className="py-8 text-center text-[11px] text-slate-500">
                No recurring bills due in the next 15 days.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto thin-scrollbar pr-1">
                {upcomingBills.map((item) => {
                  const isOverdue = new Date(item.nextDueDate) < new Date();
                  return (
                    <div 
                      key={item.id} 
                      className="p-2 border border-slate-100 dark:border-slate-800/80 rounded-lg flex items-center justify-between gap-3 text-[11px] hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white truncate">{item.title}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-[9px] text-slate-400">
                          <span className={`font-semibold ${isOverdue ? 'text-rose-500' : 'text-slate-500'}`}>
                            Due: {new Date(item.nextDueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                          <span>•</span>
                          <span>{item.recurrence}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-extrabold text-slate-900 dark:text-slate-100">
                          {currency}{Number(item.amount).toLocaleString('en-IN')}
                        </span>
                        <button
                          onClick={() => handleMarkBillAsPaid(item)}
                          className="p-1 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-400 hover:text-emerald-600 rounded border border-slate-200 dark:border-slate-800 transition-colors"
                          title="Mark paid"
                        >
                          <FiCheck className="w-3.5 h-3.5" />
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

      {/* 5. BOTTOM ROW: RECENT TRANSACTIONS & ACTIVITY TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Recent Transactions (Takes 2 Columns) */}
        <div className="lg:col-span-2 saas-card p-5">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs">Recent Settlements</h3>
            <Link
              to="/transactions"
              className="flex items-center gap-1 text-[10px] font-bold text-brand-600 dark:text-brand-400 hover:underline"
            >
              All Records
              <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-500">
              No transactions recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto thin-scrollbar">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase text-slate-400">
                    <th className="pb-2 pl-1">Details</th>
                    <th className="pb-2">Category</th>
                    <th className="pb-2">Date</th>
                    <th className="pb-2 text-right pr-1">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {transactions.slice(0, 5).map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                      <td className="py-2.5 pl-1 max-w-[120px] truncate">
                        <p className="font-bold text-slate-900 dark:text-white truncate">{tx.title}</p>
                        <p className="text-[9px] text-slate-400">{tx.paymentMethod}</p>
                      </td>
                      <td className="py-2.5">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300 rounded font-medium text-[9px]">
                          <FiTag className="w-2.5 h-2.5 text-slate-400" />
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-500">
                        {new Date(tx.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-2.5 text-right font-extrabold pr-1">
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

        {/* Activity Feed (Takes 1 Column) */}
        <div className="saas-card p-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs">Activity Logs</h3>
            <select
              value={activeActivityFilter}
              onChange={(e) => setActiveActivityFilter(e.target.value)}
              className="text-[9px] font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-0.5 focus:outline-none"
            >
              <option value="all">All Logs</option>
              <option value="income">Incomes</option>
              <option value="expense">Expenses</option>
              <option value="savings">Savings</option>
              <option value="budgets">Budgets</option>
            </select>
          </div>

          {filteredActivities.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">
              No recent activity log.
            </div>
          ) : (
            <div className="space-y-3 max-h-56 overflow-y-auto thin-scrollbar pr-1">
              {filteredActivities.map((act) => (
                <div key={act.id} className="flex gap-2 items-start text-[10px]">
                  <div className={`mt-0.5 p-1 rounded ${
                    act.type === 'income' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' :
                    act.type === 'expense' ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400' :
                    act.type === 'goal' ? 'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' :
                    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    <FiActivity className="w-3 h-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-750 dark:text-slate-300 leading-normal font-medium">{act.message}</p>
                    <span className="text-[8px] text-slate-400 block mt-0.5">
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
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAiOpen(false)}
              className="fixed inset-0 bg-black z-50 pointer-events-auto"
            />
            {/* Explainer Drawer (Slide out from right) */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-6 overflow-y-auto flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <FiCpu className="w-5 h-5 text-brand-500" />
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">Gemini AI Explainer</h3>
                  </div>
                  <button
                    onClick={() => setIsAiOpen(false)}
                    className="p-1 hover:bg-slate-150 dark:hover:bg-slate-800 rounded-lg text-slate-500"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-5 space-y-4">
                  {aiLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                      <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
                      <p className="text-xs text-slate-500 font-bold">Consulting Gemini Advisor...</p>
                    </div>
                  ) : aiError ? (
                    <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 rounded-xl space-y-3">
                      <div className="flex items-start gap-2 text-rose-800 dark:text-rose-350 text-[11px] leading-relaxed">
                        <FiAlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                        <div>
                          <p className="font-bold">Missing Gemini API Configuration</p>
                          <p className="mt-1">{aiError}</p>
                        </div>
                      </div>
                      <Link
                        to="/settings"
                        onClick={() => setIsAiOpen(false)}
                        className="flex items-center justify-center gap-1.5 w-full py-2 bg-rose-650 hover:bg-rose-600 text-white rounded-lg text-[10px] font-bold shadow transition-colors"
                      >
                        Set API Key in Settings
                        <FiChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ) : (
                    <div className="text-[11px] leading-relaxed text-slate-650 dark:text-slate-300 space-y-3 whitespace-pre-wrap font-medium">
                      {aiText}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[9px] text-slate-400 text-center leading-normal">
                AI can make mistakes. All advice is informational. Underling financial score is deterministic.
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Standard TransactionModal triggered on dashboard */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </motion.div>
  );
};
export default Dashboard;
