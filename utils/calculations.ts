import { Expense } from '../types';
import { monthKey } from './format';

export function isSameMonth(iso: string, ref: Date): boolean {
  return monthKey(iso) === monthKey(ref.toISOString());
}

export function isSameYear(iso: string, ref: Date): boolean {
  return Number(iso.slice(0, 4)) === ref.getFullYear();
}

export function sum(expenses: Expense[]): number {
  return expenses.reduce((total, e) => total + e.amount, 0);
}

export function spendingThisMonth(expenses: Expense[], now = new Date()): number {
  return sum(expenses.filter((e) => isSameMonth(e.date, now)));
}

export function spendingThisYear(expenses: Expense[], now = new Date()): number {
  return sum(expenses.filter((e) => isSameYear(e.date, now)));
}

export function averageMonthlySpending(expenses: Expense[]): number {
  if (expenses.length === 0) return 0;
  const byMonth = new Map<string, number>();
  for (const e of expenses) {
    byMonth.set(monthKey(e.date), (byMonth.get(monthKey(e.date)) || 0) + e.amount);
  }
  const totals = Array.from(byMonth.values());
  return totals.reduce((a, b) => a + b, 0) / totals.length;
}

export interface MonthlyTrendPoint {
  key: string;
  total: number;
}

export function monthlyTrend(expenses: Expense[], months = 6): MonthlyTrendPoint[] {
  const now = new Date();
  const points: MonthlyTrendPoint[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    points.push({ key, total: 0 });
  }
  const map = new Map(points.map((p) => [p.key, p]));
  for (const e of expenses) {
    const key = monthKey(e.date);
    const point = map.get(key);
    if (point) point.total += e.amount;
  }
  return points;
}

export interface CategoryTotal {
  categoryId: string;
  name: string;
  color: string;
  total: number;
}

export function spendingByCategory(
  expenses: Expense[],
  categories: { id: string; name: string; color: string }[]
): CategoryTotal[] {
  const totals = new Map<string, number>();
  for (const e of expenses) {
    totals.set(e.categoryId, (totals.get(e.categoryId) || 0) + e.amount);
  }
  return Array.from(totals.entries())
    .map(([categoryId, total]) => {
      const cat = categories.find((c) => c.id === categoryId);
      return {
        categoryId,
        name: cat?.name || 'Uncategorized',
        color: cat?.color || '#64748b',
        total,
      };
    })
    .sort((a, b) => b.total - a.total);
}
