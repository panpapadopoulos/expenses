import React, { useState } from 'react';
import { Repeat } from 'lucide-react';
import { Expense, Category, Account, RecurringExpense } from '../types';
import { todayISO, uid } from '../utils/format';

interface Props {
  categories: Category[];
  accounts: Account[];
  isDarkMode: boolean;
  editingExpense?: Expense;
  onSave: (expense: Expense) => void;
  onSaveRecurring?: (template: RecurringExpense) => void;
  onCancel?: () => void;
}

export default function ExpenseForm({ categories, accounts, isDarkMode, editingExpense, onSave, onSaveRecurring, onCancel }: Props) {
  const [date, setDate] = useState(editingExpense?.date || todayISO());
  const [merchant, setMerchant] = useState(editingExpense?.merchant || '');
  const [amount, setAmount] = useState(editingExpense ? String(editingExpense.amount) : '');
  const [categoryId, setCategoryId] = useState(editingExpense?.categoryId || categories[0]?.id || '');
  const [accountId, setAccountId] = useState(editingExpense?.accountId || accounts[0]?.id || '');
  const [notes, setNotes] = useState(editingExpense?.notes || '');
  const [isRecurring, setIsRecurring] = useState(false);
  const [endType, setEndType] = useState<'never' | 'count'>('never');
  const [occurrences, setOccurrences] = useState('4');
  const [error, setError] = useState('');

  const inputClass = `w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 font-bold transition-colors ${
    isDarkMode
      ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:ring-white/5 focus:border-slate-600'
      : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-slate-900/5 focus:border-slate-400 light-select'
  }`;
  const labelClass = `block text-xs font-black uppercase tracking-widest mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!merchant.trim()) return setError('Merchant / description is required.');
    if (isNaN(parsedAmount) || parsedAmount <= 0) return setError('Enter a valid amount.');
    if (!categoryId) return setError('Choose a category.');
    if (!accountId) return setError('Choose a payment method.');

    if (isRecurring && !editingExpense && onSaveRecurring) {
      const parsedOccurrences = parseInt(occurrences, 10);
      if (endType === 'count' && (isNaN(parsedOccurrences) || parsedOccurrences < 1)) {
        return setError('Enter a valid number of payments.');
      }
      onSaveRecurring({
        id: uid(),
        merchant: merchant.trim(),
        amount: parsedAmount,
        categoryId,
        accountId,
        notes: notes.trim() || undefined,
        frequency: 'monthly',
        startDate: date,
        occurrences: endType === 'count' ? parsedOccurrences : undefined,
        active: true,
      });
    } else {
      onSave({
        id: editingExpense?.id || uid(),
        date,
        merchant: merchant.trim(),
        amount: parsedAmount,
        categoryId,
        accountId,
        notes: notes.trim() || undefined,
      });
    }

    if (!editingExpense) {
      setMerchant('');
      setAmount('');
      setNotes('');
      setDate(todayISO());
      setIsRecurring(false);
      setEndType('never');
      setOccurrences('4');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 text-red-500 text-sm font-bold">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>Amount</label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={inputClass}
            required
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Merchant / Description</label>
        <input
          type="text"
          placeholder="e.g. Whole Foods"
          value={merchant}
          onChange={(e) => setMerchant(e.target.value)}
          className={inputClass}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Category</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass} required>
            {categories.length === 0 && <option value="">No categories yet</option>}
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Payment Method</label>
          <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className={inputClass} required>
            {accounts.length === 0 && <option value="">No accounts yet</option>}
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={`${inputClass} resize-none`}
          rows={3}
          placeholder="Anything worth remembering about this expense"
        />
      </div>

      {!editingExpense && onSaveRecurring && (
        <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4 accent-emerald-500"
            />
            <span className={`flex items-center gap-2 font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <Repeat size={15} />
              This repeats monthly
            </span>
          </label>
          <p className={`text-xs font-medium mt-1.5 ml-7 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            e.g. a Spotify subscription, or tuition split into installments
          </p>

          {isRecurring && (
            <div className="mt-4 ml-7 space-y-3">
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={endType === 'never'}
                    onChange={() => setEndType('never')}
                    className="accent-emerald-500"
                  />
                  <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                    Ongoing (no end date)
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={endType === 'count'}
                    onChange={() => setEndType('count')}
                    className="accent-emerald-500"
                  />
                  <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                    Ends after
                  </span>
                </label>
                {endType === 'count' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={occurrences}
                      onChange={(e) => setOccurrences(e.target.value)}
                      className={`${inputClass} w-20 py-2`}
                    />
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>payments</span>
                  </div>
                )}
              </div>
              <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                First payment logged on the date above; future ones appear automatically once their month arrives. Manage or cancel anytime from Settings.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className={`flex-1 py-3.5 rounded-2xl font-black text-sm shadow-xl transition-all ${
            isDarkMode ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-slate-900 text-white hover:bg-black'
          }`}
        >
          {editingExpense ? 'Save Changes' : 'Add Expense'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className={`px-6 py-3.5 rounded-2xl font-bold text-sm transition-colors ${
              isDarkMode ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
