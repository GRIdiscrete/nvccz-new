'use client';

import dynamic from 'next/dynamic';
import { ApexSeries } from './types';
import { formatMonthLabel } from './format';

const Chart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-sm text-slate-500">Loading chart…</div>,
}) as any;

type ApexOptions = any;

export function MonthlyTrendsChart({
  monthlyData,
  formatCurrency,
  formatShortCurrency,
}: {
  monthlyData: { month: string; revenue: number; expense: number; profit: number }[];
  formatCurrency: (n: number) => string;
  formatShortCurrency: (n: number) => string;
}) {
  const series: ApexSeries = [
    { name: 'Revenue', data: monthlyData.map((d) => d.revenue) },
    { name: 'Expenses', data: monthlyData.map((d) => d.expense) },
    { name: 'Profit', data: monthlyData.map((d) => d.profit) },
  ];

  const options: ApexOptions = {
    chart: { type: 'area', stacked: false, toolbar: { show: false }, animations: { enabled: true, easing: 'linear', dynamicAnimation: { speed: 900 } } },
    colors: ['#10B981', '#EF4444', '#3B82F6'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    grid: { strokeDashArray: 4 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 0.2, opacityFrom: 0.35, opacityTo: 0.05, stops: [0, 80, 100] } },
    xaxis: { categories: monthlyData.map((d) => d.month), labels: { formatter: (v: string) => formatMonthLabel(v) } },
    yaxis: { labels: { formatter: (v: number) => formatShortCurrency(v) } },
    tooltip: { y: { formatter: (v: number) => formatCurrency(v) } },
    responsive: [{ breakpoint: 640, options: { chart: { width: '100%' } } }],
  };

  return (
    <div className="h-80">
      {monthlyData.length ? (
        <Chart options={options} series={series} type="area" height="100%" width="100%" />
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-slate-500">No monthly data available</div>
      )}
    </div>
  );
}
