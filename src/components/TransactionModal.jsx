import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { useApp } from '../context/AppContext';

export const TransactionModal = ({ isOpen, onClose, editId = null }) => {
  const { 
    addTransaction, 
    editTransaction, 
    addRecurringTransaction,
    transactions, 
    currency,
    showToast 
  } = useApp();

  const categories = ['Food', 'Shopping', 'Travel', 'Bills', 'Entertainment', 'Education', 'Salary'];
  const paymentMethods = ['UPI', 'Card', 'Cash', 'Bank Transfer'];

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrence, setRecurrence] = useState('Monthly');

  const [errors, setErrors] = useState({});

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setType('expense');
    setCategory('Food');
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
    setPaymentMethod('UPI');
    setNotes('');
    setIsRecurring(false);
    setRecurrence('Monthly');
    setErrors({});
  };

  useEffect(() => {
    if (isOpen) {
      if (editId) {
        const txToEdit = transactions.find((t) => t.id === editId);
        if (txToEdit) {
          setTitle(txToEdit.title);
          setAmount(txToEdit.amount.toString());
          setType(txToEdit.type);
          setCategory(txToEdit.category);
          setDate(txToEdit.date);
          setPaymentMethod(txToEdit.paymentMethod);
          setNotes(txToEdit.notes || '');
          setIsRecurring(txToEdit.isRecurring || false);
          setRecurrence('Monthly');
        }
      } else {
        resetForm();
      }
    }
  }, [isOpen, editId, transactions]);

  const handleSubmit = (e) => {
    e.preventDefault();

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
      notes: notes.trim(),
      isRecurring
    };

    if (editId) {
      editTransaction(editId, txData);
    } else {
      addTransaction(txData);

      if (isRecurring) {
        const baseDate = new Date(date);
        if (recurrence === 'Daily') {
          baseDate.setDate(baseDate.getDate() + 1);
        } else if (recurrence === 'Weekly') {
          baseDate.setDate(baseDate.getDate() + 7);
        } else if (recurrence === 'Monthly') {
          baseDate.setMonth(baseDate.getMonth() + 1);
        } else if (recurrence === 'Yearly') {
          baseDate.setFullYear(baseDate.getFullYear() + 1);
        }
        const nextDueDateStr = baseDate.toISOString().split('T')[0];

        const recurringTemplate = {
          title: title.trim(),
          amount: Number(amount),
          type,
          category,
          recurrence,
          paymentMethod,
          notes: notes.trim(),
          nextDueDate: nextDueDateStr
        };
        addRecurringTransaction(recurringTemplate);
      }
    }

    onClose();
  };

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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-xl shadow-xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-150 dark:border-slate-800">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {editId ? 'Edit Transaction' : 'Add Transaction'}
                </h3>
                <button
                  onClick={onClose}
                  className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="p-4 space-y-3">
                
                {/* Income / Expense toggle */}
                <div className="flex bg-slate-50 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleTypeChange('expense')}
                    className={`flex-1 py-1 rounded-md text-[9px] font-bold uppercase transition-all ${
                      type === 'expense'
                        ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-455 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('income')}
                    className={`flex-1 py-1 rounded-md text-[9px] font-bold uppercase transition-all ${
                      type === 'income'
                        ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-455 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Income
                  </button>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Coffee, Salary, Rent"
                    className={`w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border rounded-lg text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 ${
                      errors.title ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                    }`}
                  />
                  {errors.title && <p className="text-[9px] text-rose-500 mt-1">{errors.title}</p>}
                </div>

                {/* Amount & Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Amount ({currency})
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      min="0"
                      step="any"
                      className={`w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border rounded-lg text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 ${
                        errors.amount ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                      }`}
                    />
                    {errors.amount && <p className="text-[9px] text-rose-500 mt-1">{errors.amount}</p>}
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className={`w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border rounded-lg text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 ${
                        errors.date ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                      }`}
                    />
                    {errors.date && <p className="text-[9px] text-rose-500 mt-1">{errors.date}</p>}
                  </div>
                </div>

                {/* Category & Payment Method */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white text-xs focus:outline-none"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white text-xs focus:outline-none"
                    >
                      {paymentMethods.map((pm) => (
                        <option key={pm} value={pm}>
                          {pm}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Recurring Option */}
                {!editId && (
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[9px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                        Recurring Transaction
                      </label>
                      <input
                        type="checkbox"
                        checked={isRecurring}
                        onChange={(e) => setIsRecurring(e.target.checked)}
                        className="rounded border-slate-350 text-brand-655 focus:ring-brand-500 h-3.5 w-3.5"
                      />
                    </div>
                    {isRecurring && (
                      <div className="grid grid-cols-2 gap-2 items-center pt-1.5 border-t border-slate-200 dark:border-slate-900">
                        <span className="text-[8.5px] text-slate-500 font-bold uppercase">Repeat</span>
                        <select
                          value={recurrence}
                          onChange={(e) => setRecurrence(e.target.value)}
                          className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-[9px] focus:outline-none"
                        >
                          <option value="Daily">Daily</option>
                          <option value="Weekly">Weekly</option>
                          <option value="Monthly">Monthly</option>
                          <option value="Yearly">Yearly</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional details..."
                    rows="2"
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white text-xs focus:outline-none resize-none animate-none"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-lg text-[9px] font-bold uppercase text-slate-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-lg text-[9px] font-bold uppercase shadow transition-colors"
                  >
                    {editId ? 'Save' : 'Add'}
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
export default TransactionModal;
