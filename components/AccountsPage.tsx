import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Wallet, Check, X } from 'lucide-react';
import { Account, Expense } from '../types';
import { uid } from '../utils/format';
import ConfirmDialog from './ConfirmDialog';

const TYPES = ['Credit Card', 'Debit Card', 'Bank Account', 'Cash', 'Other'];

interface Props {
  accounts: Account[];
  expenses: Expense[];
  isDarkMode: boolean;
  onChange: (accounts: Account[]) => void;
}

export default function AccountsPage({ accounts, expenses, isDarkMode, onChange }: Props) {
  const [name, setName] = useState('');
  const [type, setType] = useState(TYPES[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingType, setEditingType] = useState('');
  const [deleting, setDeleting] = useState<Account | null>(null);

  const usageCount = (id: string) => expenses.filter((e) => e.accountId === id).length;

  function addAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onChange([...accounts, { id: uid(), name: name.trim(), type }]);
    setName('');
  }

  function startEdit(a: Account) {
    setEditingId(a.id);
    setEditingName(a.name);
    setEditingType(a.type);
  }

  function saveEdit() {
    if (!editingName.trim()) return;
    onChange(accounts.map((a) => (a.id === editingId ? { ...a, name: editingName.trim(), type: editingType } : a)));
    setEditingId(null);
  }

  const cardClass = `p-5 md:p-6 rounded-2xl border transition-colors ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`;
  const inputClass = `w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 font-bold transition-colors ${
    isDarkMode
      ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:ring-white/5 focus:border-slate-600'
      : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-slate-900/5 focus:border-slate-400 light-select'
  }`;

  return (
    <div className="space-y-6">
      <div className={cardClass}>
        <h3 className={`text-sm font-black uppercase tracking-widest mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
          New Account
        </h3>
        <form onSubmit={addAccount} className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="e.g. Chase Sapphire"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`${inputClass} flex-1 min-w-[200px]`}
          />
          <select value={type} onChange={(e) => setType(e.target.value)} className={`${inputClass} w-44`}>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-black text-sm shadow-lg transition-all ${
              isDarkMode ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-slate-900 text-white hover:bg-black'
            }`}
          >
            <Plus size={16} />
            Add
          </button>
        </form>
      </div>

      <div className={cardClass}>
        <h3 className={`text-sm font-black uppercase tracking-widest mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
          Your Accounts
        </h3>
        {accounts.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Wallet size={40} className={`mx-auto ${isDarkMode ? 'text-slate-700' : 'text-slate-200'}`} />
            <p className={`font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>No accounts yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {accounts.map((a) => (
              <div key={a.id} className={`flex items-center gap-3 p-3 rounded-xl ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                {editingId === a.id ? (
                  <>
                    <input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className={`${inputClass} flex-1 py-2`}
                      autoFocus
                    />
                    <select value={editingType} onChange={(e) => setEditingType(e.target.value)} className={`${inputClass} w-40 py-2`}>
                      {TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <button onClick={saveEdit} className="p-2 rounded-lg text-emerald-500 hover:bg-emerald-500/10">
                      <Check size={16} />
                    </button>
                    <button onClick={() => setEditingId(null)} className={`p-2 rounded-lg ${isDarkMode ? 'text-slate-400 hover:bg-white/10' : 'text-slate-500 hover:bg-slate-100'}`}>
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{a.name}</p>
                      <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{a.type}</p>
                    </div>
                    <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      {usageCount(a.id)} expense{usageCount(a.id) === 1 ? '' : 's'}
                    </span>
                    <button onClick={() => startEdit(a)} className={`p-2 rounded-lg ${isDarkMode ? 'text-slate-400 hover:bg-white/10' : 'text-slate-500 hover:bg-slate-100'}`}>
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setDeleting(a)}
                      className={`p-2 rounded-lg ${isDarkMode ? 'text-slate-400 hover:bg-red-500/10 hover:text-red-400' : 'text-slate-500 hover:bg-red-50 hover:text-red-500'}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {deleting && (
        <ConfirmDialog
          title="Delete account?"
          message={
            usageCount(deleting.id) > 0
              ? `"${deleting.name}" is used by ${usageCount(deleting.id)} expense(s). Those expenses will keep referencing a removed account.`
              : `This will permanently remove "${deleting.name}".`
          }
          isDarkMode={isDarkMode}
          onConfirm={() => {
            onChange(accounts.filter((a) => a.id !== deleting.id));
            setDeleting(null);
          }}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
