// components/finance/processDashboardData.ts
import {
  AccountSummary,
  Basis,
  ComparisonRange,
  DashboardMetrics,
  JournalEntry,
} from './types';

/** ---------- Small utils ---------- */
const num = (v: any) => (Number.isFinite(+v) ? +v : 0);
const pct = (cur: number, prev: number) => (!isFinite(prev) || prev === 0 ? 0 : ((cur - prev) / Math.abs(prev)) * 100);

/** ---------- Key formatters ---------- */
const monthKeyOf = (iso: string) => {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};
const isoWeekKeyOf = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = (t.getUTCDay() + 6) % 7; // Mon=0..Sun=6
  t.setUTCDate(t.getUTCDate() - day + 3); // Thu
  const firstThu = new Date(Date.UTC(t.getUTCFullYear(), 0, 4));
  const wk = 1 + Math.round((+t - +firstThu) / (7 * 24 * 3600 * 1000));
  return `${t.getUTCFullYear()}-W${String(wk).padStart(2, '0')}`;
};

/** ---------- Date windows (FY = Jan 1) ---------- */
const startOfISOWeek = (d: Date) => {
  const x = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = (x.getUTCDay() + 6) % 7;
  x.setUTCDate(x.getUTCDate() - day);
  x.setUTCHours(0, 0, 0, 0);
  return x;
};
const endOfISOWeek = (d: Date) => {
  const s = startOfISOWeek(d);
  const e = new Date(s);
  e.setUTCDate(e.getUTCDate() + 7); // exclusive
  return e;
};
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 1, 0, 0, 0, 0); // exclusive
const startOfFY = (d: Date) => new Date(d.getFullYear(), 0, 1, 0, 0, 0, 0);

const clampSameDayPrevYearExclusiveEnd = (now: Date) => {
  const ly = now.getFullYear() - 1;
  const endInc = new Date(ly, now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return new Date(endInc.getFullYear(), endInc.getMonth(), endInc.getDate() + 1, 0, 0, 0, 0);
};

function buildWindows(range: ComparisonRange, now: Date) {
  if (range === 'week') {
    // Current ISO week vs the immediately preceding ISO week
    const cs = startOfISOWeek(now);
    const ce = endOfISOWeek(now);
    const ps = new Date(cs); ps.setUTCDate(ps.getUTCDate() - 7);
    const pe = new Date(cs); // previous window ends where current starts (exclusive)
    return { cs, ce, ps, pe, labelFn: isoWeekKeyOf };
  }

  if (range === 'year') {
    // YTD vs prior-year YTD (same day last year, exclusive end)
    const cs = startOfFY(now);
    const ce = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0); // exclusive
    const ps = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
    const pe = clampSameDayPrevYearExclusiveEnd(now);
    return { cs, ce, ps, pe, labelFn: monthKeyOf }; // chart by month in YTD
  }

  // default: month -> current month vs immediately preceding month
  const cs = startOfMonth(now);
  const ce = endOfMonth(now);
  const ps = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
  const pe = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0); // exclusive
  return { cs, ce, ps, pe, labelFn: monthKeyOf };
}


/** ---------- Classifiers ---------- */
const isCashLike = (name?: string) => !!name && /cash|bank/i.test(name);
const isRevenue = (a: any) => (a?.accountType || '').toLowerCase().includes('revenue');
const isExpense = (a: any) => (a?.accountType || '').toLowerCase().includes('expense');
const isAR = (a: any) => /accounts?\s*receivable/i.test(a?.accountName || '');
const isAP = (a: any) => /accounts?\s*payable/i.test(a?.accountName || '');
const isVAT = (a: any) => /vat\s*(input|output)/i.test(a?.accountName || '');

