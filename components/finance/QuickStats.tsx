'use client';

export function QuickStats({
  receivables,
  payables,
  totalRevenue,
  totalExpense,
  netProfit,
  formatCurrency,
}: {
  receivables: number;
  payables: number;
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
  formatCurrency: (n: number) => string;
}) {
  const safeDiv = (num: number, den: number) => (den > 0 ? (num / den) * 100 : 0);
  const profitMargin = safeDiv(netProfit, totalRevenue).toFixed(1);
  const expenseRatio = safeDiv(totalExpense, totalRevenue).toFixed(1);

  // AR: debit-nature. Positive => customers owe you. Negative => credit balance (e.g., prepayments/over-collections).
  const arPositive = receivables >= 0;
  const arLabel = arPositive ? 'Owed to you' : 'Credit balance';
  const arAmount = formatCurrency(Math.abs(receivables));

  // AP: credit-nature. Positive => you owe suppliers. Negative => overpayment (debit balance).
  const apPositive = payables >= 0;
  const apLabel = apPositive ? 'You owe' : 'Overpayment';
  const apAmount = formatCurrency(Math.abs(payables));

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white/70 p-4 shadow">
      <h2 className="mb-4 text-lg font-semibold text-slate-800">Quick Stats</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Accounts Receivable */}
        <div className={`rounded-xl border ${arPositive ? 'border-sky-200 bg-sky-50' : 'border-amber-200 bg-amber-50'} p-4`}>
          <p className={`text-sm font-medium ${arPositive ? 'text-sky-700' : 'text-amber-700'}`}>Accounts Receivable</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{arAmount}</p>
          <p className={`mt-1 text-xs ${arPositive ? 'text-sky-600' : 'text-amber-700'}`}>{arLabel}</p>
        </div>

        {/* Accounts Payable */}
        <div className={`rounded-xl border ${apPositive ? 'border-violet-200 bg-violet-50' : 'border-emerald-200 bg-emerald-50'} p-4`}>
          <p className={`text-sm font-medium ${apPositive ? 'text-violet-700' : 'text-emerald-700'}`}>Accounts Payable</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{apAmount}</p>
          <p className={`mt-1 text-xs ${apPositive ? 'text-violet-600' : 'text-emerald-700'}`}>{apLabel}</p>
        </div>

        {/* Profit Margin */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-medium text-emerald-700">Profit Margin</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{profitMargin}%</p>
          <p className="mt-1 text-xs text-emerald-600">Net profit / Revenue</p>
        </div>

        {/* Expense Ratio */}
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
          <p className="text-sm font-medium text-orange-700">Expense Ratio</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{expenseRatio}%</p>
          <p className="mt-1 text-xs text-orange-600">Expenses / Revenue</p>
        </div>
      </div>
    </div>
  );
}
