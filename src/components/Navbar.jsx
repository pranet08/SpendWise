import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FiSun, FiMoon, FiBell, FiChevronDown, FiUser, FiInfo, FiX, FiCheck } from 'react-icons/fi';

export const Navbar = () => {
  const { 
    user, 
    darkMode, 
    toggleDarkMode, 
    notifications, 
    markNotificationAsRead, 
    clearNotification, 
    clearAllNotifications,
    currency
  } = useApp();
  
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  // Derive page heading name and description based on current URL path
  const getPageTitleAndDesc = () => {
    switch (location.pathname) {
      case '/dashboard':
        return { title: 'Dashboard', desc: 'See your finances at a glance.' };
      case '/transactions':
        return { title: 'Transactions', desc: 'Track and manage your transactions.' };
      case '/analytics':
        return { title: 'Analytics', desc: 'Understand your spending habits.' };
      case '/challenges':
        return { title: 'Money Challenges', desc: 'Complete gamified challenges to build healthy saving habits.' };
      case '/savings':
        return { title: 'Savings', desc: 'Monitor progress toward your savings goals.' };
      case '/settings':
        return { title: 'Settings', desc: 'Manage your account preferences.' };
      default:
        return { title: 'Dashboard', desc: 'See your finances at a glance.' };
    }
  };

  const pageInfo = getPageTitleAndDesc();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between w-full h-14 px-4 bg-white/95 dark:bg-slate-950/95 backdrop-blur border-b border-slate-200 dark:border-slate-900 transition-colors no-print">
      
      {/* LEFT: Page Title & Contextual Description */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-xs font-extrabold text-slate-900 dark:text-white leading-none uppercase tracking-wider">
            {pageInfo.title}
          </h1>
          <p className="hidden md:block text-[9px] text-slate-500 mt-1 font-semibold">
            {pageInfo.desc}
          </p>
        </div>
      </div>

      {/* RIGHT: Actions */}
      <div className="flex items-center gap-3">
        
        {/* Theme Toggler */}
        <button
          onClick={toggleDarkMode}
          className="p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-all duration-150"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
        </button>

        {/* Notifications Icon with Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-all duration-150"
            title="Notifications"
          >
            <FiBell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <>
              {/* Overlay Backdrop to click-out */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-72 md:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg z-50 overflow-hidden divide-y divide-slate-150 dark:divide-slate-850">
                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-xs">Alerts</h3>
                  {notifications.length > 0 && (
                    <button 
                      onClick={() => {
                        clearAllNotifications();
                        setShowNotifications(false);
                      }}
                      className="text-[9px] font-bold text-rose-600 dark:text-rose-400 hover:underline"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto thin-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-[10px] text-slate-500 font-semibold">
                      No notifications.
                    </div>
                  ) : (
                    notifications.map((note) => (
                      <div 
                        key={note.id} 
                        className={`p-3 flex gap-2 items-start hover:bg-slate-55 dark:hover:bg-slate-950 transition-colors ${
                          !note.read ? 'bg-slate-50/50 dark:bg-slate-900/30' : ''
                        }`}
                      >
                        <div className={`mt-0.5 shrink-0 p-1 rounded-md ${
                          note.type === 'danger' ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-455' :
                          note.type === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-455' :
                          note.type === 'success' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-455' :
                          'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-455'
                        }`}>
                          <FiInfo className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-[10px] font-bold text-slate-950 dark:text-slate-50 leading-tight">
                              {note.title}
                            </p>
                            <div className="flex items-center gap-1.5">
                              {!note.read && (
                                <button
                                  onClick={() => markNotificationAsRead(note.id)}
                                  className="text-[10px] text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                                  title="Mark as read"
                                >
                                  <FiCheck className="w-3 h-3" />
                                </button>
                              )}
                              <button
                                onClick={() => clearNotification(note.id)}
                                className="text-[10px] text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                                title="Dismiss"
                              >
                                <FiX className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-[9px] text-slate-550 dark:text-slate-400 mt-0.5 leading-normal font-semibold">
                            {note.desc}
                          </p>
                          <span className="text-[7.5px] text-slate-400 block mt-1 font-bold">
                            {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Vertical divider */}
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

        {/* User profile avatar */}
        {user && (
          <div className="flex items-center gap-2 select-none">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-6 h-6 rounded-md object-cover ring-1 ring-slate-200 dark:ring-slate-800"
            />
            <span className="hidden md:block text-[10px] font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wide truncate max-w-[80px]">
              {user.name}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};
export default Navbar;
