'use client';

import { motion } from 'framer-motion';
import { Basis, CurrencyChoice, ComparisonRange } from './types';

const ACCENT = '#18c4d8';
const ACCENT_DARK = '#0fa3b6';
const ACCENT_DARKER = '#0b8392';
const ACCENT_SOFT_BG = 'rgba(24,196,216,0.10)';
const ACCENT_SOFT_BORDER = 'rgba(24,196,216,0.35)';

type Opt<T extends string> = { label: string; value: T };

function SegGroup<T extends string>({
  label, value, onChange, options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: Opt<T>[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <div
        className="relative inline-flex items-center gap-1 rounded-xl border bg-white/80 p-1 shadow-sm"
        style={{ borderColor: `${ACCENT}22` }}
      >
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className="relative min-w-[86px] rounded-lg px-3 py-1.5 text-sm font-medium outline-none transition"
              style={{ color: active ? ACCENT_DARKER : '#334155' }}
            >
              {active && (
                <motion.span
                  layoutId="seg-active"
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: ACCENT_SOFT_BG,
                    border: `1px solid ${ACCENT_SOFT_BORDER}`,
                    boxShadow: `inset 0 0 0 1px ${ACCENT}26`,
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Controls({
  basis, setBasis, currencyChoice, setCurrencyChoice,
  compareRange, setCompareRange,
}: {
  basis: Basis; setBasis: (b: Basis) => void;
  currencyChoice: CurrencyChoice; setCurrencyChoice: (c: CurrencyChoice) => void;
  compareRange: ComparisonRange; setCompareRange: (c: ComparisonRange) => void;
}) {
  const currencyOpts: Opt<CurrencyChoice>[] = [
    { label: 'ZWL', value: 'ZWL' },
    { label: 'USD', value: 'USD' },
  ];

  const basisOpts: Opt<Basis>[] = [
    { label: 'Accrual', value: 'accrual' },
    { label: 'Cash', value: 'cash' },
  ];

  const rangeOpts: Opt<ComparisonRange>[] = [
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
    { label: 'Quarter', value: 'quarter' },
    { label: 'Year', value: 'year' },
  ];

  return (
    <div className="flex flex-wrap items-end gap-3">
      <SegGroup
        label="Currency"
        value={currencyChoice}
        onChange={setCurrencyChoice}
        options={currencyOpts}
      />
      <SegGroup
        label="Accounting basis"
        value={basis}
        onChange={setBasis}
        options={basisOpts}
      />
      <SegGroup
        label="Period"
        value={compareRange}
        onChange={setCompareRange}
        options={rangeOpts}
      />
      <div
        className="hidden h-[2px] w-full rounded-full sm:block"
        style={{ background: `linear-gradient(90deg, ${ACCENT}33, ${ACCENT_DARK}66, ${ACCENT}33)` }}
      />
    </div>
  );
}
