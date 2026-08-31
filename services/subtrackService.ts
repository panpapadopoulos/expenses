/**
 * Reads (read-only) SubTrack payment data via the Expenses Worker's
 * /api/subtrack-payments route, which in turn reads SubTrack's own KV
 * namespace (bound separately on the Worker). Never writes anything back.
 */

export interface SubtrackPayment {
  id: string;
  date: string;
  amount: number;
}

export async function fetchSubtrackPayments(): Promise<SubtrackPayment[]> {
  try {
    const response = await fetch('/api/subtrack-payments');
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data.payments) ? data.payments : [];
  } catch (error) {
    console.error('Error fetching SubTrack payments:', error);
    return [];
  }
}
