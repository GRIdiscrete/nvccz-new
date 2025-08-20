'use client'

import ProfileMenu from "@/components/ProfileMenu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState, useRef, useMemo } from "react";
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
import Dashboard from "./tabs/dashboard";
import {
  Newspaper,
  MessageSquareText,
  CalendarDays,
  Gauge,
  PanelsTopLeft,
} from "lucide-react";

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
      {currentTab === "dashboard" && (
        <TabsContent value="dashboard" className="text-gray-300">
          <Dashboard />
        </TabsContent>
      )}
    </div>
  );

  // Icon + label map (short labels to ensure single-line fit)
  const triggers = useMemo(
    () => [
      { id: "feed", label: "Feed", Icon: PanelsTopLeft },
      { id: "newsletter", label: "News", Icon: Newspaper },
      { id: "forum", label: "Forum", Icon: MessageSquareText },
      { id: "calendar", label: "Cal", Icon: CalendarDays },
      { id: "dashboard", label: "Dash", Icon: Gauge },
    ],
    []
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
                            ? "sticky top-0 z-50 pb-3 pt-3 bg-blue-50/80 backdrop-blur-md will-change-transform"
                            : ""
                        }
                        style={
                          isTabsSticky ? { transform: "translateZ(0)" } : undefined
                        }
                      >
                        {/*
                          MODERN, MINIMAL TAB TRIGGERS
                          - Subtle glass card container
                          - Ghost/soft-selected pills
                          - Reduced contrast for inactive icons/labels
                          - Smooth hover without heavy shadows/gradients
                        */}
                        <TabsList
                          ref={tabsRef}
                          className="mb-6 flex w-full items-center gap-1 rounded-2xl border border-slate-200 bg-white/60 px-1.5 py-1 backdrop-blur supports-[backdrop-filter]:bg-white/50 overflow-x-auto whitespace-nowrap no-scrollbar"
                          aria-label="Main sections"
                        >
                          {triggers.map(({ id, label, Icon }) => (
                            <TabsTrigger
                              key={id}
                              value={id}
                              title={label}
                              className="group relative inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-3 md:px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 data-[state=active]:text-slate-900 transition-colors"
                            >
                              {/* Soft pill background (hover/active) */}
                              <span className="absolute inset-0 rounded-xl bg-slate-100/70 opacity-0 transition-opacity duration-200 group-hover:opacity-100 data-[state=active]:opacity-100" />

                              {/* Thin hairline ring to define pills; intensifies when active */}
                              <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-slate-200 data-[state=active]:ring-slate-300" />

                              <span className="relative z-10 inline-flex items-center gap-2 min-w-0">
                                <Icon className="size-4 flex-none opacity-70 group-hover:opacity-100 data-[state=active]:opacity-100" />
                                <span className="truncate max-w-[6rem] xs:inline sm:inline md:inline">
                                  {label}
                                </span>
                              </span>
                            </TabsTrigger>
                          ))}
                        </TabsList>
                      </div>

                      <div className="relative min-h-[300px] w-full rounded-xl border border-blue-200 p-0 shadow-xl bg-white backdrop-blur">
                        {/* subtle top border glow under sticky tabs */}
                        <div className="pointer-events-none absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300/60 to-transparent" />
                        <div className="p-6">
                          <TabsDemo />
                        </div>
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
