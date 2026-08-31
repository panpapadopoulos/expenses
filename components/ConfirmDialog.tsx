import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  title: string;
  message: string;
  isDarkMode: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ title, message, isDarkMode, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onCancel}>
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}
      >
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
          <AlertTriangle size={22} className="text-red-500" />
        </div>
        <h3 className={`text-lg font-black mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
        <p className={`text-sm font-medium mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-colors ${
              isDarkMode ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl font-bold text-sm bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
