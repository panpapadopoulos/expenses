import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Props {
  label: string;
  value: string;
  icon: LucideIcon;
  isDarkMode: boolean;
  accent?: string;
}

export default function StatCard({ label, value, icon: Icon, isDarkMode, accent = '#10b981' }: Props) {
  return (
    <div
      className={`p-5 md:p-6 rounded-2xl border transition-colors ${
        isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          {label}
        </span>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${accent}20` }}
        >
          <Icon size={18} color={accent} />
        </div>
      </div>
      <p className={`text-2xl md:text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
        {value}
      </p>
    </div>
  );
}
