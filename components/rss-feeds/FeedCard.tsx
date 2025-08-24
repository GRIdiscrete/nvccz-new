// @ts-nocheck
import Image from "next/image";
import { FeedItem } from "@/types.db";
import { Newspaper, TrendingUp, ExternalLink, Calendar, User } from "lucide-react";
import { categorizeByRegion } from "@/utils/feedUtils";

type FeedCardProps = {
  feed: FeedItem;
  size?: "small" | "medium" | "large" | "featured";
  className?: string;
};

// Format date to be more readable
const formatDate = (dateString?: string) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch (e) {
    return dateString;
  }
};

// Enhanced FeedCard with size variants for dynamic grid layouts
export const FeedCard = ({ feed, size = "medium", className = "" }: FeedCardProps) => {
  const region = categorizeByRegion(feed);
  const regionDisplay = region === "african" ? "Africa" : "International";

  const hasImage =
    feed.imageUrl ||
    (feed.enclosure && feed.enclosure.url && feed.enclosure.type?.startsWith("image/"));
  const imageUrl = feed.imageUrl || (feed.enclosure && feed.enclosure.url);
  const formattedDate = formatDate(feed.pubDate);

  // Featured card (large with prominent image)
  if (size === "featured" && hasImage && imageUrl) {
    return (
      <article
        className={`group relative h-full overflow-hidden rounded-xl border border-primary-100 bg-white transition-all duration-300 hover:shadow-lg ${className}`}
      >
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-primary-950/90 via-primary-900/50 to-primary-900/20" />
        <div className="relative h-full min-h-[500px] w-full bg-primary-50">
          <Image
            src={imageUrl}
            alt={feed.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority
            placeholder="blur"
            blurDataURL="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
          />
          <div className="absolute inset-0 z-20 flex flex-col justify-end p-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-full bg-primary-600/80 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                {regionDisplay}
              </span>
              <time className="text-xs font-medium text-white/90" dateTime={feed.isoDate || feed.pubDate}>
                {formattedDate}
              </time>
            </div>
            <h3 className="mb-3 text-2xl font-bold leading-tight text-white" title={feed.title}>
              {feed.title}
            </h3>
            <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-white/90">
              {feed.contentSnippet}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white/90">{feed.creator || "Unknown"}</span>
              <a
                href={feed.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Read more: ${feed.title}`}
                className="flex items-center gap-1 rounded-full bg-primary-600/90 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-300"
              >
                Read Article
                <ExternalLink className="ml-1 h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Large / Medium with image
  if ((size === "large" || size === "medium") && hasImage && imageUrl) {
    const imageHeight = size === "large" ? "h-80" : "h-64";
    return (
      <article
        className={`group h-full overflow-hidden rounded-xl border border-primary-100 bg-white transition-all duration-300 hover:shadow-lg ${className}`}
      >
        <div className={`relative ${imageHeight} bg-primary-50`}>
          <Image
            src={imageUrl}
            alt={feed.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-102"
            priority={size === "large"}
            placeholder="blur"
            blurDataURL="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
          />
          <div className="absolute left-3 top-3 z-10">
            <span className="rounded-full bg-primary-600/90 px-2.5 py-1 text-xs font-medium text-white shadow-sm backdrop-blur-sm">
              {regionDisplay}
            </span>
          </div>
        </div>
        <div className="p-5">
          <div className="mb-3 flex items-center gap-3 text-xs text-primary-500">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <time dateTime={feed.isoDate || feed.pubDate}>{formattedDate}</time>
            </div>
            {feed.creator && (
              <div className="flex items-center gap-1">
                <User size={14} />
                <span>{feed.creator}</span>
              </div>
            )}
          </div>
          {/* Title: allow 3 lines and tighter leading for better fit */}
          <h3
            className="mb-2 line-clamp-3 text-[14px] font-semibold leading-snug text-primary-900 transition-colors group-hover:text-primary-700"
            title={feed.title}
          >
            {feed.title}
          </h3>
          <p className="mb-4 line-clamp-2 text-sm text-primary-600/80">{feed.contentSnippet}</p>
          <div className="flex items-center justify-end">
            <a
              href={feed.link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Read more: ${feed.title}`}
              className="inline-flex items-center gap-1 rounded-lg bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700 transition-all hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-200"
            >
              Read More
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </article>
    );
  }

  // Small card (compact)
  // Goal: give the TITLE the room. We:
  // - let the title run for 3 lines (not 2),
  // - make it bigger and tighter leading,
  // - trim other elements (no snippet; smaller image),
  // - add a tooltip (title attr) for full text.
  if (size === "small") {
    return (
      <article
        className={`group overflow-hidden rounded-xl border border-primary-100 bg-white transition-all duration-300 hover:shadow-md ${className}`}
      >
        <div className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="h-2 w-2 rounded-full bg-primary-600" aria-hidden />
            <time className="text-[11px] text-primary-500" dateTime={feed.isoDate || feed.pubDate}>
              {formattedDate}
            </time>
          </div>

          {/* Title given priority */}
          <h3
            className="mb-2 line-clamp-3 break-words text-base font-semibold leading-snug text-primary-900 transition-colors group-hover:text-primary-700"
            title={feed.title}
          >
            {feed.title}
          </h3>

          {/* Optional compact image (reduced height) OR skip snippet to keep title space */}
          {hasImage && imageUrl ? (
            <div className="relative mb-2 h-24 w-full overflow-hidden rounded-md bg-primary-50">
              <Image
                src={imageUrl}
                alt={feed.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                placeholder="blur"
                blurDataURL="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
              />
            </div>
          ) : null}

          <div className="mt-2 flex items-center justify-between">
            <span className="truncate text-[11px] text-primary-500">{regionDisplay}</span>
            <a
              href={feed.link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Read more: ${feed.title}`}
              className="text-xs font-medium text-primary-600 hover:text-primary-800 hover:underline focus:outline-none"
            >
              Read More
            </a>
          </div>
        </div>
      </article>
    );
  }

  // Default card (no image)
  return (
    <article
      className={`group h-full overflow-hidden rounded-xl border border-primary-100 bg-white shadow-sm transition-all duration-300 hover:shadow focus-within:ring-2 focus-within:ring-primary-200 ${className}`}
    >
      <div className="h-1.5 bg-gradient-to-r from-primary-500 to-primary-700" />
      <div className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-100">
              <Newspaper className="h-3 w-3 text-primary-700" />
            </span>
            <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
              {regionDisplay}
            </span>
          </div>
          <time className="text-xs font-medium text-primary-500" dateTime={feed.isoDate || feed.pubDate}>
            {formattedDate}
          </time>
        </div>

        {/* Title: up to 3 lines */}
        <h3
          className="mb-3 line-clamp-3 text-[14px] font-light leading-snug text-primary-900 transition-colors group-hover:text-primary-700"
          title={feed.title}
        >
          {feed.title}
        </h3>

        <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-primary-600/80">
          {feed.contentSnippet}
        </p>

        <div className="flex items-center justify-between border-t border-primary-100 pt-3">
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-primary-400" />
            <span className="text-xs font-medium text-primary-500">{feed.creator || "Unknown"}</span>
          </div>
          <a
            href={feed.link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Read more: ${feed.title}`}
            className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 transition-all hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            Read More
          </a>
        </div>
      </div>
    </article>
  );
};
