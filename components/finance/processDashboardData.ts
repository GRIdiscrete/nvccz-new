import {
  AccountSummary,
  Basis,
  ComparisonRange,
  DashboardMetrics,
  JournalEntry,
} from './types';

const pctChange = (current: number, previous: number) => {
  if (!isFinite(previous) || previous === 0) return 0;
  return ((current - previous) / Math.abs(previous)) * 100;
};
const lastTwo = (obj: Record<string, any>) => {
  const keys = Object.keys(obj).sort();
  if (keys.length < 2) return null;
  const prevKey = keys[keys.length - 2];
  const currKey = keys[keys.length - 1];
  return { prevKey, currKey };
};
const safeNumber = (v: any) => (Number.isFinite(+v) ? +v : 0);

// Keys for charts (monthly) and dynamic comparison ranges
const monthKeyOf = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};
const yearKeyOf = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return `${d.getFullYear()}`;
};
const quarterKeyOf = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const q = Math.floor(d.getMonth() / 3) + 1;
  return `${d.getFullYear()}-Q${q}`;
};
const isoWeekKeyOf = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  // ISO week: Thursday of current week defines the year
  const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNr = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const diff = +target - +firstThursday;
  const week = 1 + Math.round(diff / (7 * 24 * 3600 * 1000));
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
};

const isCashLike = (name: string) => /cash|bank/i.test(name);
const isReceivable = (name: string) => /receivable/i.test(name);
const isPayable = (name: string) => /payable/i.test(name);

const bump = (
  map: Map<string, AccountSummary>,
  key: string,
  base: { accountName: string; accountNo: string; accountType: string },
  dDr: number,
  dCr: number,
  dBal: number
) => {
  const ex =
    map.get(key) || {
      accountName: base.accountName,
      accountNo: base.accountNo,
      accountType: base.accountType,
      totalDebit: 0,
      totalCredit: 0,
      balance: 0,
    };
  map.set(key, {
    ...ex,
    totalDebit: ex.totalDebit + dDr,
    totalCredit: ex.totalCredit + dCr,
    balance: ex.balance + dBal,
  });
};

