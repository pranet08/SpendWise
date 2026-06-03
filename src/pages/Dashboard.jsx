import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  FiTrash2,
  FiTag
} from 'react-icons/fi';

export const Dashboard = () => {
  const { 
    user, 
    transactions, 
    monthlyBudget, 
    savingsGoal, 
    currentSavings, 
    deleteTransaction 
  } = useApp();

  // Modal control states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalEditId, setModalEditId] = useState(null);

  // Calculate stats dynamically from transaction list
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBalance = totalIncome - totalExpenses;

  // Budget progress percentage
  const budgetUtilization = monthlyBudget > 0 ? ((totalExpenses / monthlyBudget) * 100).toFixed(0) : 0;
  
  // Savings goal progress percentage
  const savingsProgress = savingsGoal > 0 ? ((currentSavings / savingsGoal) * 100).toFixed(0) : 0;

  // Filter 5 most recent transactions
  const recentTransactions = transactions.slice(0, 5);

  const openAddTransaction = () => {
    setModalEditId(null);
    setIsModalOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* 1. WELCOME HEADER CONTAINER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-brand-600 via-indigo-600 to-blue-600 rounded-3xl text-white shadow-xl shadow-brand-500/10">
        <div>
          <h2 className="text-2xl font-bold">Welcome back, {user?.name || 'User'}!</h2>
          <p className="text-indigo-100 text-sm mt-1">
            Track your cash flow, analyze monthly spending, and manage your savings goals.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={openAddTransaction}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-brand-600 hover:bg-slate-50 rounded-xl text-sm font-semibold shadow transition-all duration-200"
          >
            <FiPlus className="w-4.5 h-4.5" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* 2. STAT CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Net Balance Card */}
        <StatCard
          title="Total Balance"
          value={totalBalance}
          icon={<FiDollarSign className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
          color="bg-indigo-50 dark:bg-indigo-950/50"
          trend={{
            type: 'neutral',
            value: 'Cash',
            text: 'available funds'
          }}
        />

        {/* Total Income Card */}
        <StatCard
          title="Total Income"
          value={totalIncome}
          icon={<FiTrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />}
          color="bg-emerald-50 dark:bg-emerald-950/50"
          trend={{
            type: 'neutral',
            value: 'Total',
            text: 'earnings'
          }}
        />

        {/* Total Expenses Card */}
        <StatCard
          title="Total Expenses"
          value={totalExpenses}
          icon={<FiTrendingDown className="w-6 h-6 text-rose-600 dark:text-rose-400" />}
          color="bg-rose-50 dark:bg-rose-950/50"
          trend={{
            type: totalExpenses > monthlyBudget ? 'down' : 'up', // Color red (down) if budget exceeded
            value: `${budgetUtilization}%`,
            text: 'of budget spent'
          }}
        />

        {/* Savings Tracker Card */}
        <StatCard
          title="Total Savings"
          value={currentSavings}
          icon={<FiAward className="w-6 h-6 text-amber-600 dark:text-amber-400" />}
          color="bg-amber-50 dark:bg-amber-950/50"
          trend={{
            type: 'neutral',
            value: `${savingsProgress}%`,
            text: 'of target saved'
          }}
        />
      </div>

      {/* 3. CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Spending Trend Line Chart (Takes 3 columns on large screens) */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Spending Trend</h3>
            <span className="text-xs font-semibold text-slate-400">This Month</span>
          </div>
          <TrendsLineChart transactions={transactions} />
        </div>

        {/* Category breakdown pie chart (Takes 2 columns on large screens) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Expense Breakdown</h3>
            <span className="text-xs font-semibold text-slate-400">By Category</span>
          </div>
          <CategoryPieChart transactions={transactions} />
        </div>
      </div>

      {/* 4. RECENT ACTIVITY LIST */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Recent Transactions</h3>
            <p className="text-xs text-slate-500 mt-1">Your latest transaction records</p>
          </div>
          <Link
            to="/transactions"
            className="flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline hover:gap-2.5 transition-all"
          >
            View All
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-slate-500">No transactions recorded yet.</p>
            <button
              onClick={openAddTransaction}
              className="mt-3 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              Add your first transaction
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase text-slate-400 tracking-wider">
                  <th className="pb-3 pl-2">Details</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Amount</th>
                  <th className="pb-3 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                    {/* Title + Payment Method */}
                    <td className="py-3.5 pl-2">
                      <p className="font-semibold text-slate-900 dark:text-white">{tx.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{tx.paymentMethod}</p>
                    </td>
                    
                    {/* Category Label */}
                    <td className="py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300 text-xs rounded-full font-medium">
                        <FiTag className="w-3 h-3 text-slate-400" />
                        {tx.category}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 text-slate-500">
                      <span className="flex items-center gap-1.5 text-xs">
                        <FiCalendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(tx.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 text-right font-bold">
                      <span className={tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                        {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* Delete Trigger */}
                    <td className="py-3.5 text-right pr-2">
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        className="p-1.5 text-slate-450 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors focus:outline-none"
                        title="Delete entry"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Unified form modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editId={modalEditId}
      />
    </motion.div>
  );
};
export default Dashboard;
