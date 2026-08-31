import { AppData, RecurringExpense } from '../types';
import { uid } from './format';

function toISO(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// All occurrence dates for this template that are due by `today`, stepping
// monthly or yearly, capped at `occurrences` total if the plan has a fixed end.
function dueDates(template: RecurringExpense, today: Date): string[] {
  const [sy, sm, sd] = template.startDate.split('-').map(Number);
  const dates: string[] = [];
  const stepMonths = template.frequency === 'yearly' ? 12 : 1;
  const maxIterations = template.occurrences ?? (template.frequency === 'yearly' ? 50 : 240); // safety cap for an ongoing plan: 50 years
  for (let i = 0; i < maxIterations; i++) {
    const monthDate = new Date(sy, sm - 1 + i * stepMonths, 1);
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
    const occurrence = new Date(monthDate.getFullYear(), monthDate.getMonth(), Math.min(sd, daysInMonth));
    if (occurrence > today) break;
    dates.push(toISO(occurrence));
    if (template.occurrences && dates.length >= template.occurrences) break;
  }
  return dates;
}

// Idempotent: safe to call on every load. Adds any occurrence that has come
// due since the last run, and marks a template inactive once it has
// generated its full fixed number of occurrences.
export function generateDueExpenses(data: AppData): AppData {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expenses = [...data.expenses];

  const recurringExpenses = data.recurringExpenses.map((template) => {
    if (!template.active) return template;

    const existingDates = new Set(expenses.filter((e) => e.recurringId === template.id).map((e) => e.date));
    let addedCount = 0;

    for (const date of dueDates(template, today)) {
      if (!existingDates.has(date)) {
        expenses.push({
          id: uid(),
          date,
          merchant: template.merchant,
          amount: template.amount,
          categoryId: template.categoryId,
          accountId: template.accountId,
          notes: template.notes,
          recurringId: template.id,
        });
        addedCount++;
      }
    }

    const totalGenerated = existingDates.size + addedCount;
    const completed = template.occurrences != null && totalGenerated >= template.occurrences;
    return completed ? { ...template, active: false } : template;
  });

  return { ...data, expenses, recurringExpenses };
}
