import React from 'react';
import { LayoutDashboard, Receipt, PlusCircle, Tags, Wallet } from 'lucide-react';
import { Tab } from '../types';

interface Props {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  isDarkMode: boolean;
}

const NAV_ITEMS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'expenses', label: 'Expenses', icon: Receipt },
  { id: 'add', label: 'Add', icon: PlusCircle },
  { id: 'categories', label: 'Categories', icon: Tags },
  { id: 'accounts', label: 'Accounts', icon: Wallet },
];

export default function MobileNav({ activeTab, setActiveTab, isDarkMode }: Props) {
  return (
    <nav
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t flex items-stretch transition-colors ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setActiveTab(id)}
          className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold transition-colors ${
            activeTab === id
              ? isDarkMode
                ? 'text-white'
                : 'text-slate-900'
              : isDarkMode
              ? 'text-slate-500'
              : 'text-slate-400'
          }`}
        >
          <Icon size={20} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
