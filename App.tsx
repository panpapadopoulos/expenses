import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Menu, X, PlusCircle } from 'lucide-react';
import { AppData, Expense, RecurringExpense, Tab } from './types';
import { fetchData, saveData } from './services/dataService';
import { uid } from './utils/format';
import { generateDueExpenses } from './utils/recurring';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import Logo from './components/Logo';
import Dashboard from './components/Dashboard';
import ExpensesPage from './components/ExpensesPage';
import ExpenseForm from './components/ExpenseForm';
import CategoriesPage from './components/CategoriesPage';
import AccountsPage from './components/AccountsPage';
import SettingsPage from './components/SettingsPage';

const DEFAULT_CATEGORIES = [
  { id: uid(), name: 'Groceries', color: '#10b981' },
  { id: uid(), name: 'Dining', color: '#f59e0b' },
  { id: uid(), name: 'Transport', color: '#3b82f6' },
  { id: uid(), name: 'Utilities', color: '#8b5cf6' },
  { id: uid(), name: 'Entertainment', color: '#ec4899' },
  { id: uid(), name: 'Other', color: '#64748b' },
];

const DEFAULT_ACCOUNTS = [
  { id: uid(), name: 'Cash', type: 'Cash' },
  { id: uid(), name: 'Primary Card', type: 'Credit Card' },
];

