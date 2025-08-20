"use client";

import useSWR from "swr";
import { HeroCarousel, HeroSlide } from "@/components/hero";
import { FeedItem } from "@/types.db";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// Transform feed items to hero slides
function transformFeedToSlides(feedItems: FeedItem[]): HeroSlide[] {
  return feedItems
    .filter((item) => {
      // Filter for items that have images and are suitable for hero display
      return item.imageUrl || item.enclosure?.url || item.media;
    })
    .slice(0, 5) // Limit to 5 slides for performance
    .map((item, index) => {
      // Determine image URL priority: imageUrl > enclosure > fallback
      let imageUrl = item.imageUrl;
      if (!imageUrl && item.enclosure?.url && item.enclosure.type?.startsWith("image/")) {
        imageUrl = item.enclosure.url;
      }
      if (!imageUrl) {
        // Fallback images for different categories of news
        const fallbackImages = [
          "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1920&q=80", // Financial charts
          "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1920&q=80", // Business meeting
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80", // City skyline
          "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1920&q=80", // Stock market
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1920&q=80", // Analytics
        ];
        imageUrl = fallbackImages[index % fallbackImages.length];
      }

      // Extract domain from link for source
      const getDomain = (url: string): string => {
        try {
          return new URL(url).hostname.replace("www.", "").split(".")[0];
        } catch {
          return "News";
        }
      };

      // Clean and format the content snippet
      let cleanSubtitle = "";
      if (item.contentSnippet) {
        cleanSubtitle = item.contentSnippet;
      } else if (item.content) {
        // Remove HTML tags and limit length
        cleanSubtitle = item.content.replace(/<[^>]*>/g, "").slice(0, 200);
        // Add ellipsis if truncated
        if (item.content.length > 200) cleanSubtitle += "...";
      } else {
        cleanSubtitle = "Stay updated with the latest financial news and market insights.";
      }

      return {
        id: item.guid || `slide-${index}`,
        title: item.title || "Financial News Update",
        subtitle: cleanSubtitle,
        image: imageUrl,
        alt: `${item.title} - Financial news article image`,
        pubDate: item.pubDate,
        source: item.creator || getDomain(item.link).toUpperCase(),
        cta: {
          label: "Read Article",
          href: item.link,
        },
      } as HeroSlide;
    });
}

export default function HeroClient() {
  // Fetch both feeds and fallback slides
  const { data: feedData } = useSWR<{ items: FeedItem[] }>("/api/feeds", fetcher, {
    refreshInterval: 300000, // Refresh every 5 minutes
    revalidateOnFocus: false,
  });

  const { data: heroData } = useSWR<{ slides: HeroSlide[] }>("/api/hero", fetcher);

  // Transform feed data to slides, fallback to static slides
  let slides: HeroSlide[] = [];

  if (feedData?.items && feedData.items.length > 0) {
    slides = transformFeedToSlides(feedData.items);
  }

  // If no feed slides or insufficient feed slides, use fallback
  if (slides.length === 0) {
    slides = heroData?.slides || [
      {
        id: "hero-1",
        title: "Daily Markets. Clear Signals.",
        subtitle:
          "Stay informed with real-time market data and expert analysis to make better financial decisions for your business and investments.",
        image:
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1920&q=80",
        alt: "Aerial city skyline at dusk with soft light and distant markets mood",
        source: "Arcus",
        cta: { label: "Explore Markets", href: "/feeds" },
      },
      {
        id: "hero-2",
        title: "Personalized Feeds. Enterprise Ready.",
        subtitle:
          "Customize your financial information dashboard with the metrics and news that matter most to your business and investment strategy.",
        image:
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1920&q=80",
        alt: "Abstract soft gradient and bokeh lights for brand-forward backdrop",
        source: "Arcus",
        cta: { label: "Get Started", href: "/feeds" },
      },
      {
        id: "hero-3",
        title: "Financial Insights. Informed Decisions.",
        subtitle:
          "Access comprehensive financial analytics and reports to drive strategic business decisions and optimize your investment portfolio.",
        image:
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1920&q=80",
        alt: "Financial data analytics dashboard with charts and graphs",
        source: "Arcus",
        cta: { label: "View Analytics", href: "/feeds" },
      },
    ];
  }

  return (
    <div className="relative hero-mask">
      {/*
        Overlay + mask strategy (modern, minimal):
        - ::before applies a subtle vignette + bottom lift using mix-blend-multiply, preserving image vibrancy while
          improving white text legibility.
        - Descendant <img>/<video> get a gentle radial mask at the top/edges + slight contrast boost.
        - Non-invasive: doesn't require changes inside <HeroCarousel/>.
      */}
      <HeroCarousel slides={slides} />

      <style jsx global>{`
        /* Keep the mask effect strictly on the imagery; do NOT overlay above text */
        .hero-mask { position: relative; }

        /* Remove page-wide overlay. Instead, darken/shape only the imagery so text stays crisp-white. */
        .hero-mask img, .hero-mask video, .hero-mask [data-hero-image] {
          filter: brightness(0.92) contrast(1.08) saturate(1.06);
          /* Radial mask keeps center bright, edges gently tucked */
          -webkit-mask-image:
            radial-gradient(130% 95% at 50% 20%, rgba(0,0,0,1) 55%, rgba(0,0,0,0.96) 65%, rgba(0,0,0,0.65) 85%, rgba(0,0,0,0.35) 100%);
          mask-image:
            radial-gradient(130% 95% at 50% 20%, rgba(0,0,0,1) 55%, rgba(0,0,0,0.96) 65%, rgba(0,0,0,0.65) 85%, rgba(0,0,0,0.35) 100%);
          transition: filter 200ms ease;
        }
        .hero-mask:hover img, .hero-mask:hover video, .hero-mask:hover [data-hero-image] {
          filter: brightness(0.90) contrast(1.10) saturate(1.08);
        }

        /* Ensure text/content always renders above imagery and remains bright */
        .hero-mask [data-hero-content],
        .hero-mask [data-hero-title],
        .hero-mask [data-hero-subtitle],
        .hero-mask .hero-content,
        .hero-mask .hero-text,
        .hero-mask .hero-copy,
        .hero-mask h1,
        .hero-mask h2,
        .hero-mask h3,
        .hero-mask p,
        .hero-mask a,
        .hero-mask button {
          position: relative;
          z-index: 3; /* above any image-level effects */
          text-shadow: 0 1px 2px rgba(0,0,0,0.35);
        }

        /* Optional, subtle bottom lift that stays under text (normal blend, low opacity) */
        .hero-mask::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(to top, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.12) 38%, rgba(0,0,0,0.04) 58%, rgba(0,0,0,0) 75%);
          z-index: 1; /* under text, over base image when image has z-index:0 */
        }

        /* Place media behind the optional ::after gradient */
        .hero-mask img, .hero-mask video, .hero-mask [data-hero-image] { z-index: 0; }
      `}</style>
    </div>
  );
}
