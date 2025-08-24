"use client";

import React, { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import {
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Newspaper,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { FeedItem, BankRatesResponse } from "@/types.db";
import { FeedCard } from "@/components/rss-feeds/FeedCard";
import { isFinancialOrEconomic } from "@/utils/feedUtils";
import ZimFinancialData from "@/components/MenuAllFinancialData";
import WeatherCard from "@/components/rss-feeds/sidebar/WeatherCard";
import HeroClient from "../HeroClient";

// ---------------------------------------------------------------------------
// Fetcher & SWR config
const fetcher = async (url: string) => fetch(url).then((res) => res.json());
const swrCfg = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateIfStale: false,
} as const;

// ---------------------------------------------------------------------------
// Small utils
const uid = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

// ---------------------------------------------------------------------------
// Widgets
const CombinedRateCard = ({
  cryptoData,
  forexData,
  cryptoLoading,
  forexLoading,
  compact = true, // compact by default
}: {
  cryptoData: any[];
  forexData: any[];
  cryptoLoading: boolean;
  forexLoading: boolean;
  compact?: boolean;
}) => {
  const [currentView, setCurrentView] = useState<"crypto" | "forex">("crypto");
  const switchView = (v: "crypto" | "forex") => v !== currentView && setCurrentView(v);
  const getCurrentTitle = () => (currentView === "crypto" ? "Cryptocurrency" : "Forex Rates");
  const loading = currentView === "crypto" ? cryptoLoading : forexLoading;
  const fullList = currentView === "crypto" ? cryptoData : forexData;
  const list = compact ? fullList.slice(0, 8) : fullList;

  return (
    <div
      className={
        // Fills its grid cell
        "h-full min-h-0 flex flex-col " +
        "group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 shadow-sm " +
        "backdrop-blur supports-[backdrop-filter]:bg-white/60 transition-all duration-300 hover:shadow-md " +
        (compact ? "p-3" : "p-4")
      }
    >
      {/* Header */}
      <div className="relative mb-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-slate-900 text-white shadow-sm">
            <DollarSign size={14} />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{getCurrentTitle()}</h3>
            <p className="text-xs text-slate-500">Live market rates</p>
          </div>
          {loading && (
            <span className="ml-2 inline-block align-middle">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-b-2 border-t-2 border-slate-400" />
            </span>
          )}
        </div>
        <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-0.5 text-xs shadow-xs">
          <button
            onClick={() => switchView("crypto")}
            className={`rounded-md px-2.5 py-1.5 transition-colors ${
              currentView === "crypto" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
            aria-label="Show crypto"
          >
            Crypto
          </button>
          <button
            onClick={() => switchView("forex")}
            className={`rounded-md px-2.5 py-1.5 transition-colors ${
              currentView === "forex" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
            aria-label="Show forex"
          >
            Forex
          </button>
        </div>
      </div>

      {/* List fills remaining height; scrolls if needed */}
      <div className={"flex-1 min-h-0 overflow-auto rounded-xl border border-slate-200 bg-white " + (compact ? "p-1.5" : "p-2")}>
        <ul className="divide-y divide-slate-200">
          {list.map((item: any) => (
            <li
              key={currentView === "crypto" ? `crypto-${item.symbol}` : `forex-${item.pair}`}
              className={
                "flex items-center justify-between gap-2 rounded-lg px-2 transition-colors hover:bg-slate-50 " +
                (compact ? "min-h-[36px] py-1.5" : "min-h-[42px] py-2")
              }
            >
              <div className="min-w-0 flex-1">
                <p className={"truncate font-medium text-slate-900 " + (compact ? "text-[13px]" : "text-sm")}>
                  {currentView === "crypto" ? item.symbol : item.pair}
                </p>
              </div>
              <div className="flex min-w-0 items-center gap-2">
                <span className={"min-w-0 truncate text-right font-semibold text-slate-900 " + (compact ? "text-[13px]" : "text-sm")}>
                  {currentView === "crypto" ? item.price : item.rate}
                </span>
                <span
                  className={
                    "inline-flex min-w-0 items-center truncate rounded-full px-2 font-medium " +
                    (compact ? "py-0.5 text-[10.5px]" : "py-0.5 text-[11px]") +
                    " " +
                    (item.trend === "up"
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
                      : item.trend === "down"
                      ? "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200"
                      : "text-slate-600 bg-slate-50 ring-1 ring-inset ring-slate-200")
                  }
                >
                  {item.trend === "up" ? (
                    <TrendingUp className={"mr-1 flex-shrink-0 " + (compact ? "h-3 w-3" : "h-3.5 w-3.5")} />
                  ) : item.trend === "down" ? (
                    <TrendingDown className={"mr-1 flex-shrink-0 " + (compact ? "h-3 w-3" : "h-3.5 w-3.5")} />
                  ) : null}
                  <span className="truncate">{item.change}</span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer controls */}
      <div className="relative mt-3 flex items-center justify-between shrink-0">
        <button
          onClick={() => switchView(currentView === "crypto" ? "forex" : "crypto")}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 shadow-sm transition-colors hover:bg-slate-50"
        >
          {currentView === "crypto" ? "View Forex" : "View Crypto"}
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={() => switchView("crypto")}
            className="rounded-full border border-slate-200 bg-white p-1.5 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            aria-label="Crypto"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => switchView("forex")}
            className="rounded-full border border-slate-200 bg-white p-1.5 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            aria-label="Forex"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Layout helpers (module scope)
function useGridColumns() {
  const [cols, setCols] = useState(8); // default lg
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mqMd = window.matchMedia("(min-width: 768px)");
    const mqLg = window.matchMedia("(min-width: 1024px)");
    const update = () => {
      if (mqLg.matches) setCols(8);
      else if (mqMd.matches) setCols(6);
      else setCols(2);
    };
    update();
    mqMd.addEventListener("change", update);
    mqLg.addEventListener("change", update);
    return () => {
      mqMd.removeEventListener("change", update);
      mqLg.removeEventListener("change", update);
    };
  }, []);
  return cols;
}

type FeedGridItem = { type: "feed"; key: string; feed: any; hasImage: boolean; variant?: "featured" };
type WidgetGridItem = { type: "widget"; key: string; render: () => React.ReactNode };
type GridItem = FeedGridItem | WidgetGridItem;
type LaidOutItem = (FeedGridItem | WidgetGridItem) & { colSpan: number; rowSpan: number; variant?: "featured" };

const isFeed = (it: GridItem): it is FeedGridItem => it.type === "feed";

/**
 * Layout:
 * - Featured feed: half-width, 3 rows
 * - Regular image feed: quarter-ish width, 2 rows (compact)
 * - Widgets: compact, 2 rows (and they fill height of their tile)
 */
function buildFeaturedLayout(items: GridItem[], cols: number): LaidOutItem[] {
  const half = Math.floor(cols / 2);
  const perQuarter = Math.max(1, Math.floor(cols / 4));
  const src: GridItem[] = [...items];
  const out: LaidOutItem[] = [];

  let colCursor = 0;
  let rowIndex = 0;

  while (src.length > 0) {
    if (colCursor === 0) {
      const isFeaturedRow = rowIndex % 2 === 1;
      if (isFeaturedRow) {
        const j = src.findIndex((it) => it.type === "feed");
        if (j !== -1) {
          const featured = src.splice(j, 1)[0] as FeedGridItem;
          const rowSpan = 3;
          out.push({ ...featured, colSpan: half, rowSpan, variant: "featured" });
          colCursor += half;
        }
      }
    }

    if (colCursor >= cols) {
      colCursor = 0;
      rowIndex++;
      continue;
    }

    const next = src.shift()!;
    const colSpan = Math.min(perQuarter, cols - colCursor);
    const rowSpan = isFeed(next) ? 2 : 2;

    out.push({ ...(next as any), colSpan, rowSpan });
    colCursor += colSpan;

    if (colCursor >= cols) {
      colCursor = 0;
      rowIndex++;
    }
  }

  return out;
}

// ---------------------------------------------------------------------------
// Page
const FeedPage = () => {
  const [mounted, setMounted] = useState(false);
  const cols = useGridColumns(); // called unconditionally at top

  const { data, error, isLoading: feedsLoading, mutate } = useSWR<{ items: FeedItem[] }>(
    mounted ? "/api/feeds" : null,
    fetcher,
    swrCfg
  );
  const { data: cryptoData, isLoading: cryptoLoading } = useSWR(
    mounted ? "/api/crypto" : null,
    fetcher,
    swrCfg
  );
  const { data: forexData, isLoading: forexLoading } = useSWR(
    mounted ? "/api/forex" : null,
    fetcher,
    swrCfg
  );
  useSWR<BankRatesResponse>(mounted ? "/api/bankRates" : null, fetcher, swrCfg);

  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => setMounted(true), []);

  const feedsData = data?.items || [];

  // Combine African + International (no region filter). Keep financial/economic only. Require image.
  const allFiltered = useMemo(
    () =>
      feedsData.filter((feed) => {
        if (!isFinancialOrEconomic(feed)) return false;
        const hasImage =
          feed.imageUrl ||
          (feed.enclosure &&
            feed.enclosure.url &&
            (!feed.enclosure.type || feed.enclosure.type.startsWith("image/")));
        if (!hasImage) return false;
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (
          feed.title.toLowerCase().includes(q) ||
          feed.contentSnippet?.toLowerCase().includes(q)
        );
      }),
    [feedsData, searchTerm]
  );

  const refresh = async () => {
    await mutate();
  };

  const getRatesData = () => {
    let forexRates = [
      { pair: "USD/ZWL", rate: "24,500", change: "+0.8%", trend: "up" },
      { pair: "USD/GBP", rate: "1.2680", change: "-0.3%", trend: "down" },
      { pair: "USD/EUR", rate: "1.0925", change: "+0.1%", trend: "up" },
    ];
    if (forexData && (forexData as any).success && (forexData as any).data) {
      forexRates = (forexData as any).data;
    } else if (Array.isArray(forexData)) {
      forexRates = forexData as any;
    }

    return {
      crypto:
        (Array.isArray(cryptoData) && cryptoData) || [
          { symbol: "BTC", price: "$43,250", change: "+2.4%", trend: "up" },
          { symbol: "ETH", price: "$2,580", change: "-1.2%", trend: "down" },
          { symbol: "BNB", price: "$315", change: "+0.8%", trend: "up" },
          { symbol: "ADA", price: "$0.52", change: "+3.1%", trend: "up" },
        ],
      forex: forexRates,
    };
  };

  if (!mounted) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-sky-500" />
      </div>
    );
  }

  if (feedsLoading) {
    return (
      <div className="mx-auto max-w-7xl p-4">
        <div className="mb-4 h-10 w-64 animate-pulse rounded-lg bg-slate-100" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-slate-50" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl p-4">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          Error loading feeds: {(error as any).message}
        </div>
      </div>
    );
  }

  const rates = getRatesData();

  // Build items (no hooks here). Keep only image feeds (already filtered).
  const imageFeeds = allFiltered.slice(0, visibleCount);

  const feedItems: FeedGridItem[] = imageFeeds.map((feed) => ({
    type: "feed",
    key: `feed-${feed.guid || feed.link || uid()}`,
    feed,
    hasImage: true,
  }));

  // Insert widgets into the stream
  const withWidgets: GridItem[] = [...feedItems];
  const insert = (arr: GridItem[], idx: number, item: GridItem) => {
    if (idx < 0 || idx > arr.length) return;
    arr.splice(idx, 0, item);
  };

  insert(withWidgets, 3, {
    type: "widget",
    key: "widget-crypto",
    render: () => (
      <CombinedRateCard
        compact
        cryptoData={rates.crypto}
        forexData={rates.forex}
        cryptoLoading={cryptoLoading}
        forexLoading={forexLoading}
      />
    ),
  });

  insert(withWidgets, 10, {
    type: "widget",
    key: "widget-weather",
    render: () => <WeatherCard className="w-full h-full" />,
  });

  const layout = buildFeaturedLayout(withWidgets, cols);

  return (
    <div className="min-h-screen bg-white" data-feeds-container>
      <HeroClient />

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-slate-900 shadow-sm" />
              <div>
                <h1 className="text-base font-semibold tracking-tight text-slate-900">
                  Arcus Financial Feeds
                </h1>
                <p className="text-[11px] font-medium text-slate-500">Curated informatics • live rates</p>
              </div>
            </div>
            <button
              onClick={async () => {
                await mutate();
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm transition-colors hover:bg-slate-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* RBZ + Summary */}
      <section className="mx-auto max-w-7xl px-2 py-2 sm:px-3">
        <div className="mb-2">
          <ZimFinancialData />
        </div>
      </section>

      {/* Main Grid */}
      <main className="mx-auto max-w-7xl px-2 pb-6 sm:px-3">
        {/* Search only (filter removed) */}
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                type="text"
                placeholder="Search financial news…"
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-[border,box-shadow] focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Count */}
        <div className="mb-3">
          <h2 className="text-sm font-semibold tracking-tight text-slate-900">
            Latest News <span className="text-slate-500">({allFiltered.length} articles)</span>
          </h2>
        </div>

        {/* Grid */}
        {allFiltered.length > 0 && !feedsLoading && (
          <>
            <div
              className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-8 gap-4 auto-rows-[140px] md:auto-rows-[160px] lg:auto-rows-[180px]"
              style={{ gridAutoFlow: "dense" }}
            >
              {layout.map((item) => {
                const style: React.CSSProperties = {
                  gridColumn: `span ${item.colSpan} / span ${item.colSpan}`,
                  gridRow: `span ${item.rowSpan} / span ${item.rowSpan}`,
                };
                const isWidget = item.type === "widget";
                return (
                  <div
                    key={item.key}
                    style={style}
                    className={
                      isWidget
                        // Widget wrapper: no extra chrome, just ensure full height for the card inside
                        ? "relative h-full min-h-0"
                        // Feed wrapper: regular card chrome
                        : "group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
                    }
                  >
                    {item.type === "feed" ? (
                      <FeedCard
                        feed={item.feed}
                        size={item.variant === "featured" ? "large" : "medium"}
                      />
                    ) : (
                      // Widget content fills tile
                      <div className="h-full min-h-0">
                        {item.render()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Load more */}
            {visibleCount < allFiltered.length && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setVisibleCount((c) => c + 8)}
                  className="group relative overflow-hidden rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition-colors hover:bg-slate-50"
                >
                  Load more articles
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {allFiltered.length === 0 && !feedsLoading && (
          <div className="grid place-items-center rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-sm">
            <Newspaper className="mb-4 h-16 w-16 text-slate-400" />
            <h3 className="mb-2 text-xl font-medium text-slate-900">No image-based articles found</h3>
            <p className="mb-6 max-w-md text-slate-500">Try a different search.</p>
          </div>
        )}
      </main>

      {/* A11y / motion tweaks */}
      <style jsx global>{`
        .no-scrollbar {
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        @media (prefers-reduced-motion: reduce) {
          * {
            transition-duration: 0.01ms !important;
            animation-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
};

export default FeedPage;