const TAB_TITLES: Record<Tab, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Your spending at a glance' },
  expenses: { title: 'Expenses', subtitle: 'Search, sort, and filter every transaction' },
  add: { title: 'Add Expense', subtitle: 'Log a new transaction' },
  categories: { title: 'Categories', subtitle: 'Organize how spending is grouped' },
  accounts: { title: 'Accounts', subtitle: 'Manage payment methods' },
  settings: { title: 'Settings', subtitle: 'Appearance, data, and account' },
};

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [data, setData] = useState<AppData>({ expenses: [], categories: [], accounts: [], recurringExpenses: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      return localStorage.getItem('expenses_theme') !== 'light';
    } catch {
      return true;
    }
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      const loaded = await fetchData();
      const normalized: AppData = { ...loaded, recurringExpenses: loaded.recurringExpenses || [] };
      if (normalized.categories.length === 0 && normalized.accounts.length === 0 && normalized.expenses.length === 0) {
        setData({ expenses: [], categories: DEFAULT_CATEGORIES, accounts: DEFAULT_ACCOUNTS, recurringExpenses: [] });
      } else {
        setData(generateDueExpenses(normalized));
      }
      setIsLoading(false);
    })();
  }, []);

  const debouncedSave = useCallback((next: AppData) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveData(next);
    }, 600);
  }, []);

  useEffect(() => {
    if (isLoading) return;
    debouncedSave(data);
  }, [data, isLoading, debouncedSave]);

  useEffect(() => {
    try {
      localStorage.setItem('expenses_theme', isDarkMode ? 'dark' : 'light');
    } catch {
      // ignore
    }
  }, [isDarkMode]);

  function addExpense(expense: Expense) {
    setData((d) => ({ ...d, expenses: [...d.expenses, expense] }));
    setActiveTab('expenses');
  }

  function updateExpense(expense: Expense) {
    setData((d) => ({ ...d, expenses: d.expenses.map((e) => (e.id === expense.id ? expense : e)) }));
  }

  function deleteExpense(id: string) {
    setData((d) => ({ ...d, expenses: d.expenses.filter((e) => e.id !== id) }));
  }

  function importExpenses(imported: Expense[]) {
    setData((d) => ({ ...d, expenses: [...d.expenses, ...imported] }));
  }

  function addRecurringExpense(template: RecurringExpense) {
    setData((d) => generateDueExpenses({ ...d, recurringExpenses: [...d.recurringExpenses, template] }));
    setActiveTab('expenses');
  }

  function cancelRecurringExpense(id: string) {
    setData((d) => ({
      ...d,
      recurringExpenses: d.recurringExpenses.map((r) => (r.id === id ? { ...r, active: false } : r)),
    }));
  }

  function deleteRecurringExpense(id: string) {
    setData((d) => ({ ...d, recurringExpenses: d.recurringExpenses.filter((r) => r.id !== id) }));
  }

  function clearAll() {
    setData({ expenses: [], categories: DEFAULT_CATEGORIES, accounts: DEFAULT_ACCOUNTS, recurringExpenses: [] });
  }

  if (isLoading) {
    return (
      <div className={`h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <Logo size={44} />
      </div>
    );
  }

  const { title, subtitle } = TAB_TITLES[activeTab];

  return (
    <div className={`flex flex-col md:flex-row h-screen overflow-hidden ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

      {/* Mobile top bar */}
      <div
        className={`md:hidden flex items-center justify-between px-4 py-3 border-b transition-colors ${
          isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-100'
        }`}
      >
        <div className="flex items-center gap-2">
          <Logo size={30} />
          <span className={`font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Expenses</span>
        </div>
        <button onClick={() => setMobileMenuOpen(true)} className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
          <Menu size={24} />
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
          <div className={`absolute right-0 top-0 bottom-0 w-64 p-5 ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
            <button onClick={() => setMobileMenuOpen(false)} className={`mb-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              <X size={22} />
            </button>
            <button
              onClick={() => {
                setActiveTab('settings');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm ${isDarkMode ? 'text-slate-200 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-100'}`}
            >
              Settings
            </button>
            <a
              href="/logout"
              className={`block w-full text-left px-4 py-3 rounded-xl font-bold text-sm ${isDarkMode ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              Log out
            </a>
          </div>
        </div>
      )}

      <main
        className={`flex-1 p-4 md:p-10 pb-24 md:pb-10 overflow-y-auto max-w-7xl mx-auto w-full transition-colors ${
          isDarkMode ? 'text-white' : 'text-slate-900'
        }`}
      >
        <div className="flex items-start justify-between mb-6 md:mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">{title}</h2>
            <p className={`text-sm font-bold mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{subtitle}</p>
          </div>
          {activeTab !== 'add' && (
            <button
              onClick={() => setActiveTab('add')}
              className={`hidden sm:flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm shadow-xl transition-all ${
                isDarkMode ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-slate-900 text-white hover:bg-black'
              }`}
            >
              <PlusCircle size={18} />
              Add Expense
            </button>
          )}
        </div>

        {activeTab === 'dashboard' && <Dashboard data={data} isDarkMode={isDarkMode} />}

        {activeTab === 'expenses' && (
          <ExpensesPage data={data} isDarkMode={isDarkMode} onUpdate={updateExpense} onDelete={deleteExpense} />
        )}

        {activeTab === 'add' && (
          <div className={`p-5 md:p-6 rounded-2xl border max-w-xl ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
            <ExpenseForm
              categories={data.categories}
              accounts={data.accounts}
              isDarkMode={isDarkMode}
              onSave={addExpense}
              onSaveRecurring={addRecurringExpense}
            />
          </div>
        )}

        {activeTab === 'categories' && (
          <CategoriesPage
            categories={data.categories}
            expenses={data.expenses}
            isDarkMode={isDarkMode}
            onChange={(categories) => setData((d) => ({ ...d, categories }))}
          />
        )}

        {activeTab === 'accounts' && (
          <AccountsPage
            accounts={data.accounts}
            expenses={data.expenses}
            isDarkMode={isDarkMode}
            onChange={(accounts) => setData((d) => ({ ...d, accounts }))}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPage
            data={data}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            onImportExpenses={importExpenses}
            onClearAll={clearAll}
            onCancelRecurring={cancelRecurringExpense}
            onDeleteRecurring={deleteRecurringExpense}
          />
        )}
      </main>

      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} isDarkMode={isDarkMode} />
    </div>
  );
}
