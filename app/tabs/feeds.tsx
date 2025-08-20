"use client";

import React, { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import {
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Newspaper,
  Globe,
  Filter,
  RefreshCw,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// External components / utils from your codebase
import { FeedItem, BankRatesResponse } from "@/types.db";
import { FeedCard } from "@/components/rss-feeds/FeedCard";
import { categories, isFinancialOrEconomic, categorizeByRegion } from "@/utils/feedUtils";
import ZimFinancialData from "@/components/MenuAllFinancialData";
import WeatherCard from "@/components/rss-feeds/sidebar/WeatherCard";
import HeroClient from "../HeroClient";

// ---------------------------------------------------------------------------
// Fetcher
const fetcher = async (url: string) => fetch(url).then((res) => res.json());

// SWR config (avoid surprise revalidations that cause flicker)
const swrCfg = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateIfStale: false,
} as const;

// ---------------------------------------------------------------------------
// Combined Rate Card (refined look, less heavy; maintains structure)
const CombinedRateCard = ({
  cryptoData,
  forexData,
  cryptoLoading,
  forexLoading,
}: {
  cryptoData: any[];
  forexData: any[];
  cryptoLoading: boolean;
  forexLoading: boolean;
}) => {
  const [currentView, setCurrentView] = useState<"crypto" | "forex">("crypto");

  const switchView = (newView: "crypto" | "forex") => {
    if (newView !== currentView) setCurrentView(newView);
  };

  const getCurrentTitle = () => (currentView === "crypto" ? "Cryptocurrency" : "Forex Rates");
  const isCurrentlyLoading = () => (currentView === "crypto" ? cryptoLoading : forexLoading);
  const list = currentView === "crypto" ? cryptoData : forexData;

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/60 transition-all duration-300 hover:shadow-md"
    >
      {/* Header */}
      <div className="relative mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white shadow-sm">
            <DollarSign size={16} />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{getCurrentTitle()}</h3>
            <p className="text-xs text-slate-500">Live market rates</p>
          </div>
          {isCurrentlyLoading() && (
            <span className="ml-2 inline-block align-middle"><span className="h-3.5 w-3.5 animate-spin rounded-full border-b-2 border-t-2 border-slate-400" /></span>
          )}
        </div>
        {/* Segmented toggle */}
        <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-0.5 text-xs shadow-xs">
          <button
            onClick={() => switchView("crypto")}
            className={`rounded-md px-2.5 py-1.5 transition-colors ${
              currentView === "crypto" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
            aria-label="Show crypto"
          >Crypto</button>
          <button
            onClick={() => switchView("forex")}
            className={`rounded-md px-2.5 py-1.5 transition-colors ${
              currentView === "forex" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
            aria-label="Show forex"
          >Forex</button>
        </div>
      </div>

      {/* List */}
      <div className="relative rounded-xl border border-slate-200 bg-white p-2">
        <ul className="divide-y divide-slate-200">
          {list.map((item) => (
            <li
              key={currentView === "crypto" ? `crypto-${item.symbol}` : `forex-${item.pair}`}
              className="flex min-h-[42px] items-center justify-between gap-2 rounded-lg py-2 px-2 transition-colors hover:bg-slate-50"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">
                  {currentView === "crypto" ? item.symbol : item.pair}
                </p>
              </div>
              <div className="flex min-w-0 items-center gap-2">
                <span className="min-w-0 truncate text-right text-sm font-semibold text-slate-900">
                  {currentView === "crypto" ? item.price : item.rate}
                </span>
                <span
                  className={`inline-flex min-w-0 items-center truncate rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    item.trend === "up"
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
                      : item.trend === "down"
                      ? "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200"
                      : "text-slate-600 bg-slate-50 ring-1 ring-inset ring-slate-200"
                  }`}
                >
                  {item.trend === "up" ? (
                    <TrendingUp className="mr-1 h-3.5 w-3.5 flex-shrink-0" />
                  ) : item.trend === "down" ? (
                    <TrendingDown className="mr-1 h-3.5 w-3.5 flex-shrink-0" />
                  ) : null}
                  <span className="truncate">{item.change}</span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Nav controls */}
      <div className="relative mt-3 flex items-center justify-between">
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
const FeedPage = () => {
  const [mounted, setMounted] = useState(false);

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
  const { data: bankRatesData, isLoading: bankRatesLoading } = useSWR<BankRatesResponse>(
    mounted ? "/api/bankRates" : null,
    fetcher,
    swrCfg
  );

  const [selectedCategory, setSelectedCategory] = useState("african");
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => setMounted(true), []);

  const feedsData = data?.items || [];

  const filteredFeeds = useMemo(
    () =>
      feedsData.filter((feed) => {
        if (!isFinancialOrEconomic(feed)) return false;
        const feedCategory = categorizeByRegion(feed);
        if (feedCategory !== selectedCategory) return false;
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return feed.title.toLowerCase().includes(q) || feed.contentSnippet?.toLowerCase().includes(q);
      }),
    [feedsData, selectedCategory, searchTerm]
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
            <div
              key={`skeleton-${i}`}
              className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-slate-50"
            />
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
              onClick={refresh}
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
        {/* Search & Filters */}
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Filter size={16} /> Filter
            </div>
          </div>

          {/* Category Pills */}
          <div className="mt-2 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-shrink-0 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ring-1 ring-inset ${
                  selectedCategory === category.id
                    ? "bg-slate-900 text-white ring-slate-900"
                    : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                {category.id === "african" ? <MapPin size={16} /> : <Globe size={16} />}
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <div className="mb-3">
          <h2 className="text-sm font-semibold tracking-tight text-slate-900">
            Latest News <span className="text-slate-500">({filteredFeeds.length} articles)</span>
          </h2>
        </div>

        {/* Grid */}
        {filteredFeeds.length > 0 && !feedsLoading && (
          <>
            <div
              className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-8 gap-4"
              style={{ gridAutoFlow: "row", gridAutoRows: "minmax(140px, auto)" }}
            >
              {(() => {
                const feedsWithImages = filteredFeeds.filter(
                  (feed) => feed.imageUrl || (feed.enclosure && feed.enclosure.url)
                );
                const feedsWithoutImages = filteredFeeds.filter(
                  (feed) => !feed.imageUrl && !(feed.enclosure && feed.enclosure.url)
                );

                const gridItems: { key: string; component: React.ReactNode }[] = [];

                // Crypto card
                gridItems.push({
                  key: "card-crypto",
                  component: (
                    <div className="col-span-2 md:col-span-2 lg:col-span-2 row-span-3">
                      <CombinedRateCard
                        cryptoData={rates.crypto}
                        forexData={rates.forex}
                        cryptoLoading={cryptoLoading}
                        forexLoading={forexLoading}
                      />
                    </div>
                  ),
                });

                // Weather card
                gridItems.push({
                  key: "card-weather",
                  component: (
                    <div className="col-span-2 md:col-span-2 lg:col-span-2 row-span-3">
                      <WeatherCard className="w-full h-full" />
                    </div>
                  ),
                });

                // Feeds
                let imageIndex = 0;
                let textIndex = 0;
                let feedItemIndex = 0;
                const totalItems = Math.min(
                  visibleCount,
                  feedsWithImages.length + feedsWithoutImages.length
                );

                while (
                  gridItems.length < totalItems + 2 &&
                  (imageIndex < feedsWithImages.length || textIndex < feedsWithoutImages.length)
                ) {
                  if (imageIndex < feedsWithImages.length) {
                    const feed = feedsWithImages[imageIndex];
                    const feedKey = feed.guid || feed.link || `image-${imageIndex}`;

                    gridItems.push({
                      key: `feed-${feedKey}`,
                      component: (
                        <div className="group relative col-span-2 md:col-span-2 lg:col-span-2 row-span-3">
                          <FeedCard feed={feed} size="medium" />
                        </div>
                      ),
                    });

                    imageIndex++;
                    feedItemIndex++;
                  }

                  if (imageIndex >= feedsWithImages.length && textIndex < feedsWithoutImages.length) {
                    const feed = feedsWithoutImages[textIndex];
                    const feedKey = feed.guid || feed.link || `text-${textIndex}`;

                    gridItems.push({
                      key: `feed-${feedKey}`,
                      component: (
                        <div className="group relative col-span-2 md:col-span-2 lg:col-span-2 row-span-2">
                          <FeedCard feed={feed} size="small" />
                        </div>
                      ),
                    });

                    textIndex++;
                    feedItemIndex++;
                  }
                }

                return gridItems.map((item) => (
                  <React.Fragment key={item.key}>{item.component}</React.Fragment>
                ));
              })()}
            </div>

            {/* Load more */}
            {visibleCount < filteredFeeds.length && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setVisibleCount((c) => c + 9)}
                  className="group relative overflow-hidden rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition-colors hover:bg-slate-50"
                >
                  Load more articles
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {filteredFeeds.length === 0 && !feedsLoading && (
          <div className="grid place-items-center rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-sm">
            <Newspaper className="mb-4 h-16 w-16 text-slate-400" />
            <h3 className="mb-2 text-xl font-medium text-slate-900">No articles found</h3>
            <p className="mb-6 max-w-md text-slate-500">
              Try adjusting your search terms or selecting a different category
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("zimbabwean");
              }}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50"
            >
              Reset filters
            </button>
          </div>
        )}
      </main>

      {/* A11y / motion tweaks */}
      <style jsx global>{`
        .no-scrollbar{ scrollbar-width: none; }
        .no-scrollbar::-webkit-scrollbar{ display: none; }
        @media (prefers-reduced-motion: reduce){
          *{ transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
        }
      `}</style>
    </div>
  );
};

export default FeedPage;
