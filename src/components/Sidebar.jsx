import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  FiHome,
  FiCreditCard,
  FiPieChart,
  FiSliders,
  FiTarget,
  FiSettings,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiTrendingUp
} from 'react-icons/fi';

export const Sidebar = () => {
  const { user, logout, mobileSidebarOpen, setMobileSidebarOpen } = useApp();
  // State to handle desktop collapsing (w-64 to w-20)
  const [isCollapsed, setIsCollapsed] = useState(false);

  // List of navigation links
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <FiHome className="w-5 h-5" /> },
    { name: 'Transactions', path: '/transactions', icon: <FiCreditCard className="w-5 h-5" /> },
    { name: 'Analytics', path: '/analytics', icon: <FiPieChart className="w-5 h-5" /> },
    { name: 'Budget Planner', path: '/budget', icon: <FiSliders className="w-5 h-5" /> },
    { name: 'Savings Tracker', path: '/savings', icon: <FiTarget className="w-5 h-5" /> },
    { name: 'Settings', path: '/settings', icon: <FiSettings className="w-5 h-5" /> },
  ];

  // Helper function to return active vs inactive classes in react-router-dom's NavLink
  const getLinkClass = (isActive) => {
    const baseClass = "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group";
    if (isActive) {
      return `${baseClass} bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/20`;
    }
    return `${baseClass} text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-brand-600 dark:hover:text-brand-400`;
  };

  return (
    <>
      {/* 1. MOBILE BACKDROP OVERLAY
          This dark semi-transparent panel covers the screen when the sidebar is drawn open on mobiles.
      */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* 2. MAIN SIDEBAR CONTAINER
          Responsive classes:
          - Mobiles: fixed absolute positioning, slid out of view (translate-x) unless mobileSidebarOpen is true.
          - Desktops: relative block positioning, adapts width based on isCollapsed (w-64 vs w-20).
      */}
      <aside
        className={`fixed lg:static lg:translate-x-0 top-0 bottom-0 left-0 z-50 flex flex-col h-screen bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-900 transition-all duration-300 shrink-0
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
          w-64
        `}
      >
        {/* SIDEBAR HEADER: Logo & Collapse Button */}
        <div className="flex items-center justify-between p-4 min-h-[70px] border-b border-slate-100 dark:border-slate-900">
          <Link
            to="/"
            onClick={() => setMobileSidebarOpen(false)}
            className="flex items-center gap-2.5 font-bold text-xl text-slate-900 dark:text-white"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-lg shadow-brand-500/30">
              <FiTrendingUp className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent dark:from-brand-400 dark:to-indigo-400 font-extrabold tracking-tight">
                SpendWise
              </span>
            )}
          </Link>

          {/* Close button for Mobiles */}
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="p-1 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg lg:hidden"
          >
            <FiX className="w-5 h-5" />
          </button>

          {/* Collapse toggle button for Desktops */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <FiChevronRight className="w-4 h-4" /> : <FiChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* NAVIGATION ITEMS */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setMobileSidebarOpen(false)} // Close drawer on mobile navigation click
              className={({ isActive }) => getLinkClass(isActive)}
            >
              <div className="shrink-0">{item.icon}</div>
              {/* Hide text label if collapsed on desktop */}
              <span
                className={`transition-all duration-200 truncate ${
                  isCollapsed ? 'lg:opacity-0 lg:w-0 overflow-hidden' : 'opacity-100 w-auto'
                }`}
              >
                {item.name}
              </span>
              {/* Hover Tooltip when collapsed on desktop */}
              {isCollapsed && (
                <div className="absolute left-20 hidden lg:group-hover:block px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-lg whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* PROFILE SECTION & LOGOUT BUTTON */}
        {user && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-brand-100 dark:ring-brand-950 shrink-0"
              />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                logout();
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-rose-600 hover:text-white hover:bg-rose-600 dark:hover:bg-rose-900/40 dark:text-rose-400 border border-transparent hover:border-rose-600 rounded-xl transition-all duration-200
                ${isCollapsed ? 'lg:px-0' : ''}
              `}
              title="Sign out of your account"
            >
              <FiLogOut className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
