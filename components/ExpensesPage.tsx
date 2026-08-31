import React, { useMemo, useState } from 'react';
import { Search, ArrowUpDown, Pencil, Trash2, Receipt } from 'lucide-react';
import { AppData, Expense, SortField, SortOrder } from '../types';
import { formatCurrency, formatDate } from '../utils/format';
import ConfirmDialog from './ConfirmDialog';
import ExpenseForm from './ExpenseForm';

interface Props {
  data: AppData;
  isDarkMode: boolean;
  onUpdate: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export default function ExpensesPage({ data, isDarkMode, onUpdate, onDelete }: Props) {
  const { expenses, categories, accounts } = data;
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [accountFilter, setAccountFilter] = useState('All');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name || 'Uncategorized';
  const categoryColor = (id: string) => categories.find((c) => c.id === id)?.color || '#64748b';
  const accountName = (id: string) => accounts.find((a) => a.id === id)?.name || 'Unknown';

  const filtered = useMemo(() => {
    let list = expenses.filter((e) => {
      const matchesSearch =
        !search ||
        e.merchant.toLowerCase().includes(search.toLowerCase()) ||
        (e.notes || '').toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || e.categoryId === categoryFilter;
      const matchesAccount = accountFilter === 'All' || e.accountId === accountFilter;
      return matchesSearch && matchesCategory && matchesAccount;
    });

    list = list.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'date') cmp = a.date.localeCompare(b.date);
      else if (sortField === 'amount') cmp = a.amount - b.amount;
      else if (sortField === 'merchant') cmp = a.merchant.localeCompare(b.merchant);
      else if (sortField === 'category') cmp = categoryName(a.categoryId).localeCompare(categoryName(b.categoryId));
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [expenses, search, categoryFilter, accountFilter, sortField, sortOrder, categories]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  }

  const selectClass = `bg-transparent border-none text-xs font-black uppercase tracking-widest focus:ring-0 cursor-pointer py-1 pr-8 ${
    isDarkMode ? 'text-white' : 'text-slate-900 light-select'
  }`;
  const filterWrapClass = `flex items-center gap-2 border p-1 rounded-xl ${
    isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
  }`;

  return (
    <div className="space-y-4">
      {editing && (
        <div className={`p-5 md:p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
          <h3 className={`text-sm font-black uppercase tracking-widest mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Edit Expense
          </h3>
          <ExpenseForm
            categories={categories}
            accounts={accounts}
            isDarkMode={isDarkMode}
            editingExpense={editing}
            onSave={(expense) => {
              onUpdate(expense);
              setEditing(null);
            }}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      <div
        className={`p-4 rounded-2xl border flex flex-wrap items-center gap-3 transition-colors ${
          isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="relative flex-1 min-w-[180px]">
          <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search merchant or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 font-bold text-sm transition-colors ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:ring-white/5 focus:border-slate-600'
                : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-slate-900/5 focus:border-slate-400'
            }`}
          />
        </div>

        <div className={filterWrapClass}>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={selectClass}>
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className={filterWrapClass}>
          <select value={accountFilter} onChange={(e) => setAccountFilter(e.target.value)} className={selectClass}>
            <option value="All">All Accounts</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={`rounded-2xl border overflow-hidden transition-colors ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
        {filtered.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <Receipt size={48} className={`mx-auto ${isDarkMode ? 'text-slate-700' : 'text-slate-200'}`} />
            <p className={`font-black text-lg ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>No expenses match your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b text-left ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                  {(
                    [
                      ['date', 'Date'],
                      ['merchant', 'Merchant'],
                      ['category', 'Category'],
                      ['amount', 'Amount'],
                    ] as [SortField, string][]
                  ).map(([field, label]) => (
                    <th key={field} className="px-5 py-3">
                      <button
                        onClick={() => toggleSort(field)}
                        className={`flex items-center gap-1 text-xs font-black uppercase tracking-widest ${
                          isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {label}
                        <ArrowUpDown size={12} className={sortField === field ? 'opacity-100' : 'opacity-30'} />
                      </button>
                    </th>
                  ))}
                  <th className="px-5 py-3">
                    <span className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Account
                    </span>
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                {filtered.map((e) => (
                  <tr key={e.id} className={isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'}>
                    <td className={`px-5 py-3.5 font-bold whitespace-nowrap ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      {formatDate(e.date)}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{e.merchant}</p>
                      {e.notes && <p className={`text-xs font-medium truncate max-w-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{e.notes}</p>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black"
                        style={{ backgroundColor: `${categoryColor(e.categoryId)}20`, color: categoryColor(e.categoryId) }}
                      >
                        {categoryName(e.categoryId)}
                      </span>
                    </td>
                    <td className={`px-5 py-3.5 font-black whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {formatCurrency(e.amount)}
                    </td>
                    <td className={`px-5 py-3.5 font-bold whitespace-nowrap ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {accountName(e.accountId)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => setEditing(e)}
                          className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleting(e)}
                          className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-red-500/10 text-slate-400 hover:text-red-400' : 'hover:bg-red-50 text-slate-500 hover:text-red-500'}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleting && (
        <ConfirmDialog
          title="Delete expense?"
          message={`This will permanently remove "${deleting.merchant}" (${formatCurrency(deleting.amount)}). This can't be undone.`}
          isDarkMode={isDarkMode}
          onConfirm={() => {
            onDelete(deleting.id);
            setDeleting(null);
          }}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
