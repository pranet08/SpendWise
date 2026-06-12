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
  FiCalendar
} from 'react-icons/fi';

export const Transactions = () => {
  const { 
    user,
    transactions, 
    deleteTransaction, 
    calculateFinancialHealth, 
    currency,
    showToast
  } = useApp();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  // Simple Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // CSV EXPORT HELPER
  const exportToCSV = () => {
    if (transactions.length === 0) {
      showToast('No transaction data to export.', 'error');
      return;
    }
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

  // PDF PRINT TRIGGER
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
      className="space-y-5"
    >
      {/* 1. FILTER CONTROLS */}
      <div className="saas-card p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Transaction Logs</h2>
            <p className="text-[10px] text-slate-500 mt-0.5">Filter, search, and export your personal ledger data</p>
          </div>
          
          <div className="flex gap-2">
            {/* Export Dropdown buttons */}
            <button
              onClick={exportToCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-55 dark:hover:bg-slate-900 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-350 transition-colors"
            >
              <FiDownload className="w-3.5 h-3.5" />
              CSV
            </button>
            <button
              onClick={exportToPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-55 dark:hover:bg-slate-900 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-350 transition-colors"
            >
              <FiPrinter className="w-3.5 h-3.5" />
              PDF Report
            </button>
            <button
              onClick={openAddTransaction}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-lg text-xs font-semibold shadow transition-all duration-150"
            >
              <FiPlus className="w-3.5 h-3.5" />
              Add Record
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
              placeholder="Search details..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
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
                className={`flex-1 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
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
      <div className="saas-card p-4">
        {paginatedTxs.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-500">
            No matching transactions found.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto thin-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-150 dark:border-slate-800 text-[10px] font-bold uppercase text-slate-400">
                    <th className="pb-2 pl-1">Description</th>
                    <th className="pb-2">Category</th>
                    <th className="pb-2">Method</th>
                    <th className="pb-2">Date</th>
                    <th className="pb-2 text-right">Amount</th>
                    <th className="pb-2 text-right pr-1">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {paginatedTxs.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                      <td className="py-2.5 pl-1 max-w-[180px] truncate">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-slate-900 dark:text-white truncate">{tx.title}</p>
                          {tx.isRecurring && (
                            <FiRepeat className="w-3 h-3 text-brand-500 animate-pulse shrink-0" title="Recurring Automated Transaction" />
                          )}
                        </div>
                        {tx.notes && <p className="text-[9px] text-slate-400 truncate mt-0.5">{tx.notes}</p>}
                      </td>
                      <td className="py-2.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-655 dark:text-slate-350 rounded-full font-medium text-[10px]">
                          <FiTag className="w-2.5 h-2.5 text-slate-400" />
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-500">{tx.paymentMethod}</td>
                      <td className="py-2.5 text-slate-500">
                        {new Date(tx.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-2.5 text-right font-extrabold text-sm">
                        <span className={tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                          {tx.type === 'income' ? '+' : '-'}{currency}{tx.amount.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="py-2.5 text-right pr-1">
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
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 font-bold">
                <span>Page {currentPage} of {totalPages} ({filteredTxs.length} items)</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 border border-slate-200 dark:border-slate-850 hover:bg-slate-55 dark:hover:bg-slate-950 rounded disabled:opacity-40"
                  >
                    <FiChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 border border-slate-200 dark:border-slate-850 hover:bg-slate-55 dark:hover:bg-slate-950 rounded disabled:opacity-40"
                  >
                    <FiChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. HIDDEN PRINT CONTAINER (Rendered only on window.print()) */}
      <div id="spendwise-print-report" className="hidden print:block p-8 space-y-6">
        <div className="flex justify-between items-start border-b pb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-950">SpendWise Report</h1>
            <p className="text-xs text-slate-500 mt-1">Generated: {new Date().toLocaleDateString()} | User: {user?.email}</p>
          </div>
          <div className="text-right">
            <span className="text-xs uppercase font-bold text-slate-400">Health Rating</span>
            <p className="text-lg font-black text-slate-900">{health.score}/100 ({health.rating})</p>
          </div>
        </div>

        {/* Print Summary Metrics */}
        <div className="grid grid-cols-3 gap-4 border p-4 rounded-xl bg-slate-50/20">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Income ({currentMonthName})</span>
            <p className="text-base font-bold text-emerald-600">+{currency}{totalIncome.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Expenses ({currentMonthName})</span>
            <p className="text-base font-bold text-rose-600">-{currency}{totalExpenses.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Net Savings</span>
            <p className="text-base font-bold text-slate-900">
              {totalIncome - totalExpenses >= 0 ? '+' : ''}{currency}{(totalIncome - totalExpenses).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Print Health Score Factors */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Health Score Checklist</h3>
          <div className="border rounded-xl divide-y">
            {health.factors.map((f) => (
              <div key={f.id} className="p-2.5 flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold">{f.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{f.desc}</p>
                </div>
                <span className={`font-bold ${f.pass ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {f.pass ? '✓ Healthy' : '✗ Weak'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Print Transaction Log Table */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Ledger Details ({filteredTxs.length} items)</h3>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 pb-2 text-[10px] font-bold uppercase text-slate-400">
                <th className="pb-2">Description</th>
                <th className="pb-2">Category</th>
                <th className="pb-2">Date</th>
                <th className="pb-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredTxs.map((tx) => (
                <tr key={tx.id}>
                  <td className="py-2">
                    <p className="font-bold text-slate-900">{tx.title}</p>
                    <p className="text-[9px] text-slate-400">{tx.paymentMethod}</p>
                  </td>
                  <td className="py-2">{tx.category}</td>
                  <td className="py-2">{new Date(tx.date).toLocaleDateString()}</td>
                  <td className="py-2 text-right font-bold">
                    <span className={tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}>
                      {tx.type === 'income' ? '+' : '-'}{currency}{tx.amount.toLocaleString('en-IN')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
export default Transactions;
