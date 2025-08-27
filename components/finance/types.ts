export type Basis = 'accrual' | 'cash';
export type CurrencyChoice =  'ZWL' | 'USD';
export type ComparisonRange = 'week' | 'month' | 'quarter' | 'year';

export type ApexSeries = { name?: string; data: number[] }[];

export interface JournalEntry {
  id: string;
  transactionDate: string;
  referenceNumber: string;
  description: string;
  totalAmount: string;
  currencyId: string;
  status: string;
  journalEntryLines: JournalEntryLine[];
  currency?: { id?: string; code?: string; name?: string; symbol?: string };
  // Optional entry-level payment method (not used in calcs, preference is per-line)
  paymentMethod?: string | null;
}

export interface JournalEntryLine {
  id: string;
  journalEntryId: string;
  chartOfAccountId: string;
  debitAmount: string;
  creditAmount: string;
  description: string;
  vatAmount: string;
  createdAt: string;
  chartOfAccount: {
    id: string;
    accountNo: string;
    accountName: string;
    accountType: string;
    financialStatement: string;
    notes: string | null;
    parentId: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  // ✅ New field from API
  paymentMethod?: string | null; // e.g. "CASH" | "EFT" | null
}

export interface AccountSummary {
  accountName: string;
  accountNo: string;
  accountType: string;
  totalDebit: number;
  totalCredit: number;
  balance: number;
}

export interface MonthlyPoint {
  month: string;
  revenue: number;
  expense: number;
  profit: number;
}

export interface DashboardMetrics {
  revenues: AccountSummary[];
  expenses: AccountSummary[];
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
  cashBalance: number;
  receivables: number;
  payables: number;
  monthlyData: MonthlyPoint[];
  changes: { revenue: number; expense: number; profit: number; cash: number };
}
