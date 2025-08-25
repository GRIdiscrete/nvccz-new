'use client';

export function QuickStats({
  receivables, payables, totalRevenue, totalExpense, netProfit, formatCurrency,
}: {
  receivables: number; payables: number; totalRevenue: number; totalExpense: number; netProfit: number;
  formatCurrency: (n: number) => string;
}) {
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';
  const expenseRatio = totalRevenue > 0 ? ((totalExpense / totalRevenue) * 100).toFixed(1) : '0';

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white/70 p-4 shadow">
      <h2 className="mb-4 text-lg font-semibold text-slate-800">Quick Stats</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
          <p className="text-sm font-medium text-sky-700">Accounts Receivable</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{formatCurrency(receivables)}</p>
          <p className="mt-1 text-xs text-sky-600">Total outstanding</p>
        </div>
        <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
          <p className="text-sm font-medium text-violet-700">Accounts Payable</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{formatCurrency(payables)}</p>
          <p className="mt-1 text-xs text-violet-600">Total outstanding</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-medium text-emerald-700">Profit Margin</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{profitMargin}%</p>
          <p className="mt-1 text-xs text-emerald-600">Net profit / Revenue</p>
        </div>
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
          <p className="text-sm font-medium text-orange-700">Expense Ratio</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{expenseRatio}%</p>
          <p className="mt-1 text-xs text-orange-600">Expenses / Revenue</p>
        </div>
      </div>
    </div>
  );
}
