import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { FiUser, FiMail, FiTrash2, FiRefreshCw, FiSmile } from 'react-icons/fi';

export const Settings = () => {
  const { user, updateProfile, resetAllData, showToast } = useApp();

  // Local form states
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  
  // Available pre-defined avatars for the user to choose
  const avatarOptions = [
    { id: 'av-1', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80' }, // Male Professional
    { id: 'av-2', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' }, // Female Professional
    { id: 'av-3', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80' }, // Male Tech
    { id: 'av-4', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80' }  // Female Tech
  ];

  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || avatarOptions[0].url);

  // Save profile changes
  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showToast('Name and Email cannot be empty.', 'error');
      return;
    }

    // Call update profile in AppContext with the name, email, and selected avatar URL
    updateProfile(name.trim(), email.trim(), selectedAvatar);
  };

  const handleSelectAvatar = (url) => {
    setSelectedAvatar(url);
    showToast('Avatar selected. Save profile changes to apply.', 'info');
  };

  // Reset system
  const handleResetData = () => {
    // Standard beginner confirmation prompt
    const confirmWipe = window.confirm(
      'WARNING: This will delete all your local transactions, budgets, savings goals, and sign you out. Are you sure you want to proceed?'
    );

    if (confirmWipe) {
      resetAllData();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PROFILE INFORMATION DETAILS CARD */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-brand-100 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 rounded-xl">
              <FiUser className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Profile Settings</h3>
              <p className="text-xs text-slate-500 mt-0.5">Update your personal account profile details.</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            
            {/* AVATAR CHOOSER SELECTOR */}
            <div className="space-y-3 pb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Choose Profile Photo
              </label>
              <div className="flex items-center gap-4">
                {/* Active Avatar */}
                <img
                  src={selectedAvatar}
                  alt="Chosen Avatar"
                  className="w-16 h-16 rounded-2xl object-cover ring-4 ring-brand-500/20"
                />
                
                {/* Available Avatars selection grid */}
                <div className="flex gap-2">
                  {avatarOptions.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => handleSelectAvatar(av.url)}
                      className={`relative w-10 h-10 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        selectedAvatar === av.url 
                          ? 'border-brand-500 scale-105 shadow-sm' 
                          : 'border-transparent hover:scale-105'
                      }`}
                    >
                      <img src={av.url} alt="Option" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* User Name Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <FiUser className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <FiMail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            {/* Submit changes button */}
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow hover:shadow-md transition-all duration-200"
            >
              Save Profile Changes
            </button>
          </form>
        </div>

        {/* SYSTEM CONTROL DANGER WIPE CARD */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-455 rounded-xl">
                <FiTrash2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">Danger Zone</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Permanently delete all your local transactions, budgets, savings goals, and sign out of your account.
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetData}
            className="w-full py-2.5 border border-rose-250 dark:border-rose-900/60 hover:bg-rose-600 dark:hover:bg-rose-900/40 hover:text-white text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2"
          >
            <FiRefreshCw className="w-3.5 h-3.5" />
            Reset System Data
          </button>
        </div>
      </div>
    </motion.div>
  );
};
export default Settings;
