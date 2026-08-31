import React, { useMemo } from 'react';
import { Calendar, CalendarDays, Receipt, TrendingUp, Wallet, History } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { AppData } from '../types';
import StatCard from './StatCard';
import { formatCurrency, formatDate, monthLabel } from '../utils/format';
import {
  spendingThisMonth,
  spendingThisYear,
  allTimeSpending,
  averageMonthlySpending,
  monthlyTrend,
  spendingByCategory,
  spendingByYear,
} from '../utils/calculations';

interface Props {
  data: AppData;
  isDarkMode: boolean;
}

export default function Dashboard({ data, isDarkMode }: Props) {
  const { expenses, categories, accounts } = data;

  const allTime = useMemo(() => allTimeSpending(expenses), [expenses]);
  const thisMonth = useMemo(() => spendingThisMonth(expenses), [expenses]);
  const thisYear = useMemo(() => spendingThisYear(expenses), [expenses]);
  const avgMonthly = useMemo(() => averageMonthlySpending(expenses), [expenses]);
  const totalBalance = useMemo(() => accounts.reduce((sum, a) => sum + a.balance, 0), [accounts]);
  const trend = useMemo(() => monthlyTrend(expenses, 6), [expenses]);
  const byYear = useMemo(() => spendingByYear(expenses), [expenses]);
  const byCategory = useMemo(() => spendingByCategory(expenses, categories), [expenses, categories]);

  const recent = useMemo(
    () => [...expenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6),
    [expenses]
  );

  const trendData = trend.map((p) => ({ name: monthLabel(p.key), total: Number(p.total.toFixed(2)) }));
  const yearData = byYear.map((p) => ({ name: p.year, total: Number(p.total.toFixed(2)) }));

  const accountName = (id: string) => accounts.find((a) => a.id === id)?.name || 'Unknown';
  const categoryOf = (id: string) => categories.find((c) => c.id === id);

  const gridColor = isDarkMode ? '#1e293b' : '#e2e8f0';
  const textColor = isDarkMode ? '#94a3b8' : '#64748b';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
        <StatCard label="All-Time" value={formatCurrency(allTime)} icon={History} isDarkMode={isDarkMode} accent="#06b6d4" />
        <StatCard label="This Month" value={formatCurrency(thisMonth)} icon={Calendar} isDarkMode={isDarkMode} accent="#10b981" />
        <StatCard label="This Year" value={formatCurrency(thisYear)} icon={CalendarDays} isDarkMode={isDarkMode} accent="#3b82f6" />
        <StatCard label="Avg / Month" value={formatCurrency(avgMonthly)} icon={TrendingUp} isDarkMode={isDarkMode} accent="#f59e0b" />
        <StatCard label="Total Balance" value={formatCurrency(totalBalance)} icon={Wallet} isDarkMode={isDarkMode} accent="#ec4899" />
        <StatCard label="Transactions" value={String(expenses.length)} icon={Receipt} isDarkMode={isDarkMode} accent="#8b5cf6" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
        <div
          className={`lg:col-span-3 p-5 md:p-6 rounded-2xl border transition-colors ${
            isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <h3 className={`text-sm font-black uppercase tracking-widest mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Monthly Trend
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="name" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={textColor} fontSize={12} tickLine={false} axisLine={false} width={56} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#0f172a' : '#fff',
                  border: `1px solid ${gridColor}`,
                  borderRadius: 12,
                  fontSize: 12,
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Bar dataKey="total" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div
          className={`lg:col-span-2 p-5 md:p-6 rounded-2xl border transition-colors ${
            isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <h3 className={`text-sm font-black uppercase tracking-widest mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            By Category
          </h3>
          {byCategory.length === 0 ? (
            <p className={`text-sm font-medium py-10 text-center ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              No expenses yet.
            </p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={byCategory} dataKey="total" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={2}>
                    {byCategory.map((c) => (
                      <Cell key={c.categoryId} fill={c.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#0f172a' : '#fff',
                      border: `1px solid ${gridColor}`,
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3 max-h-32 overflow-y-auto pr-1">
                {byCategory.map((c) => (
                  <div key={c.categoryId} className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                      <span className={`truncate ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{c.name}</span>
                    </div>
                    <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>{formatCurrency(c.total)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div
        className={`p-5 md:p-6 rounded-2xl border transition-colors ${
          isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <h3 className={`text-sm font-black uppercase tracking-widest mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
          Spending by Year
        </h3>
        {yearData.length === 0 ? (
          <p className={`text-sm font-medium py-10 text-center ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            No expenses yet.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={yearData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="name" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={textColor} fontSize={12} tickLine={false} axisLine={false} width={56} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#0f172a' : '#fff',
                  border: `1px solid ${gridColor}`,
                  borderRadius: 12,
                  fontSize: 12,
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Bar dataKey="total" fill="#06b6d4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div
        className={`p-5 md:p-6 rounded-2xl border transition-colors ${
          isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <h3 className={`text-sm font-black uppercase tracking-widest mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
          Recent Transactions
        </h3>
        {recent.length === 0 ? (
          <p className={`text-sm font-medium py-8 text-center ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            No expenses yet. Add your first one.
          </p>
        ) : (
          <div className="divide-y divide-slate-800/50">
            {recent.map((e) => {
              const cat = categoryOf(e.categoryId);
              return (
                <div key={e.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat?.color || '#64748b' }} />
                    <div className="min-w-0">
                      <p className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{e.merchant}</p>
                      <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        {formatDate(e.date)} &middot; {accountName(e.accountId)}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-black shrink-0 ml-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {formatCurrency(e.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
