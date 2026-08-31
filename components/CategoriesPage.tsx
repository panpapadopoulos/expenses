import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Tags, Check, X } from 'lucide-react';
import { Category, Expense } from '../types';
import { uid } from '../utils/format';
import ConfirmDialog from './ConfirmDialog';

const SWATCHES = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444', '#06b6d4', '#84cc16', '#f97316', '#64748b'];

interface Props {
  categories: Category[];
  expenses: Expense[];
  isDarkMode: boolean;
  onChange: (categories: Category[]) => void;
}

export default function CategoriesPage({ categories, expenses, isDarkMode, onChange }: Props) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(SWATCHES[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingColor, setEditingColor] = useState('');
  const [deleting, setDeleting] = useState<Category | null>(null);

  const usageCount = (id: string) => expenses.filter((e) => e.categoryId === id).length;

  function addCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onChange([...categories, { id: uid(), name: name.trim(), color }]);
    setName('');
    setColor(SWATCHES[(categories.length + 1) % SWATCHES.length]);
  }

  function startEdit(c: Category) {
    setEditingId(c.id);
    setEditingName(c.name);
    setEditingColor(c.color);
  }

  function saveEdit() {
    if (!editingName.trim()) return;
    onChange(categories.map((c) => (c.id === editingId ? { ...c, name: editingName.trim(), color: editingColor } : c)));
    setEditingId(null);
  }

  const cardClass = `p-5 md:p-6 rounded-2xl border transition-colors ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`;
  const inputClass = `w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 font-bold transition-colors ${
    isDarkMode
      ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:ring-white/5 focus:border-slate-600'
      : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-slate-900/5 focus:border-slate-400'
  }`;

  return (
    <div className="space-y-6">
      <div className={cardClass}>
        <h3 className={`text-sm font-black uppercase tracking-widest mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
          New Category
        </h3>
        <form onSubmit={addCategory} className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="e.g. Groceries"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`${inputClass} flex-1 min-w-[200px]`}
          />
          <div className="flex items-center gap-1.5">
            {SWATCHES.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => setColor(s)}
                className="w-7 h-7 rounded-full transition-transform"
                style={{ backgroundColor: s, transform: color === s ? 'scale(1.2)' : 'scale(1)', boxShadow: color === s ? `0 0 0 2px ${isDarkMode ? '#0f172a' : '#fff'}, 0 0 0 4px ${s}` : 'none' }}
              />
            ))}
          </div>
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
          Your Categories
        </h3>
        {categories.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Tags size={40} className={`mx-auto ${isDarkMode ? 'text-slate-700' : 'text-slate-200'}`} />
            <p className={`font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>No categories yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map((c) => (
              <div
                key={c.id}
                className={`flex items-center gap-3 p-3 rounded-xl ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
              >
                {editingId === c.id ? (
                  <>
                    <div className="flex items-center gap-1.5">
                      {SWATCHES.map((s) => (
                        <button
                          key={s}
                          onClick={() => setEditingColor(s)}
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: s, transform: editingColor === s ? 'scale(1.2)' : 'scale(1)' }}
                        />
                      ))}
                    </div>
                    <input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className={`${inputClass} flex-1 py-2`}
                      autoFocus
                    />
                    <button onClick={saveEdit} className="p-2 rounded-lg text-emerald-500 hover:bg-emerald-500/10">
                      <Check size={16} />
                    </button>
                    <button onClick={() => setEditingId(null)} className={`p-2 rounded-lg ${isDarkMode ? 'text-slate-400 hover:bg-white/10' : 'text-slate-500 hover:bg-slate-100'}`}>
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                    <span className={`flex-1 font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{c.name}</span>
                    <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      {usageCount(c.id)} expense{usageCount(c.id) === 1 ? '' : 's'}
                    </span>
                    <button onClick={() => startEdit(c)} className={`p-2 rounded-lg ${isDarkMode ? 'text-slate-400 hover:bg-white/10' : 'text-slate-500 hover:bg-slate-100'}`}>
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setDeleting(c)}
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
          title="Delete category?"
          message={
            usageCount(deleting.id) > 0
              ? `"${deleting.name}" is used by ${usageCount(deleting.id)} expense(s). They will become uncategorized.`
              : `This will permanently remove "${deleting.name}".`
          }
          isDarkMode={isDarkMode}
          onConfirm={() => {
            onChange(categories.filter((c) => c.id !== deleting.id));
            setDeleting(null);
          }}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
