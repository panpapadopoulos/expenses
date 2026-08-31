import React from 'react';
import { LayoutDashboard, Receipt, PlusCircle, Tags, Wallet, Settings, LogOut, Sun, Moon } from 'lucide-react';
import Logo from './Logo';
import { Tab } from '../types';

interface Props {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  isDarkMode: boolean;
  setIsDarkMode: (v: boolean) => void;
}

const NAV_ITEMS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'expenses', label: 'Expenses', icon: Receipt },
  { id: 'add', label: 'Add Expense', icon: PlusCircle },
  { id: 'categories', label: 'Categories', icon: Tags },
  { id: 'accounts', label: 'Accounts', icon: Wallet },
];

export default function Sidebar({ activeTab, setActiveTab, isDarkMode, setIsDarkMode }: Props) {
  return (
    <aside
      className={`hidden md:flex flex-col w-72 p-6 border-r shrink-0 transition-colors ${
        isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100'
      }`}
    >
      <div className="flex items-center gap-3 mb-10 px-2">
        <Logo size={36} />
        <h1 className={`text-xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Expenses</h1>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm ${
              activeTab === id
                ? isDarkMode
                  ? 'bg-white text-slate-900 font-black shadow-lg'
                  : 'bg-slate-900 text-white font-black shadow-lg shadow-slate-900/10'
                : isDarkMode
                ? 'text-slate-400 hover:bg-white/5 font-bold'
                : 'text-slate-600 hover:bg-slate-100 font-bold'
            }`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className={`mt-auto pt-4 border-t space-y-1 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
            isDarkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          <span>{isDarkMode ? 'Light mode' : 'Dark mode'}</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
            activeTab === 'settings'
              ? isDarkMode
                ? 'bg-white text-slate-900'
                : 'bg-slate-900 text-white'
              : isDarkMode
              ? 'text-slate-300 hover:bg-white/5'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Settings size={18} />
          <span>Settings</span>
        </button>
        <a
          href="/logout"
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
            isDarkMode ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <LogOut size={18} />
          <span>Log out</span>
        </a>
      </div>
    </aside>
  );
}
