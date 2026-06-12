import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { TransactionModal } from './TransactionModal';
import {
  FiHome,
  FiCreditCard,
  FiPieChart,
  FiSliders,
  FiTarget,
  FiSettings,
  FiPlus
} from 'react-icons/fi';

export const BottomNav = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Menu items for mobile nav
  const menuItems = [
    { name: 'Home', path: '/', icon: <FiHome className="w-5 h-5" /> },
    { name: 'History', path: '/transactions', icon: <FiCreditCard className="w-5 h-5" /> },
    { name: 'Analytics', path: '/analytics', icon: <FiPieChart className="w-5 h-5" /> },
    { name: 'Budgets', path: '/budget', icon: <FiSliders className="w-5 h-5" /> },
    { name: 'Savings', path: '/savings', icon: <FiTarget className="w-5 h-5" /> },
    { name: 'Settings', path: '/settings', icon: <FiSettings className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Bottom Nav Bar Container */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 lg:hidden px-3 pb-safe-bottom">
        <div className="flex items-center justify-around h-16 relative">
          
          {/* First 3 Navigation Items */}
          {menuItems.slice(0, 3).map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 h-full text-[10px] font-medium transition-colors ${
                  isActive
                    ? 'text-brand-600 dark:text-brand-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`
              }
            >
              {item.icon}
              <span className="mt-0.5">{item.name}</span>
            </NavLink>
          ))}

          {/* Centered FAB Trigger */}
          <div className="relative -mt-6 flex flex-col items-center justify-center z-50">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-lg shadow-brand-500/20 active:scale-95 transition-all"
              aria-label="Add Transaction"
            >
              <FiPlus className="w-6 h-6" />
            </button>
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-1">Add</span>
          </div>

          {/* Next 3 Navigation Items */}
          {menuItems.slice(3).map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 h-full text-[10px] font-medium transition-colors ${
                  isActive
                    ? 'text-brand-600 dark:text-brand-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`
              }
            >
              {item.icon}
              <span className="mt-0.5">{item.name}</span>
            </NavLink>
          ))}
          
        </div>
      </nav>

      {/* Mobile Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
export default BottomNav;
