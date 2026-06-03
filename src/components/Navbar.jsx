import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FiMenu, FiSun, FiMoon, FiBell, FiChevronDown, FiUser, FiInfo } from 'react-icons/fi';

export const Navbar = () => {
  const { user, darkMode, toggleDarkMode, setMobileSidebarOpen, transactions, monthlyBudget } = useApp();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  // Derive page heading name based on current URL path
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard';
      case '/transactions':
        return 'Transactions';
      case '/analytics':
        return 'Analytics & Reports';
      case '/budget':
        return 'Budget Planner';
      case '/savings':
        return 'Savings Tracker';
      case '/settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  // Compile notification items dynamically based on budget warnings and recent large spends
  const getNotificationsList = () => {
    const alerts = [];
    const currentMonth = new Date().toISOString().substring(0, 7);

    // Alert 1: Calculate total expenses this month
    const totalExpenses = transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);

    if (totalExpenses > monthlyBudget) {
      alerts.push({
        id: 'warn-budget',
        title: 'Budget Exceeded!',
        desc: `You spent ₹${totalExpenses.toLocaleString('en-IN')} which exceeds your budget of ₹${monthlyBudget.toLocaleString('en-IN')}.`,
        type: 'danger'
      });
    } else if (totalExpenses > monthlyBudget * 0.8) {
      alerts.push({
        id: 'warn-budget-near',
        title: 'Approaching Budget Limit',
        desc: `You spent 80%+ of your monthly budget. Current spend is ₹${totalExpenses.toLocaleString('en-IN')}.`,
        type: 'warning'
      });
    }

    // Alert 2: Check for any single transaction above ₹10,000
    const largeSpends = transactions.filter((t) => t.type === 'expense' && t.amount >= 10000);
    if (largeSpends.length > 0) {
      alerts.push({
        id: 'warn-large-spend',
        title: 'Large Spend Detected',
        desc: `Multiple high transactions (₹10,000+) are registered on your account.`,
        type: 'info'
      });
    }

    // Default placeholder notifications if list is empty
    if (alerts.length === 0) {
      alerts.push({
        id: 'notify-welcome',
        title: 'Welcome to Finova!',
        desc: 'Explore your personal finance dashboard to start tracking budgets.',
        type: 'info'
      });
    }

    return alerts;
  };

  const notifications = getNotificationsList();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between w-full h-[70px] px-6 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-900 transition-colors">
      
      {/* LEFT: Hamburger menu (Mobile) & Page Title (Desktop) */}
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger button */}
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl lg:hidden focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          aria-label="Open Sidebar Menu"
        >
          <FiMenu className="w-5 h-5" />
        </button>

        {/* Title */}
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none">
            {getPageTitle()}
          </h1>
          <p className="hidden md:block text-xs text-slate-500 mt-1">
            Personal Finance Tracker
          </p>
        </div>
      </div>

      {/* RIGHT: Actions (Theme Toggle, Notifications, User Info) */}
      <div className="flex items-center gap-3">
        
        {/* Theme Toggler (Light/Dark Mode) */}
        <button
          onClick={toggleDarkMode}
          className="p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
        </button>

        {/* Notifications Icon with Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            title="Notifications panel"
          >
            <FiBell className="w-5 h-5" />
            {/* Red badge dot if we have important notices */}
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            )}
          </button>

          {/* Notifications Dropdown Card */}
          {showNotifications && (
            <>
              {/* Overlay Backdrop to click-out */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2.5 w-80 md:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Notifications</h3>
                  <span className="text-[10px] bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded-full font-bold">
                    {notifications.length} Active
                  </span>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.map((note) => (
                    <div 
                      key={note.id} 
                      className="p-4 flex gap-3 items-start hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors"
                    >
                      <div className={`mt-0.5 shrink-0 p-1.5 rounded-lg ${
                        note.type === 'danger' ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400' :
                        note.type === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' :
                        'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                      }`}>
                        {note.type === 'danger' ? <FiInfo className="w-4 h-4" /> : <FiInfo className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-950 dark:text-slate-50">
                          {note.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                          {note.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

        {/* User profile indicator */}
        {user && (
          <div className="flex items-center gap-2 pl-1 select-none">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-xl object-cover ring-2 ring-brand-100 dark:ring-brand-950"
            />
            <span className="hidden md:block text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[100px]">
              {user.name}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};
