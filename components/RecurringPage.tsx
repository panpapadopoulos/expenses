import React, { useMemo, useState } from 'react';
import { Repeat, X, Trash2, Pencil, Check, CalendarClock } from 'lucide-react';
import { AppData, RecurringExpense } from '../types';
import { formatCurrency, formatDate } from '../utils/format';
import ConfirmDialog from './ConfirmDialog';
import StatCard from './StatCard';

interface Props {
  data: AppData;
  isDarkMode: boolean;
  onEdit: (template: RecurringExpense) => void;
  onCancel: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleMonthlyEquivalent: (id: string, show: boolean) => void;
}

export default function RecurringPage({ data, isDarkMode, onEdit, onCancel, onDelete, onToggleMonthlyEquivalent }: Props) {
  const { recurringExpenses, expenses, categories, accounts } = data;
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMerchant, setEditMerchant] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editAccountId, setEditAccountId] = useState('');

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name || 'Uncategorized';
  const generatedCount = (recurringId: string) => expenses.filter((e) => e.recurringId === recurringId).length;

  const activePlans = useMemo(() => recurringExpenses.filter((r) => r.active), [recurringExpenses]);
  const estMonthlyCost = useMemo(
    () => activePlans.reduce((sum, r) => sum + (r.frequency === 'yearly' ? r.amount / 12 : r.amount), 0),
    [activePlans]
  );

  function startEdit(r: RecurringExpense) {
    setEditingId(r.id);
    setEditMerchant(r.merchant);
    setEditAmount(String(r.amount));
    setEditCategoryId(r.categoryId);
    setEditAccountId(r.accountId);
  }

  function saveEdit(r: RecurringExpense) {
    const parsedAmount = parseFloat(editAmount);
    if (!editMerchant.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;
    onEdit({ ...r, merchant: editMerchant.trim(), amount: parsedAmount, categoryId: editCategoryId, accountId: editAccountId });
    setEditingId(null);
  }

  const cardClass = `p-5 md:p-6 rounded-2xl border transition-colors ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`;
  const inputClass = `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 font-bold text-sm transition-colors ${
    isDarkMode
      ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:ring-white/5 focus:border-slate-600'
      : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-slate-900/5 focus:border-slate-400 light-select'
  }`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:gap-4 max-w-md">
        <StatCard label="Active Plans" value={String(activePlans.length)} icon={Repeat} isDarkMode={isDarkMode} accent="#10b981" />
        <StatCard label="Est. Monthly Cost" value={formatCurrency(estMonthlyCost)} icon={CalendarClock} isDarkMode={isDarkMode} accent="#3b82f6" />
      </div>

      <div className={cardClass}>
        {recurringExpenses.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Repeat size={40} className={`mx-auto ${isDarkMode ? 'text-slate-700' : 'text-slate-200'}`} />
            <p className={`font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>No recurring expenses yet.</p>
            <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Add one from the "Add Expense" page by checking "This is a recurring expense".
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recurringExpenses.map((r) => {
              const count = generatedCount(r.id);

              if (editingId === r.id) {
                return (
                  <div key={r.id} className={`p-3 rounded-xl space-y-2 ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                    <input value={editMerchant} onChange={(e) => setEditMerchant(e.target.value)} className={inputClass} placeholder="Merchant" autoFocus />
                    <div className="flex flex-wrap gap-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        className={`${inputClass} w-28`}
                      />
                      <select value={editCategoryId} onChange={(e) => setEditCategoryId(e.target.value)} className={`${inputClass} flex-1 min-w-[140px]`}>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <select value={editAccountId} onChange={(e) => setEditAccountId(e.target.value)} className={`${inputClass} flex-1 min-w-[140px]`}>
                        {accounts.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      Only future payments use the new amount &mdash; {count} already-logged payment{count === 1 ? '' : 's'} stay unchanged.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(r)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs bg-emerald-500 text-white hover:bg-emerald-600"
                      >
                        <Check size={13} />
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs ${isDarkMode ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-700'}`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={r.id} className={`p-3 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${r.active ? 'bg-emerald-500/15 text-emerald-500' : 'bg-slate-500/15 text-slate-500'}`}>
                      <Repeat size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{r.merchant}</p>
                      <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        {formatCurrency(r.amount)}/{r.frequency === 'yearly' ? 'yr' : 'mo'}
                        {r.frequency === 'yearly' && r.showMonthlyEquivalent && (
                          <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}> &middot; &asymp; {formatCurrency(r.amount / 12)}/mo</span>
                        )}
                        {' '}&middot; {categoryName(r.categoryId)} &middot; since {formatDate(r.startDate)}
                      </p>
                    </div>
                    <span className={`text-xs font-black shrink-0 px-2.5 py-1 rounded-lg ${r.active ? (isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600') : (isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500')}`}>
                      {r.occurrences ? `${count} of ${r.occurrences}` : r.active ? 'Ongoing' : `${count} logged`}
                    </span>
                    <button
                      onClick={() => startEdit(r)}
                      title="Edit (affects future payments only)"
                      className={`p-2 rounded-lg ${isDarkMode ? 'text-slate-400 hover:bg-white/10' : 'text-slate-500 hover:bg-slate-200'}`}
                    >
                      <Pencil size={15} />
                    </button>
                    {r.active && (
                      <button
                        onClick={() => onCancel(r.id)}
                        title="Cancel (stop future payments, keep history)"
                        className={`p-2 rounded-lg ${isDarkMode ? 'text-slate-400 hover:bg-white/10' : 'text-slate-500 hover:bg-slate-200'}`}
                      >
                        <X size={15} />
                      </button>
                    )}
                    <button
                      onClick={() => setDeletingId(r.id)}
                      title="Delete this recurring plan"
                      className={`p-2 rounded-lg ${isDarkMode ? 'text-slate-400 hover:bg-red-500/10 hover:text-red-400' : 'text-slate-500 hover:bg-red-50 hover:text-red-500'}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  {r.frequency === 'yearly' && (
                    <label className="flex items-center gap-2 mt-2.5 ml-12 cursor-pointer w-fit">
                      <input
                        type="checkbox"
                        checked={!!r.showMonthlyEquivalent}
                        onChange={(e) => onToggleMonthlyEquivalent(r.id, e.target.checked)}
                        className="w-3.5 h-3.5 accent-emerald-500"
                      />
                      <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Break down into a monthly-equivalent amount
                      </span>
                    </label>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {deletingId && (
        <ConfirmDialog
          title="Delete recurring plan?"
          message="This removes the recurring plan so no future payments are logged. Expenses already generated from it stay in your history."
          isDarkMode={isDarkMode}
          onConfirm={() => {
            onDelete(deletingId);
            setDeletingId(null);
          }}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </div>
  );
}
