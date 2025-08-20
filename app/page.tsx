'use client'

import ProfileMenu from "@/components/ProfileMenu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { EventsData } from "@/types.db";
import Posts from "./tabs/posts";
import EventsCalendar from "./tabs/calendar";
import NewsletterCarousel from "./tabs/newsletter";
import FeedPage from "./tabs/feeds";
import HeroClient from "./HeroClient";
import { ChatbotProvider } from "@/components/chatbot";
import HomepageSidebar from "@/components/HomepageSidebar";
import Layout from "@/components/layout/Layout";
import { TickerStrip } from "@/components/ticker/TickerBar";

export default function Home() {
  const [currentTab, setCurrentTab] = useState("feed");
  const [logged, setLogged] = useState(false);
  const [isTabsSticky, setIsTabsSticky] = useState(false);
  const router = useRouter();
  const tabsRef = useRef<HTMLDivElement>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // Mock events
  const eventsData: EventsData = {
    success: true,
    data: [
      {
        id: "clx1234567890abcdef",
        title: "Company Annual Meeting",
        description: "Annual company meeting for all employees",
        startDate: "2024-12-25T09:00:00.000Z",
        endDate: "2024-12-25T17:00:00.000Z",
        location: "Main Conference Room",
        authorId: "clx1234567890abcdef",
        author: {
          id: "clx1234567890abcdef",
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
        },
        isActive: true,
        createdAt: "2025-08-03T12:17:54.136Z",
        updatedAt: "2025-08-03T12:17:54.136Z",
      },
    ],
  };

  useEffect(() => {
    const isSessionActive = sessionStorage.getItem("userID");
    if (isSessionActive) {
      setLogged(true);
    } else {
      router.push("/auth");
    }
  }, [router]);

  // Sticky tabs
  useEffect(() => {
    let raf = 0;
    const handleScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (!tabsContainerRef.current) return;
        const rect = tabsContainerRef.current.getBoundingClientRect();
        const nextSticky = rect.top <= 0;
        setIsTabsSticky((prev) => (prev !== nextSticky ? nextSticky : prev));
      });
    };

    const scrollContainer =
      document.querySelector(".overflow-auto") || window;
    (scrollContainer as any).addEventListener("scroll", handleScroll, {
      passive: true,
    });
    handleScroll();

    return () => {
      (scrollContainer as any).removeEventListener("scroll", handleScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [logged]);

  const TabsDemo = () => (
    <div className="text-foreground">
      {currentTab === "feed" && (
        <TabsContent value="feed">
          <FeedPage />
        </TabsContent>
      )}
      {currentTab === "newsletter" && (
        <TabsContent value="newsletter">
          <NewsletterCarousel />
        </TabsContent>
      )}
      {currentTab === "forum" && (
        <TabsContent value="forum">
          <Posts />
        </TabsContent>
      )}
      {currentTab === "calendar" && (
        <TabsContent value="calendar">
          <EventsCalendar events={eventsData} />
        </TabsContent>
      )}
    </div>
  );

  return (
    <Layout>
      <ChatbotProvider position="bottom-right">
        <div className="flex h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50">
          <HomepageSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Ticker */}
            <div
              className="border-b border-blue-200 bg-white/80 backdrop-blur-md will-change-transform"
              style={{ transform: "translateZ(0)" }}
            >
              <div className="px-6 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-sm font-semibold tracking-tight text-foreground">
                    Live Exchange Rates{" "}
                    <span className="text-slate-400">(RBZ Official Rates)</span>
                  </h2>
                </div>
                <TickerStrip className="rounded-lg shadow-sm" />
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <main className="p-6">
                <div className="space-y-8">
                  {/* Hero (no animation) */}
                  <div>
                    <HeroClient />
                  </div>

                  {/* Tabs */}
                  <div
                    ref={tabsContainerRef}
                    className="relative will-change-transform"
                    style={{ transform: "translateZ(0)" }}
                  >
                    <Tabs
                      defaultValue="feed"
                      className="w-full max-w-none"
                      onValueChange={(value) => setCurrentTab(value)}
                    >
                      <div
                        className={
                          isTabsSticky
                            ? "sticky top-0 z-50 pb-4 pt-4 bg-blue-50/80 backdrop-blur-md will-change-transform"
                            : ""
                        }
                        style={
                          isTabsSticky ? { transform: "translateZ(0)" } : undefined
                        }
                      >
                        <TabsList
                          ref={tabsRef}
                          className="mb-8 grid w-full grid-cols-4 gap-2 sm:gap-3 rounded-xl border border-blue-200 bg-white p-1.5 sm:p-2 shadow-lg backdrop-blur"
                        >
                          {[
                            { id: "feed", label: "Feed" },
                            { id: "newsletter", label: "News" },
                            { id: "forum", label: "Forum" },
                            { id: "calendar", label: "Calendar" },
                          ].map((tab) => (
                            <TabsTrigger
                              key={tab.id}
                              value={tab.id}
                              className="group relative w-full overflow-hidden rounded-xl px-2 sm:px-4 py-3 text-base font-semibold text-blue-400 data-[state=active]:text-white transition-colors"
                            >
                              <span className="relative z-10 block text-center">
                                {tab.label}
                              </span>
                              <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 opacity-0 transition-opacity duration-300 data-[state=active]:opacity-100" />
                              <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-blue-200 data-[state=active]:ring-blue-500/40" />
                            </TabsTrigger>
                          ))}
                        </TabsList>
                      </div>

                      <div className="relative min-h-[300px] w-full rounded-xl border border-blue-200 p-6 shadow-xl bg-white backdrop-blur">
                        <TabsDemo />
                      </div>
                    </Tabs>
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
      </ChatbotProvider>
    </Layout>
  );
}
