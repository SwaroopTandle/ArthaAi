
import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  description?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, suffix = '', description, className = '' }) => {
  return (
    <div className={`p-4 rounded-xl glass-card transition-all hover:border-blue-500/50 ${className}`}>
      <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold text-white">{value}</span>
        <span className="text-xs text-slate-400">{suffix}</span>
      </div>
      {description && <p className="text-[10px] text-slate-500 mt-2 leading-tight">{description}</p>}
    </div>
  );
};
