'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Building2, RefreshCw, AlertCircle, Percent, ArrowUpDown } from 'lucide-react';
import { fetchInflationRates, type InflationRatesResponse } from '@/pages/api/rbz-inflation-rates';
import { fetchRbzExchangeRates, type FinalExchangeRateResponse } from '@/pages/api/rbz-exchange-rates';

interface RBZBankRatesProps {
  className?: string;
}

// Local, strongly-typed shape used for rendering in this component
type ExchangeRow = {
  currency: string;
  bid: number | string | null | undefined;
  ask: number | string | null | undefined;
  avg: number | string | null | undefined;
};

const RBZBankRates: React.FC<RBZBankRatesProps> = ({ className = '' }) => {
  const [inflationData, setInflationData] = useState<InflationRatesResponse | null>(null);
  const [exchangeData, setExchangeData] = useState<FinalExchangeRateResponse | null>(null);
  const [normalizedRates, setNormalizedRates] = useState<ExchangeRow[]>([]);
  const [inflationLoading, setInflationLoading] = useState(true);
  const [exchangeLoading, setExchangeLoading] = useState(true);
  const [inflationError, setInflationError] = useState<string | null>(null);
  const [exchangeError, setExchangeError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // ---------- Helpers ----------
  const formatPercentage = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return `${value.toFixed(2)}%`;
  };

  const formatNumber = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return value.toLocaleString();
  };

  const formatExchangeValue = (value: number | string | null | undefined) => {
    if (value === null || value === undefined || value === '') return 'N/A';
    if (typeof value === 'string') {
      const n = Number.parseFloat(value);
      return Number.isFinite(n) ? n.toFixed(4) : value;
    }
    return value.toFixed(4);
  };

  // Normalize whatever the API gives us into { currency, bid, ask, avg }
  const normalizeExchangeRates = (rows: any[]): ExchangeRow[] => {
    if (!Array.isArray(rows)) return [];

    return rows
      // Drop header-like rows defensively
      .filter((r) => {
        const currency = r?.currency ?? r?.CURRENCY ?? r?.[0];
        const bid = r?.bid ?? r?.BID ?? r?.buy ?? r?.[1];
        return !(
          (typeof currency === 'string' && currency.toUpperCase() === 'CURRENCY') ||
          (typeof bid === 'string' && bid.toUpperCase() === 'BID')
        );
      })
      .map((r, idx): ExchangeRow => {
        const currency = r?.currency ?? r?.CURRENCY ?? r?.[0] ?? `CUR-${idx}`;
        const bid = r?.bid ?? r?.BID ?? r?.buy ?? r?.BUY ?? r?.[1] ?? null;
        const ask = r?.ask ?? r?.ASK ?? r?.sell ?? r?.SELL ?? r?.[2] ?? null;
        const avg = r?.avg ?? r?.AVG ?? r?.mid ?? r?.MID ?? r?.[3] ?? null;

        return { currency: String(currency), bid, ask, avg };
      });
  };

  // ---------- Data loaders ----------
  const loadInflationData = async () => {
    setInflationLoading(true);
    setInflationError(null);
    try {
      const result = await fetchInflationRates();
      if (result.success && result.data) {
        setInflationData(result.data);
      } else {
        const errorMsg = result.error || 'Failed to fetch inflation rates data';
        setInflationError(errorMsg);
      }
    } catch (err: any) {
      setInflationError(err?.message || 'An unexpected error occurred');
    } finally {
      setInflationLoading(false);
    }
  };

  const loadExchangeData = async () => {
    setExchangeLoading(true);
    setExchangeError(null);
    try {
      const result = await fetchRbzExchangeRates();
      if (result.success && result.data) {
        setExchangeData(result.data);
        setNormalizedRates(normalizeExchangeRates(result.data.exchange_rates));
      } else {
        const errorMsg = result.error || 'Failed to fetch exchange rates data';
        setExchangeError(errorMsg);
        // still try to normalize if any shape is present
        setNormalizedRates(normalizeExchangeRates(result?.data?.exchange_rates ?? []));
      }
    } catch (err: any) {
      setExchangeError(err?.message || 'An unexpected error occurred');
      setNormalizedRates([]);
    } finally {
      setExchangeLoading(false);
    }
  };

  const loadAllData = async () => {
    await Promise.all([loadInflationData(), loadExchangeData()]);
    setLastUpdated(new Date());
  };

  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadAllData, 10 * 60 * 1000); // refresh every 10 min
    return () => clearInterval(interval);
  }, []);

  const isLoading = inflationLoading || exchangeLoading;
  const hasErrors = Boolean(inflationError || exchangeError);

  // ---------- Render ----------
  if (isLoading) {
    return (
      <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 ${className}`}>
        <div className="flex items-center justify-center space-x-3">
          <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
          <span className="text-gray-300">Loading RBZ Bank Rates...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Building2 className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="text-lg font-semibold text-white">RBZ Bank Rates</h3>
            <p className="text-sm text-gray-400">Reserve Bank of Zimbabwe Data</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {lastUpdated && (
            <span className="text-xs text-gray-500">
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={loadAllData}
            disabled={isLoading}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm flex items-center space-x-2 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Inflation Rates Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3 border-b border-gray-700 pb-2">
            <Percent className="w-5 h-5 text-red-400" />
            <h4 className="text-lg font-semibold text-white">Inflation Rates</h4>
          </div>

          {inflationError ? (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <div>
                  <h5 className="text-sm font-medium text-red-300">Error Loading Inflation Data</h5>
                  <p className="text-xs text-red-400 mt-1">{inflationError}</p>
                </div>
              </div>
            </div>
          ) : !inflationData ? (
            <div className="text-center py-4">
              <div className="text-gray-400 text-sm">No inflation data available</div>
            </div>
          ) : (
            <div className="bg-gray-700/20 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-700/30 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">CPI Index</div>
                  <div className="text-xl font-bold text-white">
                    {formatNumber(inflationData.inflation_rates.cpi_index)}
                  </div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">MoM Change</div>
                  <div className="text-xl font-bold text-white">
                    {formatPercentage(inflationData.inflation_rates.mom_change)}
                  </div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">YoY Change</div>
                  <div className="text-xl font-bold text-white">
                    {formatPercentage(inflationData.inflation_rates.yoy_change)}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="text-left py-2 px-3 font-medium text-gray-300">Category</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-300">Month-on-Month</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-300">Year-on-Year</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-700/50">
                      <td className="py-3 px-3 text-white">Food</td>
                      <td className="text-right py-3 px-3 text-white">
                        {formatPercentage(inflationData.inflation_rates.food_mom)}
                      </td>
                      <td className="text-right py-3 px-3 text-white">
                        {formatPercentage(inflationData.inflation_rates.food_yoy)}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-700/50">
                      <td className="py-3 px-3 text-white">Non-Food</td>
                      <td className="text-right py-3 px-3 text-white">
                        {formatPercentage(inflationData.inflation_rates.non_food_mom)}
                      </td>
                      <td className="text-right py-3 px-3 text-white">
                        {formatPercentage(inflationData.inflation_rates.non_food_yoy)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                Date: {inflationData.date} • Source: {inflationData.source}
              </div>
            </div>
          )}
        </div>

        {/* Exchange Rates Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3 border-b border-gray-700 pb-2">
            <ArrowUpDown className="w-5 h-5 text-green-400" />
            <h4 className="text-lg font-semibold text-white">Exchange Rates</h4>
          </div>

          {exchangeError ? (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <div>
                  <h5 className="text-sm font-medium text-red-300">Error Loading Exchange Rates</h5>
                  <p className="text-xs text-red-400 mt-1">{exchangeError}</p>
                </div>
              </div>
            </div>
          ) : normalizedRates.length === 0 ? (
            <div className="text-center py-4">
              <div className="text-gray-400 text-sm">No exchange rates data available</div>
            </div>
          ) : (
            <div className="bg-gray-700/20 rounded-lg p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="text-left py-3 px-3 font-medium text-gray-300">Currency</th>
                      <th className="text-right py-3 px-3 font-medium text-gray-300">Bid</th>
                      <th className="text-right py-3 px-3 font-medium text-gray-300">Ask</th>
                      <th className="text-right py-3 px-3 font-medium text-gray-300">Average</th>
                    </tr>
                  </thead>
                  <tbody>
                    {normalizedRates.map((rate, index) => (
                      <tr
                        key={`${rate.currency}-${index}`}
                        className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors"
                      >
                        <td className="py-3 px-3 text-white">{rate.currency}</td>
                        <td className="text-right py-3 px-3 text-white">
                          {formatExchangeValue(rate.bid)}
                        </td>
                        <td className="text-right py-3 px-3 text-white">
                          {formatExchangeValue(rate.ask)}
                        </td>
                        <td className="text-right py-3 px-3 text-white">
                          {formatExchangeValue(rate.avg)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                Date: {exchangeData?.date ?? 'N/A'} • Source: {exchangeData?.source ?? 'N/A'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Error Display */}
      {hasErrors && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={loadAllData}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry All</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default RBZBankRates;
