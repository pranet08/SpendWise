import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { 
  FiUser, 
  FiMail, 
  FiTrash2, 
  FiRefreshCw, 
  FiDollarSign, 
  FiDownloadCloud, 
  FiUploadCloud
} from 'react-icons/fi';

export const Settings = () => {
  const { 
    user, 
    updateProfile, 
    resetAllData, 
    currency,
    setCurrency,
    transactions,
    monthlyBudget,
    savingsGoals,
    recurringTransactions,
    activities,
    notifications,
    showToast 
  } = useApp();

  const fileInputRef = useRef(null);

  // Local form states
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  // Available avatars
  const avatarOptions = [
    { id: 'av-1', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80' },
    { id: 'av-2', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
    { id: 'av-3', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80' },
    { id: 'av-4', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80' }
  ];

  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || avatarOptions[0].url);

  // Save profile settings
  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showToast('Name and Email cannot be empty.', 'error');
      return;
    }
    updateProfile(name.trim(), email.trim(), selectedAvatar);
  };

  // JSON Data Backup Export Helper
  const handleExportBackup = () => {
    const backupData = {
      transactions,
      monthlyBudget,
      savingsGoals,
      recurringTransactions,
      activities,
      notifications,
      currency,
      exportedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `spendwise_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Backup JSON downloaded successfully.', 'success');
  };

  // JSON Data Backup Import / Restore Helper
  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsedData = JSON.parse(event.target.result);
        
        // Simple validation check to ensure key fields exist in parsed JSON
        if (
          !Array.isArray(parsedData.transactions) || 
          typeof parsedData.monthlyBudget !== 'number' ||
          !Array.isArray(parsedData.savingsGoals)
        ) {
          throw new Error('Invalid backup schema. Required data arrays are missing.');
        }

        // Restore into local storage under user scope
        const emailKey = user.email;
        localStorage.setItem(`spendwise_transactions_${emailKey}`, JSON.stringify(parsedData.transactions));
        localStorage.setItem(`spendwise_budget_${emailKey}`, parsedData.monthlyBudget.toString());
        localStorage.setItem(`spendwise_savings_goals_${emailKey}`, JSON.stringify(parsedData.savingsGoals));
        if (parsedData.recurringTransactions) {
          localStorage.setItem(`spendwise_recurring_${emailKey}`, JSON.stringify(parsedData.recurringTransactions));
        }
        if (parsedData.activities) {
          localStorage.setItem(`spendwise_activities_${emailKey}`, JSON.stringify(parsedData.activities));
        }
        if (parsedData.notifications) {
          localStorage.setItem(`spendwise_notifications_${emailKey}`, JSON.stringify(parsedData.notifications));
        }
        if (parsedData.currency) {
          localStorage.setItem(`spendwise_currency_${emailKey}`, parsedData.currency);
        }

        showToast('Backup data imported successfully. Reloading view...', 'success');
        
        // Reload page to re-run providers and sync state
        setTimeout(() => {
          window.location.reload();
        }, 1500);

      } catch (err) {
        showToast(`Import failed: ${err.message}`, 'error');
      }
    };
    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleResetData = () => {
    const confirmWipe = window.confirm(
      'WARNING: This will delete all your local transactions, budgets, goals, and sign you out. Are you sure you want to proceed?'
    );
    if (confirmWipe) {
      resetAllData();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Profile Details */}
        <div className="saas-card p-5 lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg">
              <FiUser className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">My Profile</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Manage your personal profile information</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            
            {/* Avatar picker */}
            <div className="space-y-2">
              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Profile Picture
              </label>
              <div className="flex items-center gap-4">
                <img
                  src={selectedAvatar}
                  alt="Chosen Avatar"
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-200 dark:ring-slate-800"
                />
                
                <div className="flex gap-2">
                  {avatarOptions.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => { setSelectedAvatar(av.url); showToast('Avatar selected.', 'info'); }}
                      className={`relative w-8 h-8 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedAvatar === av.url 
                          ? 'border-slate-800 dark:border-white scale-105 shadow-sm' 
                          : 'border-transparent hover:scale-105'
                      }`}
                    >
                      <img src={av.url} alt="Option" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <FiUser className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <FiMail className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-lg text-[10px] font-bold uppercase shadow transition-colors"
            >
              Save
            </button>
          </form>
        </div>

        {/* Global Currency & settings Card */}
        <div className="saas-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg">
              <FiDollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">App Preferences</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Adjust dashboard formatting rules</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => { setCurrency(e.target.value); showToast(`Currency updated to ${e.target.value}`, 'success'); }}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg text-xs focus:outline-none"
              >
                <option value="₹">₹ (Indian Rupee - INR)</option>
                <option value="$">$ (US Dollar - USD)</option>
                <option value="€">€ (Euro - EUR)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Data Backup & Migration Center */}
        <div className="saas-card p-5 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg">
                <FiDownloadCloud className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Backup & Restore</h3>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal mb-4">
              Backup your entire SpendWise dashboard ledger to a local JSON file, or restore from a previous backup.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              onClick={handleExportBackup}
              className="flex items-center justify-center gap-1.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 rounded text-[9px] font-bold uppercase transition-colors"
            >
              <FiDownloadCloud className="w-3.5 h-3.5" />
              Backup Data
            </button>
            <button
              onClick={triggerFileInput}
              className="flex items-center justify-center gap-1.5 py-1.5 bg-slate-150 hover:bg-slate-200 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 rounded text-[9px] font-bold uppercase transition-colors"
            >
              <FiUploadCloud className="w-3.5 h-3.5" />
              Restore Data
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportBackup}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        {/* Reset App Data */}
        <div className="saas-card p-5 lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-455 rounded-lg">
                <FiTrash2 className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Reset App Data</h3>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Permanently wipe all records, budgets, savings progress, and settings. This operation is non-reversible.
            </p>
          </div>

          <button
            onClick={handleResetData}
            className="w-full mt-4 py-2 border border-rose-250 hover:bg-rose-600 hover:text-white text-rose-600 dark:text-rose-400 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1.5"
          >
            <FiRefreshCw className="w-3.5 h-3.5" />
            Delete All Data
          </button>
        </div>

      </div>
    </motion.div>
  );
};
export default Settings;
