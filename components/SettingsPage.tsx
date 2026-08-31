import React, { useRef, useState } from 'react';
import { Sun, Moon, Download, Upload, LogOut, AlertTriangle } from 'lucide-react';
import { AppData, Expense } from '../types';
import { uid } from '../utils/format';
import ConfirmDialog from './ConfirmDialog';

interface Props {
  data: AppData;
  isDarkMode: boolean;
  setIsDarkMode: (v: boolean) => void;
  onImportExpenses: (expenses: Expense[]) => void;
  onClearAll: () => void;
}

function toCSV(data: AppData): string {
  const catName = (id: string) => data.categories.find((c) => c.id === id)?.name || '';
  const accName = (id: string) => data.accounts.find((a) => a.id === id)?.name || '';
  const rows = [
    ['date', 'merchant', 'amount', 'category', 'account', 'notes'],
    ...data.expenses.map((e) => [e.date, e.merchant, String(e.amount), catName(e.categoryId), accName(e.accountId), e.notes || '']),
  ];
  return rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n');
}

function parseCSV(text: string, data: AppData): Expense[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const parsed: Expense[] = [];
  for (const line of lines.slice(1)) {
    const cells = line.match(/(".*?"|[^,]+)(?=,|$)/g)?.map((c) => c.replace(/^"|"$/g, '').replace(/""/g, '"')) || [];
    const [date, merchant, amount, categoryName, accountName, notes] = cells;
    if (!date || !merchant || !amount) continue;
    let category = data.categories.find((c) => c.name === categoryName);
    let account = data.accounts.find((a) => a.name === accountName);
    parsed.push({
      id: uid(),
      date,
      merchant,
      amount: parseFloat(amount) || 0,
      categoryId: category?.id || data.categories[0]?.id || '',
      accountId: account?.id || data.accounts[0]?.id || '',
      notes: notes || undefined,
    });
  }
  return parsed;
}

export default function SettingsPage({ data, isDarkMode, setIsDarkMode, onImportExpenses, onClearAll }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMessage, setImportMessage] = useState('');
  const [confirmingClear, setConfirmingClear] = useState(false);

  const cardClass = `p-5 md:p-6 rounded-2xl border transition-colors ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`;

  function handleExport() {
    const blob = new Blob([toCSV(data)], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const imported = parseCSV(String(reader.result), data);
      onImportExpenses(imported);
      setImportMessage(`Imported ${imported.length} expense(s).`);
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className={cardClass}>
        <h3 className={`text-sm font-black uppercase tracking-widest mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
          Appearance
        </h3>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`w-full flex items-center justify-between px-5 py-4 rounded-xl font-bold text-sm transition-colors ${
            isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-50 text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span className="flex items-center gap-3">
            {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
            {isDarkMode ? 'Dark mode' : 'Light mode'}
          </span>
          <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Tap to switch</span>
        </button>
      </div>

      <div className={cardClass}>
        <h3 className={`text-sm font-black uppercase tracking-widest mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
          Data
        </h3>
        <div className="space-y-3">
          <button
            onClick={handleExport}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl font-bold text-sm transition-colors ${
              isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-50 text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Download size={18} />
            Export all expenses as CSV
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl font-bold text-sm transition-colors ${
              isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-50 text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Upload size={18} />
            Import expenses from CSV
          </button>
          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleImportFile} className="hidden" />
          {importMessage && <p className="text-xs font-bold text-emerald-500">{importMessage}</p>}
        </div>
      </div>

      <div className={`${cardClass} border-red-500/30`}>
        <h3 className="text-sm font-black uppercase tracking-widest mb-4 text-red-500 flex items-center gap-2">
          <AlertTriangle size={16} />
          Danger Zone
        </h3>
        <button
          onClick={() => setConfirmingClear(true)}
          className="w-full px-5 py-4 rounded-xl font-bold text-sm bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
        >
          Clear all expense data
        </button>
      </div>

      <a
        href="/logout"
        className={`md:hidden w-full flex items-center justify-center gap-3 px-5 py-4 rounded-xl font-bold text-sm transition-colors ${
          isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
        }`}
      >
        <LogOut size={18} />
        Log out
      </a>

      {confirmingClear && (
        <ConfirmDialog
          title="Clear all expense data?"
          message="This permanently deletes every expense, category, and account. This can't be undone."
          isDarkMode={isDarkMode}
          onConfirm={() => {
            onClearAll();
            setConfirmingClear(false);
          }}
          onCancel={() => setConfirmingClear(false)}
        />
      )}
    </div>
  );
}
