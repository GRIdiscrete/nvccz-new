'use client';

import { Basis, CurrencyChoice, ComparisonRange } from './types';

export function Controls({
  basis, setBasis, currencyChoice, setCurrencyChoice,
  compareRange, setCompareRange,
}: {
  basis: Basis; setBasis: (b: Basis) => void;
  currencyChoice: CurrencyChoice; setCurrencyChoice: (c: CurrencyChoice) => void;
  compareRange: ComparisonRange; setCompareRange: (c: ComparisonRange) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Currency */}
      <div className="inline-flex overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {(['ALL', 'ZWL', 'USD'] as CurrencyChoice[]).map((c) => (
          <button
            key={c}
            onClick={() => setCurrencyChoice(c)}
            className={`px-3 py-2 text-xs font-medium ${
              currencyChoice === c ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Basis */}
      <div className="inline-flex overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {(['accrual', 'cash'] as Basis[]).map((b) => (
          <button
            key={b}
            onClick={() => setBasis(b)}
            className={`px-3 py-2 text-xs font-medium capitalize ${
              basis === b ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            {b}
          </button>
        ))}
      </div>

      {/* Comparison range */}
      <div className="inline-flex overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {(['week', 'month', 'quarter', 'year'] as ComparisonRange[]).map((c) => (
          <button
            key={c}
            onClick={() => setCompareRange(c)}
            className={`px-3 py-2 text-xs font-medium capitalize ${
              compareRange === c ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
