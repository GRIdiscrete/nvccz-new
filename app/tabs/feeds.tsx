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
// Combined Rate Card (no animation)
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
      className="group relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-900/90 via-indigo-800/90 to-purple-900/90 p-4 shadow-[0_8px_30px_rgba(79,70,229,0.2)] backdrop-blur-xl transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(79,70,229,0.3)] will-change-transform"
      style={{ transform: "translateZ(0)" }}
    >
      {/* Header */}
      <div className="relative mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
            <DollarSign size={18} />
          </span>
          <div>
            <h3 className="text-base font-semibold text-white">{getCurrentTitle()}</h3>
            <p className="text-xs text-indigo-200/80">Live market rates</p>
          </div>
          {isCurrentlyLoading() && (
            <span className="ml-2 inline-block align-middle">
              <span className="h-4 w-4 animate-spin rounded-full border-b-2 border-t-2 border-indigo-300" />
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => switchView("crypto")}
            className={`h-3 w-3 rounded-full ${
              currentView === "crypto"
                ? "bg-indigo-400 shadow-[0_0_0_4px_rgba(129,140,248,0.3)]"
                : "bg-indigo-700 hover:bg-indigo-600"
            }`}
            aria-label="Show crypto"
          />
          <button
            onClick={() => switchView("forex")}
            className={`h-3 w-3 rounded-full ${
              currentView === "forex"
                ? "bg-indigo-400 shadow-[0_0_0_4px_rgba(129,140,248,0.3)]"
                : "bg-indigo-700 hover:bg-indigo-600"
            }`}
            aria-label="Show forex"
          />
        </div>
      </div>

      {/* List */}
      <div className="relative rounded-xl bg-indigo-950/30 p-2 backdrop-blur-sm will-change-transform">
        <ul className="divide-y divide-indigo-800/50">
          {list.map((item) => (
            <li
              key={currentView === "crypto" ? `crypto-${item.symbol}` : `forex-${item.pair}`}
              className="flex min-h-[42px] items-center justify-between gap-2 rounded-lg py-2 px-3 transition-colors hover:bg-indigo-800/30"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-indigo-100">
                  {currentView === "crypto" ? item.symbol : item.pair}
                </p>
              </div>
              <div className="flex min-w-0 items-center gap-2">
                <span className="min-w-0 truncate text-right text-sm font-bold text-white">
                  {currentView === "crypto" ? item.price : item.rate}
                </span>
                <span
                  className={`inline-flex min-w-0 items-center truncate rounded-full px-2 py-0.5 text-xs font-medium ${
                    item.trend === "up"
                      ? "bg-emerald-500/20 text-emerald-300"
                      : item.trend === "down"
                      ? "bg-rose-500/20 text-rose-300"
                      : "text-indigo-200"
                  }`}
                >
                  {item.trend === "up" ? (
                    <TrendingUp className="mr-1 h-3 w-3 flex-shrink-0" />
                  ) : item.trend === "down" ? (
                    <TrendingDown className="mr-1 h-3 w-3 flex-shrink-0" />
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
          className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-1.5 text-xs font-medium text-white shadow-md transition-shadow hover:shadow-lg"
        >
          {currentView === "crypto" ? "View Forex" : "View Crypto"}
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={() => switchView("crypto")}
            className="rounded-full bg-indigo-800/50 p-1.5 text-indigo-200 transition-colors hover:bg-indigo-700 hover:text-white"
            aria-label="Crypto"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => switchView("forex")}
            className="rounded-full bg-indigo-800/50 p-1.5 text-indigo-200 transition-colors hover:bg-indigo-700 hover:text-white"
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
        <div className="mb-4 h-10 w-64 animate-pulse rounded-lg bg-slate-800/50" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="h-40 animate-pulse rounded-2xl border border-slate-700/60 bg-slate-800/40"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl p-4">
        <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-rose-200">
          Error loading feeds: {(error as any).message}
        </div>
      </div>
    );
  }

  const rates = getRatesData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-white to-white" data-feeds-container>
      {/* Header */}
      <header
        className="sticky top-0 z-20 border-b border-input bg-card/90 backdrop-blur-xl will-change-transform"
        style={{ transform: "translateZ(0)" }}
      >
        <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-sky-600 to-indigo-600 shadow-md" />
              <div>
                <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-base">
                  Arcus Financial Feeds
                </h1>
                <p className="text-[11px] font-medium text-foreground">Curated informatics • live rates</p>
              </div>
            </div>
            <button
              onClick={refresh}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-slate-300 px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-primary/50"
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
        <div className="mb-4 rounded-2xl border border-input bg-card/80 p-3 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                type="text"
                placeholder="Search financial news…"
                className="w-full rounded-xl border border-input bg-background/60 py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Filter size={16} /> Filter
            </div>
          </div>

          {/* Category Pills */}
          <div className="mt-2 flex gap-2 overflow-x-auto pb-3 scrollbar-container">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-shrink-0 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? "bg-primary-100 text-primary-900 border-2 border-primary-600 shadow-md font-bold"
                    : "bg-slate-100 text-slate-700 border-2 border-transparent hover:bg-slate-200 hover:text-slate-900"
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
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Latest News <span className="text-slate-400">({filteredFeeds.length} articles)</span>
          </h2>
        </div>

        {/* Grid */}
        {filteredFeeds.length > 0 && !feedsLoading && (
          <>
            <div
              className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-8 gap-4"
              style={{
                gridAutoFlow: "row",
                gridAutoRows: "minmax(140px, auto)",
              }}
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
                  className="group relative overflow-hidden rounded-full bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-md"
                >
                  <span className="relative z-10">Load more articles</span>
                  <span className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-600 to-sky-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {filteredFeeds.length === 0 && !feedsLoading && (
          <div className="grid place-items-center rounded-2xl border border-input bg-card/80 py-16 text-center shadow-sm backdrop-blur">
            <Newspaper className="mb-4 h-16 w-16 text-muted-foreground opacity-50" />
            <h3 className="mb-2 text-xl font-medium text-foreground">No articles found</h3>
            <p className="mb-6 max-w-md text-muted-foreground">
              Try adjusting your search terms or selecting a different category
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("zimbabwean");
              }}
              className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
            >
              Reset filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default FeedPage;
