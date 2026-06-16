import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  FiHome,
  FiCreditCard,
  FiPieChart,
  FiAward,
  FiTarget,
  FiSettings,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiTrendingUp
} from 'react-icons/fi';

export const Sidebar = () => {
  const { user, logout, currency } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <FiHome className="w-4 h-4" /> },
    { name: 'Transactions', path: '/transactions', icon: <FiCreditCard className="w-4 h-4" /> },
    { name: 'Analytics', path: '/analytics', icon: <FiPieChart className="w-4 h-4" /> },
    { name: 'Money Challenges', path: '/challenges', icon: <FiAward className="w-4 h-4" /> },
    { name: 'Savings Tracker', path: '/savings', icon: <FiTarget className="w-4 h-4" /> },
    { name: 'Settings', path: '/settings', icon: <FiSettings className="w-4 h-4" /> },
  ];

  const getLinkClass = (isActive) => {
    const baseClass = "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 group relative";
    if (isActive) {
      return `${baseClass} bg-slate-100 dark:bg-slate-800/80 text-brand-600 dark:text-brand-400 border-l-2 border-brand-500 rounded-l-none`;
    }
    return `${baseClass} text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-slate-200`;
  };

  return (
    <aside
      className={`hidden lg:flex flex-col h-screen bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-900 transition-all duration-200 shrink-0
        ${isCollapsed ? 'w-16' : 'w-56'}
      `}
    >
      {/* Brand Logo Header */}
      <div className="flex items-center justify-between px-4 py-3 min-h-[56px] border-b border-slate-100 dark:border-slate-900">
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white"
        >
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950">
            <FiTrendingUp className="w-4 h-4" />
          </div>
          {!isCollapsed && (
            <span className="font-bold tracking-tight text-slate-900 dark:text-slate-100">
              SpendWise
            </span>
          )}
        </Link>

        {/* Desktop Collapse Trigger */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 rounded transition-colors"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <FiChevronRight className="w-3.5 h-3.5" /> : <FiChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto thin-scrollbar">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => getLinkClass(isActive)}
          >
            <div className="shrink-0">{item.icon}</div>
            <span
              className={`transition-all duration-150 truncate ${
                isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'
              }`}
            >
              {item.name}
            </span>
            {isCollapsed && (
              <div className="absolute left-16 hidden group-hover:block px-2.5 py-1 bg-slate-950 text-white text-[10px] font-bold rounded shadow-lg whitespace-nowrap z-50">
                {item.name}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Profile & Logout section at the bottom */}
      {user && (
        <div className="p-3 border-t border-slate-100 dark:border-slate-900 bg-slate-50/30 dark:bg-slate-950/50">
          <div className="flex items-center gap-2 mb-3">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-800 shrink-0"
            />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user.name}
                </p>
                <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
              </div>
            )}
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-white hover:bg-rose-600 dark:hover:bg-rose-900/40 rounded-lg border border-transparent transition-all duration-150"
            title="Log out of account"
          >
            <FiLogOut className="w-3.5 h-3.5 shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      )}
    </aside>
  );
};
export default Sidebar;