export function processDashboardData(
  entries: JournalEntry[],
  basis: Basis,
  compareRange: ComparisonRange
): DashboardMetrics {
  // For charts (still monthly)
  const monthlyTotals: Record<string, { revenue: number; expense: number }> = {};
  const monthlyCashFlow: Record<string, number> = {};

  // For dynamic comparisons (week, month, quarter, year)
  const periodTotals: Record<string, { revenue: number; expense: number }> = {};
  const periodCashFlow: Record<string, number> = {};

  const ensureMonthly = (k: string) => {
    if (!monthlyTotals[k]) monthlyTotals[k] = { revenue: 0, expense: 0 };
    if (monthlyCashFlow[k] == null) monthlyCashFlow[k] = 0;
  };
  const ensurePeriod = (k: string) => {
    if (!periodTotals[k]) periodTotals[k] = { revenue: 0, expense: 0 };
    if (periodCashFlow[k] == null) periodCashFlow[k] = 0;
  };

  const revenueMap = new Map<string, AccountSummary>();
  const expenseMap = new Map<string, AccountSummary>();

  let cash = 0;
  let receivablesTotal = 0;
  let payablesTotal = 0;

  const keyFn =
    compareRange === 'week'
      ? isoWeekKeyOf
      : compareRange === 'quarter'
      ? quarterKeyOf
      : compareRange === 'year'
      ? yearKeyOf
      : monthKeyOf; // 'month'

  entries.forEach((entry) => {
    const mk = monthKeyOf(entry.transactionDate);
    const pk = keyFn(entry.transactionDate);
    if (!mk || !pk) return;

    ensureMonthly(mk);
    ensurePeriod(pk);

    const lines = entry.journalEntryLines || [];

    const hasARCounterpart = lines.some((l) => l.chartOfAccount && isReceivable(l.chartOfAccount.accountName));
    const hasRevenueCounterpart = lines.some((l) => /revenue/i.test(l.chartOfAccount?.accountType || ''));
    const hasExpenseCounterpart = lines.some((l) => /expense/i.test(l.chartOfAccount?.accountType || ''));

    lines.forEach((line) => {
      const acct = line.chartOfAccount;
      if (!acct) return;

      const name = acct.accountName || '';
      const type = acct.accountType || '';
      const stmt = acct.financialStatement || '';
      const debit = safeNumber(line.debitAmount);
      const credit = safeNumber(line.creditAmount);
      const accountId = acct.id || '';
      const accountNo = acct.accountNo || '';

      const cashLike = isCashLike(name);
      const receivable = isReceivable(name);
      const payable = isPayable(name);
      const revenueAccount = /revenue/i.test(type) || (/income statement/i.test(stmt) && /revenue/i.test(type));
      const expenseAccount = /expense/i.test(type) || (/income statement/i.test(stmt) && /expense/i.test(type));

      // Cash balance (affects both monthly and period cash flow)
      if (cashLike) {
        const delta = debit - credit;
        cash += delta;
        monthlyCashFlow[mk] += delta;
        periodCashFlow[pk] += delta;
      }

      // AR/AP balances
      if (receivable) receivablesTotal += debit - credit;
      if (payable) payablesTotal += credit - debit;

      // Basis-specific recognition
      if (basis === 'accrual') {
        if (revenueAccount) {
          const rev = Math.max(0, credit - debit);
          if (rev > 0) {
            monthlyTotals[mk].revenue += rev;
            periodTotals[pk].revenue += rev;
            bump(revenueMap, accountId, { accountName: name, accountNo, accountType: 'Revenue' }, debit, credit, rev);
          }
        } else if (receivable && debit > 0) {
          monthlyTotals[mk].revenue += debit;
          periodTotals[pk].revenue += debit;
          bump(
            revenueMap,
            'REV_FROM_AR',
            { accountName: 'Invoiced Revenue (A/R)', accountNo: '—', accountType: 'Revenue' },
            debit,
            credit,
            debit
          );
        }

        if (expenseAccount) {
          const exp = Math.max(0, debit - credit);
          if (exp > 0) {
            monthlyTotals[mk].expense += exp;
            periodTotals[pk].expense += exp;
            bump(expenseMap, accountId, { accountName: name, accountNo, accountType: 'Expense' }, debit, credit, exp);
          }
        }
      } else {
        // CASH BASIS
        if (cashLike && debit > 0 && (hasARCounterpart || hasRevenueCounterpart)) {
          monthlyTotals[mk].revenue += debit;
          periodTotals[pk].revenue += debit;
          bump(
            revenueMap,
            'CASH_COLLECTED',
            { accountName: 'Cash-collected Revenue', accountNo: '—', accountType: 'Revenue' },
            debit,
            0,
            debit
          );
        }
        if (cashLike && credit > 0 && hasExpenseCounterpart) {
          monthlyTotals[mk].expense += credit;
          periodTotals[pk].expense += credit;
          bump(
            expenseMap,
            'CASH_PAID',
            { accountName: 'Cash-paid Expenses', accountNo: '—', accountType: 'Expense' },
            0,
            credit,
            credit
          );
        }
      }
    });
  });

  const revenues = Array.from(revenueMap.values());
  const expenses = Array.from(expenseMap.values());

  const totalRevenue = revenues.reduce((s, a) => s + Math.max(0, a.balance), 0);
  const totalExpense = expenses.reduce((s, a) => s + Math.max(0, a.balance), 0);
  const netProfit = totalRevenue - totalExpense;

  const monthlyData = Object.entries(monthlyTotals)
    .map(([month, t]) => ({ month, revenue: t.revenue || 0, expense: t.expense || 0, profit: (t.revenue || 0) - (t.expense || 0) }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Changes vs *selected* last period
  let revenueChange = 0, expenseChange = 0, profitChange = 0, cashChange = 0;
  const lt = lastTwo(periodTotals);
  if (lt) {
    const { prevKey, currKey } = lt;
    const prev = periodTotals[prevKey];
    const curr = periodTotals[currKey];
    revenueChange = pctChange(curr.revenue ?? 0, prev.revenue ?? 0);
    expenseChange = pctChange(curr.expense ?? 0, prev.expense ?? 0);
    const prevProfit = (prev.revenue ?? 0) - (prev.expense ?? 0);
    const currProfit = (curr.revenue ?? 0) - (curr.expense ?? 0);
    profitChange = pctChange(currProfit, prevProfit);

    const prevCash = periodCashFlow[prevKey] ?? 0;
    const currCash = periodCashFlow[currKey] ?? 0;
    cashChange = pctChange(currCash, prevCash);
  }

  return {
    revenues,
    expenses,
    totalRevenue,
    totalExpense,
    netProfit,
    cashBalance: cash,
    receivables: receivablesTotal,
    payables: payablesTotal,
    monthlyData,
    changes: {
      revenue: Number.isFinite(revenueChange) ? revenueChange : 0,
      expense: Number.isFinite(expenseChange) ? -expenseChange : 0,
      profit: Number.isFinite(profitChange) ? profitChange : 0,
      cash: Number.isFinite(cashChange) ? cashChange : 0,
    },
  };
}