/** ---------- Summation helper ---------- */
const bump = (
  map: Map<string, AccountSummary>,
  key: string,
  base: { accountName: string; accountNo: string; accountType: string },
  dDr: number,
  dCr: number,
  dBal: number
) => {
  const prev = map.get(key) || {
    accountName: base.accountName,
    accountNo: base.accountNo,
    accountType: base.accountType,
    totalDebit: 0,
    totalCredit: 0,
    balance: 0,
  };
  map.set(key, {
    ...prev,
    totalDebit: prev.totalDebit + dDr,
    totalCredit: prev.totalCredit + dCr,
    balance: prev.balance + dBal,
  });
};

/** ---------- Balance as-of helpers ---------- */
function endingBalanceCashAsOf(entries: JournalEntry[], endExclusive: Date) {
  let bal = 0;
  for (const e of entries) {
    const dt = new Date(e.transactionDate);
    if (dt >= endExclusive || (e.status || '').toUpperCase() !== 'POSTED') continue;
    for (const l of e.journalEntryLines || []) {
      const a = l.chartOfAccount;
      if (!a || !isCashLike(a.accountName)) continue;
      bal += num(l.debitAmount) - num(l.creditAmount);
    }
  }
  return bal;
}
function endingARAsOf(entries: JournalEntry[], endExclusive: Date) {
  let bal = 0;
  for (const e of entries) {
    const dt = new Date(e.transactionDate);
    if (dt >= endExclusive || (e.status || '').toUpperCase() !== 'POSTED') continue;
    for (const l of e.journalEntryLines || []) {
      const a = l.chartOfAccount;
      if (!a || !isAR(a)) continue;
      bal += num(l.debitAmount) - num(l.creditAmount);
    }
  }
  return bal;
}
function endingAPAsOf(entries: JournalEntry[], endExclusive: Date) {
  let bal = 0;
  for (const e of entries) {
    const dt = new Date(e.transactionDate);
    if (dt >= endExclusive || (e.status || '').toUpperCase() !== 'POSTED') continue;
    for (const l of e.journalEntryLines || []) {
      const a = l.chartOfAccount;
      if (!a || !isAP(a)) continue;
      bal += num(l.creditAmount) - num(l.debitAmount);
    }
  }
  return bal;
}

/** ---------- Flows inside [start,end) ---------- */
function flows(
  entries: JournalEntry[],
  basis: Basis,
  start: Date,
  end: Date,
  labelFn: (iso: string) => string | null
) {
  const inWin = (iso: string) => {
    const d = new Date(iso);
    return d >= start && d < end;
  };

  const revMap = new Map<string, AccountSummary>();
  const expMap = new Map<string, AccountSummary>();
  const series: Record<string, { revenue: number; expense: number }> = {};

  const ensure = (k: string) => {
    if (!series[k]) series[k] = { revenue: 0, expense: 0 };
  };

  for (const e of entries) {
    if ((e.status || '').toUpperCase() !== 'POSTED') continue;
    if (!inWin(e.transactionDate)) continue;

    const label = labelFn(e.transactionDate);
    if (!label) continue;
    ensure(label);

    for (const l of e.journalEntryLines || []) {
      const a = l.chartOfAccount;
      if (!a) continue;

      const debit = num(l.debitAmount);
      const credit = num(l.creditAmount);

      // Only P&L lines go to revenue/expense
      if (isRevenue(a) && !isVAT(a)) {
        if (basis === 'accrual') {
          const rev = Math.max(0, credit - debit);
          if (rev > 0) {
            series[label].revenue += rev;
            bump(revMap, a.id || 'rev', { accountName: a.accountName, accountNo: a.accountNo, accountType: 'Revenue' }, debit, credit, rev);
          }
        } else {
          // cash basis requires payment on the P&L line
          if ((l as any).paymentMethod && credit > 0) {
            series[label].revenue += credit;
            bump(revMap, a.id || 'rev_cash', { accountName: a.accountName, accountNo: a.accountNo, accountType: 'Revenue' }, debit, credit, credit);
          }
        }
      }

      if (isExpense(a) && !isVAT(a)) {
        if (basis === 'accrual') {
          const exp = Math.max(0, debit - credit);
          if (exp > 0) {
            series[label].expense += exp;
            bump(expMap, a.id || 'exp', { accountName: a.accountName, accountNo: a.accountNo, accountType: 'Expense' }, debit, credit, exp);
          }
        } else {
          if ((l as any).paymentMethod && debit > 0) {
            series[label].expense += debit;
            bump(expMap, a.id || 'exp_cash', { accountName: a.accountName, accountNo: a.accountNo, accountType: 'Expense' }, debit, credit, debit);
          }
        }
      }
    }
  }

  const revenues = Array.from(revMap.values());
  const expenses = Array.from(expMap.values());
  const totalRevenue = revenues.reduce((s, r) => s + r.balance, 0);
  const totalExpense = expenses.reduce((s, x) => s + x.balance, 0);
  const netProfit = totalRevenue - totalExpense;

  return { revenues, expenses, totalRevenue, totalExpense, netProfit, series };
}

