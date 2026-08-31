import { AppData } from '../types';
import { SubtrackPayment } from '../services/subtrackService';

// Idempotent: applies only payments not already synced, adding their total
// to the chosen account's balance. Does nothing until a target account is
// chosen in Settings.
export function applySubtrackPayments(data: AppData, payments: SubtrackPayment[]): AppData {
  const { targetAccountId, syncedPaymentIds } = data.subtrackSync;
  if (!targetAccountId) return data;

  const synced = new Set(syncedPaymentIds);
  const newPayments = payments.filter((p) => !synced.has(p.id));
  if (newPayments.length === 0) return data;

  const addedTotal = newPayments.reduce((sum, p) => sum + p.amount, 0);

  return {
    ...data,
    accounts: data.accounts.map((a) => (a.id === targetAccountId ? { ...a, balance: a.balance + addedTotal } : a)),
    subtrackSync: {
      ...data.subtrackSync,
      syncedPaymentIds: [...syncedPaymentIds, ...newPayments.map((p) => p.id)],
    },
  };
}
