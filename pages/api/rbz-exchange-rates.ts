'use server';

import { API_BASE_URL } from "@/lib/constants";

export type FormattedExchangeRate = {
  currency: string;
  mid_rate: number | string;
  pair: number | string;
  we_buy: number | string;
  we_sell: number | string;
};

export type FinalExchangeRateResponse = {
  status: string;
  date: string; // formatted DD-MM-YYYY
  date_iso : string;
  source: "Infrastructure Development Bank of Zimbabwe(IDBZ)";
  url: string;
  exchange_rates: FormattedExchangeRate[];
};



function formatDateToDDMMYYYY(dateString: string): string {
  const dateObj = new Date(dateString);
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${day}-${month}-${year}`;
}

export async function fetchRbzExchangeRates(): Promise<{
  success: boolean;
  data?: FinalExchangeRateResponse;
  error?: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/rbz/exchange-rates`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const json = await response.json();

    if (!Array.isArray(json.exchange_rates)) {
      throw new Error('Invalid exchange_rates structure');
    }

    // Format data
    const formatted: FormattedExchangeRate[] = [
      {
        currency: "CURRENCY",
        mid_rate: "MID_RATE",
        pair: "PAIR",
        we_buy: "WE_BUY",
        we_sell: "WE_SELL",
      },
      ...json.exchange_rates.map((rate: any) => ({
        currency: rate.currency,
        mid_rate: rate.mid_rate,
        pair: rate.pair,
        we_buy: rate.we_buy,
        we_sell: rate.we_sell,
      })),
    ];

    const finalData: FinalExchangeRateResponse = {
      status: json.status,
      source: json.source,
      url: json.url,
      date: formatDateToDDMMYYYY(json.date),
      date_iso: json.date,
      exchange_rates: formatted,
    };

    return { success: true, data: finalData };
  } catch (error: any) {
    console.error("Error fetching RBZ exchange rates:", error);
    return {
      success: false,
      error: error.message || "An unknown error occurred",
    };
  }
}
