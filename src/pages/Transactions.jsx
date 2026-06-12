import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { TransactionModal } from '../components/TransactionModal';
import {
  FiSearch,
  FiFilter,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiPrinter,
  FiRepeat,
  FiTag,
  FiTrendingUp
} from 'react-icons/fi';

export const Transactions = () => {
  const { 
    user,
    transactions, 
    deleteTransaction, 
    calculateFinancialHealth, 
    currency 
  } = useApp();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  // Simple Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Modal control state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalEditId, setModalEditId] = useState(null);

  // Available categories
  const categories = ['All', 'Food', 'Shopping', 'Travel', 'Bills', 'Entertainment', 'Education', 'Salary'];

  // FILTER LOGIC
  const filteredTxs = transactions.filter((tx) => {
    const matchesSearch = tx.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || tx.category === selectedCategory;
    const matchesType = selectedType === 'All' || tx.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  // PAGINATION CALCULATIONS
  const totalPages = Math.ceil(filteredTxs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTxs = filteredTxs.slice(startIndex, startIndex + itemsPerPage);

  const openAddTransaction = () => {
    setModalEditId(null);
    setIsModalOpen(true);
  };

  const openEditTransaction = (id) => {
    setModalEditId(id);
    setIsModalOpen(true);
  };

  // CSV EXPORT
  const exportToCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['ID', 'Title', 'Amount', 'Type', 'Category', 'Date', 'Payment Method', 'Recurring', 'Notes'];
    const csvRows = [
      headers.join(','),
      ...transactions.map((tx) =>
        [
          tx.id,
          `"${tx.title.replace(/"/g, '""')}"`,
          tx.amount,
          tx.type,
          tx.category,
          tx.date,
          tx.paymentMethod,
          tx.isRecurring ? 'Yes' : 'No',
          `"${(tx.notes || '').replace(/"/g, '""')}"`,
        ].join(',')
      ),
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `spendwise_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF PRINT
  const exportToPDF = () => {
    window.print();
  };

  // Compile statistics for PDF printable report
  const currentMonth = new Date().toISOString().substring(0, 7);
  const currentMonthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const health = calculateFinancialHealth();
  const totalIncome = transactions
    .filter((t) => t.type === 'income' && t.date.startsWith(currentMonth))
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonth))
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* 1. FILTER CONTROLS */}
      <div className="saas-card p-4 space-y-4 no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Transactions</h2>
            <p className="text-[10px] text-slate-500 mt-0.5">Search, filter and manage your transactions</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-55 dark:hover:bg-slate-900 rounded-lg text-[10px] font-bold uppercase text-slate-700 dark:text-slate-350 transition-colors"
            >
              <FiDownload className="w-3.5 h-3.5" />
              CSV
            </button>
            <button
              onClick={exportToPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-55 dark:hover:bg-slate-900 rounded-lg text-[10px] font-bold uppercase text-slate-700 dark:text-slate-350 transition-colors"
            >
              <FiPrinter className="w-3.5 h-3.5" />
              PDF Report
            </button>
            <button
              onClick={openAddTransaction}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-lg text-[10px] font-bold uppercase shadow transition-all duration-150"
            >
              <FiPlus className="w-3.5 h-3.5" />
              Add Transaction
            </button>
          </div>
        </div>

        {/* Filters and Search Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <FiSearch className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Search by title..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white text-xs focus:outline-none"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <FiFilter className="w-3.5 h-3.5" />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white text-xs focus:outline-none appearance-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-0.5 rounded-lg sm:col-span-2">
            {['All', 'income', 'expense'].map((type) => (
              <button
                key={type}
                onClick={() => { setSelectedType(type); setCurrentPage(1); }}
                className={`flex-1 py-1 rounded-md text-[9px] font-bold uppercase transition-all ${
                  selectedType === type
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                {type === 'All' ? 'All Types' : type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. TRANSACTION TABLE */}
      <div className="saas-card p-4 no-print">
        {paginatedTxs.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-500">
            No matching transactions found.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto thin-scrollbar">
              <table className="w-full text-left border-collapse text-xs font-semibold">
                <thead>
                  <tr className="border-b border-slate-150 dark:border-slate-800 text-[9px] font-bold uppercase text-slate-400">
                    <th className="pb-2 pl-1">Title</th>
                    <th className="pb-2">Category</th>
                    <th className="pb-2">Payment Method</th>
                    <th className="pb-2">Date</th>
                    <th className="pb-2 text-right">Amount</th>
                    <th className="pb-2 text-right pr-1">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {paginatedTxs.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                      <td className="py-3 pl-1 max-w-[180px] truncate">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-slate-900 dark:text-white truncate">{tx.title}</p>
                          {tx.isRecurring && (
                            <FiRepeat className="w-3 h-3 text-brand-500 shrink-0" title="Recurring Transaction" />
                          )}
                        </div>
                        {tx.notes && <p className="text-[9px] text-slate-450 truncate mt-0.5">{tx.notes}</p>}
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-655 dark:text-slate-350 rounded font-medium text-[9px]">
                          <FiTag className="w-2.5 h-2.5 text-slate-450" />
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3 text-slate-550">{tx.paymentMethod}</td>
                      <td className="py-3 text-slate-550">
                        {new Date(tx.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-3 text-right font-extrabold text-sm">
                        <span className={tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-455'}>
                          {tx.type === 'income' ? '+' : '-'}{currency}{tx.amount.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="py-3 text-right pr-1">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditTransaction(tx.id)}
                            className="p-1 text-slate-400 hover:text-slate-950 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteTransaction(tx.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                <span>Page {currentPage} of {totalPages} ({filteredTxs.length} items)</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 border border-slate-200 dark:border-slate-855 hover:bg-slate-55 dark:hover:bg-slate-950 rounded disabled:opacity-40"
                  >
                    <FiChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 border border-slate-200 dark:border-slate-855 hover:bg-slate-55 dark:hover:bg-slate-950 rounded disabled:opacity-40"
                  >
                    <FiChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. PRINT CONTAINER (Specifically styled for printing) */}
      <div id="spendwise-print-report" className="hidden print:block p-8 space-y-6">
        
        {/* Print Header with SpendWise Logo */}
        <div className="flex justify-between items-start border-b pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-sm">S</div>
              <span className="font-extrabold text-lg tracking-tight text-slate-950">SpendWise</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 font-semibold">
              Generated on: {new Date().toLocaleDateString()} | User: {user?.name || 'User'} ({user?.email})
            </p>
          </div>
          <div className="text-right">
            <span className="text-[9px] uppercase font-bold text-slate-400">Financial Score</span>
            <p className="text-lg font-black text-slate-900">{health.score} ({health.rating})</p>
          </div>
        </div>

        {/* Print Monthly Summary */}
        <div className="border border-slate-350 rounded-xl p-4 bg-slate-50/10 space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{currentMonthName} Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-[9px] text-slate-450 uppercase font-bold">Income</span>
              <p className="text-sm font-bold text-emerald-650">+{currency}{totalIncome.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <span className="text-[9px] text-slate-455 uppercase font-bold">Expenses</span>
              <p className="text-sm font-bold text-rose-650">-{currency}{totalExpenses.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <span className="text-[9px] text-slate-455 uppercase font-bold">Money Left This Month</span>
              <p className="text-sm font-bold text-slate-900">
                {totalIncome - totalExpenses >= 0 ? '+' : ''}{currency}{(totalIncome - totalExpenses).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-2 gap-5 print-section">
          {/* Income vs Expenses Chart */}
          <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/10 space-y-3">
            <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">Income vs Expenses</h4>
            <div className="space-y-3 pt-1">
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-slate-550">
                  <span>Income</span>
                  <span>{currency}{totalIncome.toLocaleString('en-IN')}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 border border-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full animate-none" style={{ width: `${totalIncome === 0 ? 0 : (totalIncome >= totalExpenses ? 100 : (totalIncome / totalExpenses) * 100)}%` }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-slate-550">
                  <span>Expenses</span>
                  <span>{currency}{totalExpenses.toLocaleString('en-IN')}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 border border-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full animate-none" style={{ width: `${totalExpenses === 0 ? 0 : (totalExpenses >= totalIncome ? 100 : (totalExpenses / totalIncome) * 100)}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Spending by Category Chart */}
          <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/10 space-y-3">
            <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">Spending by Category</h4>
            <div className="space-y-2 pt-1 max-h-36 overflow-hidden">
              {Object.keys(
                transactions
                  .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonth))
                  .reduce((acc, curr) => {
                    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
                    return acc;
                  }, {})
              ).slice(0, 4).map((cat, idx, arr) => {
                const spends = transactions
                  .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonth))
                  .reduce((acc, curr) => {
                    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
                    return acc;
                  }, {});
                const amt = spends[cat];
                const pct = totalExpenses > 0 ? (amt / totalExpenses) * 100 : 0;
                return (
                  <div key={cat} className="space-y-0.5">
                    <div className="flex justify-between text-[8px] font-semibold text-slate-550">
                      <span>{cat}</span>
                      <span>{pct.toFixed(0)}% ({currency}{amt.toLocaleString('en-IN')})</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 border border-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-700 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              {Object.keys(
                transactions
                  .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonth))
                  .reduce((acc, curr) => {
                    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
                    return acc;
                  }, {})
              ).length === 0 && (
                <div className="text-[9px] text-slate-400 italic text-center py-4">No expenses recorded</div>
              )}
            </div>
          </div>
        </div>

        {/* Score Breakdown factors */}
        <div className="space-y-2 print-section">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Score Breakdown</h3>
          <div className="border border-slate-350 rounded-xl divide-y text-xs">
            {['budget-adherence', 'savings-rate', 'goals-progress', 'budget-buffer'].map((id) => {
              const f = health.factors.find((x) => x.id === id);
              if (!f) return null;
              let displayLabel = f.label;
              if (f.id === 'budget-buffer') {
                displayLabel = f.pass ? 'Spending Under Control' : 'Spending Too High';
              }
              return (
                <div key={f.id} className="p-2 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-800">{displayLabel}</p>
                    <p className="text-[9px] text-slate-550 mt-0.5">{f.desc}</p>
                  </div>
                  <span className={`font-bold ${f.pass ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {f.pass ? '✓ Healthy' : '✗ Weak'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Print Ledger Details Table */}
        <div className="space-y-2 print-section">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Transactions Details ({filteredTxs.length} items)</h3>
          <table className="w-full text-left border-collapse text-[10px] font-medium">
            <thead>
              <tr className="border-b border-slate-350 pb-1.5 text-[9px] font-bold uppercase text-slate-455">
                <th className="pb-2">Title</th>
                <th className="pb-2">Category</th>
                <th className="pb-2">Date</th>
                <th className="pb-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTxs.slice(0, 15).map((tx) => (
                <tr key={tx.id}>
                  <td className="py-2.5">
                    <p className="font-bold text-slate-900">{tx.title}</p>
                    <p className="text-[8px] text-slate-400">{tx.paymentMethod}</p>
                  </td>
                  <td className="py-2.5 text-slate-700">{tx.category}</td>
                  <td className="py-2.5 text-slate-700">{new Date(tx.date).toLocaleDateString()}</td>
                  <td className="py-2.5 text-right font-bold">
                    <span className={tx.type === 'income' ? 'text-emerald-650' : 'text-rose-650'}>
                      {tx.type === 'income' ? '+' : '-'}{currency}{tx.amount.toLocaleString('en-IN')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTxs.length > 15 && (
            <p className="text-[8.5px] text-slate-400 italic text-center pt-2">Showing first 15 transactions on summary statement.</p>
          )}
        </div>

        {/* Print Page Footer */}
        <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-[8px] text-slate-455 font-bold uppercase tracking-wider">
          <span>SpendWise Summary Report</span>
          <span>Page 1 of 1</span>
        </div>

      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editId={modalEditId}
      />
    </motion.div>
  );
};
export default Transactions;
