import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { useApp } from '../context/AppContext';

export const TransactionModal = ({ isOpen, onClose, editId = null }) => {
  const { addTransaction, editTransaction, transactions, showToast } = useApp();

  // Define categories and payment methods
  const categories = ['Food', 'Shopping', 'Travel', 'Bills', 'Entertainment', 'Education', 'Salary'];
  const paymentMethods = ['UPI', 'Card', 'Cash', 'Bank Transfer'];

  // Form states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [notes, setNotes] = useState('');

  // Validation error state
  const [errors, setErrors] = useState({});

  // Reset form helper
  const resetForm = () => {
    setTitle('');
    setAmount('');
    setType('expense');
    setCategory('Food');
    // Set date default to today in YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
    setPaymentMethod('UPI');
    setNotes('');
    setErrors({});
  };

  // Run when modal opens or when editing ID changes
  useEffect(() => {
    if (isOpen) {
      if (editId) {
        // Load details of the transaction we wish to edit
        const txToEdit = transactions.find((t) => t.id === editId);
        if (txToEdit) {
          setTitle(txToEdit.title);
          setAmount(txToEdit.amount.toString());
          setType(txToEdit.type);
          setCategory(txToEdit.category);
          setDate(txToEdit.date);
          setPaymentMethod(txToEdit.paymentMethod);
          setNotes(txToEdit.notes || '');
        }
      } else {
        resetForm();
      }
    }
  }, [isOpen, editId, transactions]);

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Perform basic validation checks
    const formErrors = {};
    if (!title.trim()) formErrors.title = 'Title is required';
    if (!amount || Number(amount) <= 0) formErrors.amount = 'Amount must be greater than 0';
    if (!date) formErrors.date = 'Date is required';

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      showToast('Please correct form errors.', 'error');
      return;
    }

    const txData = {
      title: title.trim(),
      amount: Number(amount),
      type,
      category,
      date,
      paymentMethod,
      notes: notes.trim()
    };

    if (editId) {
      editTransaction(editId, txData);
    } else {
      addTransaction(txData);
    }

    onClose(); // Close the modal
  };

  // Auto-adjust categories when type changes
  // E.g. If selecting 'Income', default category to 'Salary'
  const handleTypeChange = (selectedType) => {
    setType(selectedType);
    if (selectedType === 'income') {
      setCategory('Salary');
    } else {
      setCategory('Food');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Modal Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            {/* Modal Dialog Card */}
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.5 }}
              onClick={(e) => e.stopPropagation()} // Prevent backdrop click close from inside card
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header Title */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editId ? 'Edit Transaction' : 'Add New Transaction'}
                </h3>
                <button
                  onClick={onClose}
                  className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                
                {/* 1. Transaction Type Toggle (Income vs Expense) */}
                <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => handleTypeChange('expense')}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      type === 'expense'
                        ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('income')}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      type === 'income'
                        ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    Income
                  </button>
                </div>

                {/* 2. Title Input */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Coffee / Freelance bonus"
                    className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:focus:border-brand-400 ${
                      errors.title ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                    }`}
                  />
                  {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
                </div>

                {/* 3. Grid for Amount and Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Amount Input */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Amount (₹)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-semibold text-sm">
                        ₹
                      </div>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="any"
                        className={`w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:focus:border-brand-400 ${
                          errors.amount ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                        }`}
                      />
                    </div>
                    {errors.amount && <p className="text-xs text-rose-500 mt-1">{errors.amount}</p>}
                  </div>

                  {/* Date Input */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:focus:border-brand-400 ${
                        errors.date ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                      }`}
                    />
                    {errors.date && <p className="text-xs text-rose-500 mt-1">{errors.date}</p>}
                  </div>
                </div>

                {/* 4. Grid for Category & Payment Method */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category Dropdown */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    >
                      {/* If type is income, we might want to restrict categories, but showing all is simpler and cleaner for learning */}
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Payment Method Dropdown */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    >
                      {paymentMethods.map((pm) => (
                        <option key={pm} value={pm}>
                          {pm}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 5. Notes Input */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add extra remarks..."
                    rows="3"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:focus:border-brand-400 resize-none"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-xl text-slate-700 dark:text-slate-350 text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-brand-500/10 hover:shadow-lg transition-all"
                  >
                    {editId ? 'Save Changes' : 'Add Transaction'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
