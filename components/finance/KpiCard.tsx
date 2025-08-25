'use client';

import { motion } from 'framer-motion';
import { FiTrendingDown, FiTrendingUp } from 'react-icons/fi';

export const TrendPill = ({ change }: { change: number }) => {
  const positive = change >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
        positive ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                 : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
      }`}
    >
      {positive ? <FiTrendingUp className="h-3.5 w-3.5" /> : <FiTrendingDown className="h-3.5 w-3.5" />}
      {Math.abs(change).toFixed(1)}%
    </span>
  );
};

export const KpiCard = ({
  title, value, change, icon, subtitle = 'vs last period',
}: {
  title: string; value: string; change: number; icon: React.ReactNode; subtitle?: string;
}) => {
  const positive = change >= 0;
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02, boxShadow: '0 12px 40px rgba(2,6,23,0.12)' }}
      transition={{ type: 'spring', stiffness: 220, damping: 18 }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white/70 p-4 shadow"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium tracking-wide text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
        </div>
        <span
          className={`grid h-10 w-10 place-items-center rounded-xl border ${
            positive ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                     : 'border-rose-200 bg-rose-50 text-rose-600'
          }`}
        >
          {icon}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
        <TrendPill change={change} />
        <span>{subtitle}</span>
      </div>
    </motion.div>
  );
};
