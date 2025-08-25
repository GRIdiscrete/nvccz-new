'use client';

import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-sm text-slate-500">Loading chart…</div>,
}) as any;

type ApexOptions = any;

export function DonutCard({
  title,
  labels,
  series,
  totalLabel,
  totalValueText,
  colors,
}: {
  title: string;
  labels: string[];
  series: number[];
  totalLabel: string;
  totalValueText: string;
  colors: string[];
}) {
  const donutCommon: Partial<ApexOptions> = {
    dataLabels: { enabled: true },
    legend: { position: 'bottom' },
    plotOptions: {
      pie: {
        donut: {
          size: '68%',
          labels: { show: true, total: { show: true, label: totalLabel, formatter: () => totalValueText } },
        },
      },
    },
    chart: { type: 'donut', animations: { enabled: true, easing: 'easeinout', dynamicAnimation: { speed: 700 } }, toolbar: { show: false } },
  };

  const options: ApexOptions = { ...donutCommon, labels, colors };

  return (
    <div className="group rounded-2xl border border-slate-200/60 bg-white/70 p-4 shadow">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-800">{title}</h2>
      <div className="h-80">
        {series.length ? (
          <Chart options={options} series={series} type="donut" height="100%" width="100%" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">No data available</div>
        )}
      </div>
    </div>
  );
}
