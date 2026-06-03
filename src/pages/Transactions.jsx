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
  FiTrendingUp,
  FiTrendingDown,
  FiTag
} from 'react-icons/fi';

export const Transactions = () => {
  const { transactions, deleteTransaction } = useApp();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  // Simple Pagination state (8 records per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal control state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalEditId, setModalEditId] = useState(null);

  // Available categories
  const categories = ['All', 'Food', 'Shopping', 'Travel', 'Bills', 'Entertainment', 'Education', 'Salary'];

  // 1. FILTER LOGIC (Simple and readable)
  const filteredTxs = transactions.filter((tx) => {
    // Search Term match (case-insensitive substring check, no complex fuzzy logic)
    const matchesSearch = tx.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category match
    const matchesCategory = selectedCategory === 'All' || tx.category === selectedCategory;

    // Type match (income vs expense)
    const matchesType = selectedType === 'All' || tx.type === selectedType;

    return matchesSearch && matchesCategory && matchesType;
  });

  // 2. PAGINATION CALCULATIONS
  const totalPages = Math.ceil(filteredTxs.length / itemsPerPage);
  
  // Slice array to get only current page items
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

  // Reset pagination page to 1 when filters change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    setCurrentPage(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* HEADER SECTION: Search Bar, Filters & Action Button */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Transaction History</h2>
            <p className="text-xs text-slate-500 mt-1">Search, filter, and adjust your income and expense logs</p>
          </div>
          <button
            onClick={openAddTransaction}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-brand-500/10 transition-all duration-200"
          >
            <FiPlus className="w-4 h-4" />
            Add Transaction
          </button>
        </div>

        {/* SEARCH AND FILTERS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          
          {/* Simple Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <FiSearch className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by title..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* Category Dropdown Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <FiFilter className="w-4 h-4" />
            </div>
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 appearance-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Type Toggle Buttons (All, Income, Expenses) */}
          <div className="flex bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1 rounded-xl sm:col-span-2">
            {['All', 'income', 'expense'].map((type) => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                  selectedType === type
                    ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                {type === 'All' ? 'All' : type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TRANSACTION LIST TABLE CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        {paginatedTxs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-slate-500">No transactions match your search criteria.</p>
            {(searchTerm || selectedCategory !== 'All' || selectedType !== 'All') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                  setSelectedType('All');
                }}
                className="mt-3 text-xs text-brand-650 dark:text-brand-400 underline font-semibold hover:text-brand-500"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-150 dark:border-slate-850 text-xs font-bold uppercase text-slate-400 tracking-wider">
                    <th className="pb-3 pl-2">Description</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Payment Method</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3 text-right">Amount</th>
                    <th className="pb-3 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                  {paginatedTxs.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-55/30 dark:hover:bg-slate-800/10 transition-colors">
                      {/* Title & Notes */}
                      <td className="py-3.5 pl-2 max-w-[200px] truncate">
                        <p className="font-semibold text-slate-900 dark:text-white leading-tight">
                          {tx.title}
                        </p>
                        {tx.notes && (
                          <p className="text-[10px] text-slate-400 mt-1 truncate" title={tx.notes}>
                            {tx.notes}
                          </p>
                        )}
                      </td>

                      {/* Category Badge */}
                      <td className="py-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-105 dark:bg-slate-800 text-slate-650 dark:text-slate-300 text-xs rounded-full font-medium">
                          <FiTag className="w-3 h-3 text-slate-400" />
                          {tx.category}
                        </span>
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 text-slate-500 dark:text-slate-455 text-xs font-medium">
                        {tx.paymentMethod}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 text-slate-550 text-xs">
                        {new Date(tx.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 text-right font-bold text-base">
                        <span
                          className={
                            tx.type === 'income'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }
                        >
                          {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                        </span>
                      </td>

                      {/* Action buttons (Edit & Delete) */}
                      <td className="py-3.5 text-right pr-2">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditTransaction(tx.id)}
                            className="p-1.5 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Edit entry"
                          >
                            <FiEdit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteTransaction(tx.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                            title="Delete entry"
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

            {/* SIMPLE PAGINATION BAR */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500 font-medium">
                  Showing page {currentPage} of {totalPages} ({filteredTxs.length} items total)
                </span>
                
                <div className="flex items-center gap-1">
                  {/* Previous Button */}
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-xl text-slate-600 dark:text-slate-400 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
                  >
                    <FiChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Next Button */}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-xl text-slate-600 dark:text-slate-400 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
                  >
                    <FiChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Unified Add/Edit Form Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editId={modalEditId}
      />
    </motion.div>
  );
};
export default Transactions;
