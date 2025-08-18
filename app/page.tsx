'use client'

import ProfileMenu from "@/components/ProfileMenu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { Search, Filter } from "lucide-react";
import { EventsData, NewsletterData, PostsData } from "@/types.db";
import Posts from "./tabs/posts";
import EventsCalendar from "./tabs/calendar";
import NewsletterCarousel from "./tabs/newsletter";
import FeedPage from "./tabs/feeds";
import HeroClient from "./HeroClient";
import { ChatbotProvider } from "@/components/chatbot";
import HomepageSidebar from "@/components/HomepageSidebar";
import SocialMediaLinks from "@/components/mediapages/SocialMediaLinks";
import Layout from "@/components/layout/Layout";
import { X, Info } from "lucide-react";
import HeroCarousel from "@/components/hero/HeroCarousel";
import FeedsTab from "./tabs/feeds";
import CalendarTab from "./tabs/calendar";
import NewsletterTab from "./tabs/newsletter";
import PostsTab from "./tabs/posts";

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);
  const [currentTab, setCurrentTab] = useState("feed");
  const [logged, setLogged] = useState(false);
  const [isTabsSticky, setIsTabsSticky] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const tabsRef = useRef<HTMLDivElement>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // Mock data objects
  const eventsData: EventsData = {
    success: true,
    data: [
      {
        "id": "clx1234567890abcdef",
        "title": "Company Annual Meeting",
        "description": "Annual company meeting for all employees",
        "startDate": "2024-12-25T09:00:00.000Z",
        "endDate": "2024-12-25T17:00:00.000Z",
        "location": "Main Conference Room",
        "authorId": "clx1234567890abcdef",
        "author": {
          "id": "clx1234567890abcdef",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com"
        },
        "isActive": true,
        "createdAt": "2025-08-03T12:17:54.136Z",
        "updatedAt": "2025-08-03T12:17:54.136Z"
      }
    ]
  };


  useEffect(() => {
    const isSessionActive = sessionStorage.getItem('userID');
    if (isSessionActive) {
      setLogged(true);
      setShowWelcome(false);
      setContentVisible(true);
    } else {
      const timer = setTimeout(() => {
        setShowWelcome(true);
        setContentVisible(false);
      }, 3000);
      router.push('/auth')
      return () => clearTimeout(timer);
    }
  }, []);

  // Sticky tabs functionality
  useEffect(() => {
    const handleScroll = () => {
      if (tabsContainerRef.current) {
        const tabsContainer = tabsContainerRef.current;
        const rect = tabsContainer.getBoundingClientRect();
        const scrollContainer = tabsContainer.closest('.overflow-auto');
        
        if (scrollContainer) {
          // Check if tabs container top has reached the top of the scroll container
          const shouldBeSticky = rect.top <= 0;
          setIsTabsSticky(shouldBeSticky);
        }
      }
    };

    // Find the scroll container (the div with overflow-auto)
    const scrollContainer = document.querySelector('.overflow-auto');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      
      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll);
      };
    }
  }, [logged]);

  const contentVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      scale: 0.95,
      transition: { 
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const tabVariants: Variants = {
    inactive: { 
      scale: 1,
      transition: { duration: 0.2 }
    },
    active: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  };

  // Assuming TabsDemo is a component that uses the Tabs and TabsContent, TabsList, TabsTrigger components
  // and renders the actual content based on the currentTab. For this example, we'll create a placeholder.
  const TabsDemo = () => (
    <div className="text-foreground">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTab}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={contentVariants}
        >
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
        </motion.div>
      </AnimatePresence>
    </div>
  );


  return (
    <Layout>
      <ChatbotProvider position="bottom-right">
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <HomepageSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            <main className="p-6">
              <div className="space-y-6">
                <HeroClient />
                <div ref={tabsContainerRef} className="relative">
                  <Tabs 
                    defaultValue="feed" 
                    className="w-[95%] max-w-none"
                    onValueChange={(value) => setCurrentTab(value)}
                  >
                     {/* Search Bar */}
                    <div className={`${isTabsSticky ? 'sticky top-0 z-50 pb-4 pt-4' : ''}`}>
                     
                      {/* <div className="mb-6 flex items-center gap-4">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <input
                            type="text"
                            placeholder="Search financial news..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                          />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-background border border-input rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors">
                          <Filter className="h-4 w-4" />
                          Filter
                        </button>
                      </div> */}

                      {/* Tabs */}
                      <TabsList 
                        ref={tabsRef}
                        className="mb-8 grid w-full grid-cols-4 gap-2 rounded-xl border border-input bg-card p-2 shadow-lg backdrop-blur"
                      >
                        {['feed', 'newsletter', 'forum', 'calendar'].map((tabValue) => (
                          <TabsTrigger key={tabValue} value={tabValue} asChild>
                            <motion.button
                              className="group relative w-full overflow-hidden rounded-lg px-6 py-3 text-base font-semibold text-muted-foreground data-[state=active]:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-colors"
                              variants={tabVariants}
                              initial="inactive"
                              animate={currentTab === tabValue ? 'active' : 'inactive'}
                              whileHover="hover"
                            >
                              <span className="relative z-10 capitalize">{tabValue}</span>
                              <span
                                className="absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-data-[state=active]:opacity-100 bg-gradient-to-r from-chart-2/30 via-primary/50 to-primary/80"
                              />
                              <span className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-border data-[state=active]:ring-primary/40" />
                            </motion.button>
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>

                    <div 
                      className="relative min-h-[300px] w-full rounded-xl border p-6 shadow-xl bg-card/95 backdrop-blur"
                    >
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