/** ---------- MAIN ---------- */
export function processDashboardData(
  entriesIn: JournalEntry[],
  basis: Basis,
  compareRange: ComparisonRange
): DashboardMetrics {
  // Guard against mixed currencies (do not sum apples+oranges)
  const posted = entriesIn.filter((e) => (e.status || '').toUpperCase() === 'POSTED');
  const currencySet = new Set(posted.map((e) => (e.currency?.code || '').toUpperCase()).filter(Boolean));
  if (currencySet.size > 1) {
    // If you hit this, filter to a single currency before calling this fn.
    // For safety, keep only the first currency we see.
    const first = Array.from(currencySet)[0];
    entriesIn = posted.filter((e) => (e.currency?.code || '').toUpperCase() === first);
  } else {
    entriesIn = posted;
  }

  const now = new Date();
  const { cs, ce, ps, pe, labelFn } = buildWindows(compareRange, now);

  // P&L flows in current/prev windows
  const cur = flows(entriesIn, basis, cs, ce, labelFn);
  const prv = flows(entriesIn, basis, ps, pe, labelFn);

  // Ending balances as-of end of window (Balance Sheet)
  const cashEndCur = endingBalanceCashAsOf(entriesIn, ce);
  const cashEndPrv = endingBalanceCashAsOf(entriesIn, pe);
  const arEndCur = endingARAsOf(entriesIn, ce);
  const apEndCur = endingAPAsOf(entriesIn, ce);

  // Build chart from CURRENT window series only
  const keys = Object.keys(cur.series).sort();
  const monthlyData = keys.map((k) => ({
    month: k,
    revenue: cur.series[k].revenue,
    expense: cur.series[k].expense,
    profit: cur.series[k].revenue - cur.series[k].expense,
  }));

  // % deltas (flows vs flows; ending cash vs ending cash)
  const revenueChange = pct(cur.totalRevenue, prv.totalRevenue);
  const expenseChange = pct(cur.totalExpense, prv.totalExpense);
  const profitChange = pct(cur.netProfit, prv.netProfit);
  const cashChange = pct(cashEndCur, cashEndPrv);

  return {
    revenues: cur.revenues,
    expenses: cur.expenses,
    totalRevenue: cur.totalRevenue,
    totalExpense: cur.totalExpense,
    netProfit: cur.netProfit,

    // BALANCE SHEET KPIs (as-of)
    cashBalance: cashEndCur,
    receivables: arEndCur,
    payables: apEndCur,

    monthlyData,
    changes: {
      revenue: Number.isFinite(revenueChange) ? revenueChange : 0,
      expense: Number.isFinite(expenseChange) ? -expenseChange : 0, // UI convention
      profit: Number.isFinite(profitChange) ? profitChange : 0,
      cash: Number.isFinite(cashChange) ? cashChange : 0,
    },
  };
}
