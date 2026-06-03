import React from 'react';
import { FiArrowUpRight, FiArrowDownRight } from 'react-icons/fi';

export const StatCard = ({ title, value, icon, trend, color, prefix = '₹' }) => {
  
  // Format numeric values into Indian Rupee locale layout: e.g. 15000 -> 15,000
  const formatValue = (val) => {
    if (typeof val === 'number') {
      return val.toLocaleString('en-IN');
    }
    return val;
  };

  return (
    <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group">
      
      {/* Small top gradient light glow effect for premium feel */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="flex items-center justify-between">
        
        {/* Metric Label Title */}
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {prefix}{formatValue(value)}
          </h3>
        </div>

        {/* Customizable Icon Container */}
        <div className={`p-3 rounded-xl ${color} shadow-inner shrink-0 group-hover:scale-110 transition-transform duration-200`}>
          {icon}
        </div>
      </div>

      {/* Trend indicators bottom row */}
      {trend && (
        <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          {/* Green up arrow / Red down arrow depending on trend direction */}
          {trend.type === 'up' && (
            <span className="flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <FiArrowUpRight className="w-3.5 h-3.5" />
              {trend.value}
            </span>
          )}
          {trend.type === 'down' && (
            <span className="flex items-center text-xs font-semibold text-rose-600 dark:text-rose-400">
              <FiArrowDownRight className="w-3.5 h-3.5" />
              {trend.value}
            </span>
          )}
          {trend.type === 'neutral' && (
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {trend.value}
            </span>
          )}
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {trend.text}
          </span>
        </div>
      )}
    </div>
  );
};
