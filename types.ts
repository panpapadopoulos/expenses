export interface Expense {
  id: string;
  date: string; // ISO date, YYYY-MM-DD
  merchant: string;
  amount: number;
  categoryId: string;
  accountId: string;
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Account {
  id: string;
  name: string;
  type: string;
}

export interface AppData {
  expenses: Expense[];
  categories: Category[];
  accounts: Account[];
}

export type SortField = 'date' | 'amount' | 'merchant' | 'category';
export type SortOrder = 'asc' | 'desc';
export type Tab = 'dashboard' | 'expenses' | 'add' | 'categories' | 'accounts' | 'settings';
