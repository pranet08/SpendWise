import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';
import { useApp } from '../context/AppContext';

export const ToastNotification = () => {
  const { toasts, removeToast } = useApp();

  return (
    // Fixed container in the bottom-right of the viewport
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          // Determine color scheme and icon based on toast type
          let icon = <FiInfo className="w-5 h-5" />;
          let bgColor = 'bg-blue-50 dark:bg-blue-950/40';
          let borderColor = 'border-blue-200 dark:border-blue-900/60';
          let textColor = 'text-blue-800 dark:text-blue-200';
          let iconColor = 'text-blue-500';

          if (toast.type === 'success') {
            icon = <FiCheckCircle className="w-5 h-5" />;
            bgColor = 'bg-emerald-50 dark:bg-emerald-950/40';
            borderColor = 'border-emerald-200 dark:border-emerald-900/60';
            textColor = 'text-emerald-800 dark:text-emerald-200';
            iconColor = 'text-emerald-500';
          } else if (toast.type === 'error') {
            icon = <FiXCircle className="w-5 h-5" />;
            bgColor = 'bg-rose-50 dark:bg-rose-950/40';
            borderColor = 'border-rose-200 dark:border-rose-900/60';
            textColor = 'text-rose-800 dark:text-rose-200';
            iconColor = 'text-rose-500';
          } else if (toast.type === 'warning') {
            icon = <FiAlertCircle className="w-5 h-5" />;
            bgColor = 'bg-amber-50 dark:bg-amber-950/40';
            borderColor = 'border-amber-200 dark:border-amber-900/60';
            textColor = 'text-amber-800 dark:text-amber-200';
            iconColor = 'text-amber-500';
          }

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border ${bgColor} ${borderColor} ${textColor} shadow-lg`}
            >
              <div className={`mt-0.5 shrink-0 ${iconColor}`}>{icon}</div>
              <div className="flex-1 text-sm font-medium leading-5">{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 p-0.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <FiX className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
