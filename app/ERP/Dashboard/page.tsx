'use client';

import { useEffect, useMemo, useState } from 'react';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiCreditCard, FiActivity, FiPieChart } from 'react-icons/fi';


import { Controls } from '@/components/finance/Controls';

import { MonthlyTrendsChart } from '@/components/finance/MonthlyTrendsChart';
import { QuickStats } from '@/components/finance/QuickStats';

import { Basis, CurrencyChoice, ComparisonRange, JournalEntry } from '@/components/finance/types';
import { processDashboardData } from '@/components/finance/processDashboardData';
import { formatCurrencyFactory, formatShort } from '@/components/finance/format';

import { DonutCard } from '@/components/finance/DonutChart';
import { KpiCard } from '@/components/finance/KpiCard';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  const [basis, setBasis] = useState<Basis>('accrual');
  const [currencyChoice, setCurrencyChoice] = useState<CurrencyChoice>('ALL');
  const [compareRange, setCompareRange] = useState<ComparisonRange>('month');
  const [displayCurrency, setDisplayCurrency] = useState<string>('USD');

  // Fetch once
  useEffect(() => {
    (async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const response = await fetch('https://nvccz-pi.vercel.app/api/accounting/journal-entries', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch journal entries');

        const body = await response.json();
        if (!body.success) throw new Error(body.message || 'Failed to retrieve journal entries');

        const data: JournalEntry[] = body.data || [];
        setEntries(data);

        const first = data.find((e) => e.currency?.code)?.currency?.code;
        setDisplayCurrency(first || 'USD');
      } catch (err: any) {
        setError(err?.message || 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filter by currency
  const filtered = useMemo(() => {
    if (currencyChoice === 'ALL') return entries;
    return entries.filter((e) => (e.currency?.code || '').toUpperCase() === currencyChoice);
  }, [entries, currencyChoice]);

  useEffect(() => {
    setDisplayCurrency(currencyChoice === 'ALL' ? (filtered[0]?.currency?.code || 'USD') : currencyChoice);
  }, [filtered, currencyChoice]);

  // Compute metrics with selected comparison range
  const metrics = useMemo(() => processDashboardData(filtered, basis, compareRange), [filtered, basis, compareRange]);

  const formatCurrency = useMemo(() => formatCurrencyFactory(displayCurrency), [displayCurrency]);
  const formatShortCurrency = useMemo(() => formatShort(formatCurrency), [formatCurrency]);

  const subtitle = `vs last ${compareRange}`;

  // ---- Loading / Error -----------------------------------------------------
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-4 p-6">
        <div className="h-9 w-64 animate-pulse rounded-lg bg-slate-200/70" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/70 ring-1 ring-slate-200/60" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-96 animate-pulse rounded-2xl bg-white/70 ring-1 ring-slate-200/60" />
          <div className="h-96 animate-pulse rounded-2xl bg-white/70 ring-1 ring-slate-200/60" />
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 shadow-sm">
          <p className="text-sm font-semibold">Error</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const revenueSeries = metrics.revenues.map((r) => Math.max(0, r.balance));
  const expenseSeries = metrics.expenses.map((e) => Math.max(0, e.balance));

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">Financial Dashboard</h1>
          <p className="text-sm text-slate-500">Overview of your financial performance ({basis} basis)</p>
        </div>
        <Controls
          basis={basis}
          setBasis={setBasis}
          currencyChoice={currencyChoice}
          setCurrencyChoice={setCurrencyChoice}
          compareRange={compareRange}
          setCompareRange={setCompareRange}
        />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Revenue" value={formatCurrency(metrics.totalRevenue)} change={metrics.changes.revenue} icon={<FiTrendingUp className="h-5 w-5" />} subtitle={subtitle} />
        <KpiCard title="Total Expenses" value={formatCurrency(metrics.totalExpense)} change={metrics.changes.expense} icon={<FiTrendingDown className="h-5 w-5" />} subtitle={subtitle} />
        <KpiCard title="Net Profit" value={formatCurrency(metrics.netProfit)} change={metrics.changes.profit} icon={<FiDollarSign className="h-5 w-5" />} subtitle={subtitle} />
        <KpiCard title="Cash Balance" value={formatCurrency(metrics.cashBalance)} change={metrics.changes.cash} icon={<FiCreditCard className="h-5 w-5" />} subtitle={subtitle} />
      </div>

      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="group rounded-2xl border border-slate-200/60 bg-white/70 p-4 shadow">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
              <FiActivity className="h-5 w-5 text-indigo-600" /> Monthly Trends
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Revenue</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" />Expenses</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-sky-500" />Profit</span>
            </div>
          </div>
          <MonthlyTrendsChart
            monthlyData={metrics.monthlyData}
            formatCurrency={formatCurrency}
            formatShortCurrency={formatShortCurrency}
          />
        </div>

        <DonutCard
          title={<><FiPieChart className="h-5 w-5 text-emerald-600" /> Revenue by Category</> as any}
          labels={metrics.revenues.map((r) => r.accountName)}
          series={revenueSeries}
          totalLabel="Revenue"
          totalValueText={formatCurrency(metrics.totalRevenue)}
          colors={['#10B981', '#22D3EE', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899']}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DonutCard
          title={<><FiPieChart className="h-5 w-5 text-rose-600" /> Expenses by Category</> as any}
          labels={metrics.expenses.map((e) => e.accountName)}
          series={expenseSeries}
          totalLabel="Expenses"
          totalValueText={formatCurrency(metrics.totalExpense)}
          colors={['#EF4444', '#F97316', '#F59E0B', '#84CC16', '#14B8A6', '#06B6D4']}
        />
        <QuickStats
          receivables={metrics.receivables}
          payables={metrics.payables}
          totalRevenue={metrics.totalRevenue}
          totalExpense={metrics.totalExpense}
          netProfit={metrics.netProfit}
          formatCurrency={formatCurrency}
        />
      </div>
    </div>
  );
};

export default Dashboard;
