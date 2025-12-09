"use client";

import type React from "react";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Home,
  Star,
  ExternalLink,
  Search,
  Globe,
} from "lucide-react";

interface Bookmark {
  name: string;
  url: string;
  description: string;
  favicon?: string;
}

interface Tab {
  id: string;
  title: string;
  url: string;
  isLoading: boolean;
}

const bookmarks: Bookmark[] = [
  {
    name: "LinkedIn Profile",
    url: "https://www.linkedin.com/in/syed-abdul-muneeb/",
    description:
      "Professional profile of Syed Abdul Muneeb - Software Developer and Entrepreneur",
  },
  {
    name: "GetMarks",
    url: "https://web.getmarks.app",
    description:
      "Product of MathonGo, MARKS is a free exam preparation app for Indian students that provides chapter-wise previous year questions and mock tests for competitive exams like IIT JEE and NEET.",
  },
  {
    name: "Capco CS",
    url: "https://www.capco-cs.com",
    description:
      "Capco is a Multinational Management and Technology Consultancy based out of Qatar, India and Canada.",
  },
  {
    name: "Hack Revolution",
    url: "https://www.hackrevolution.in",
    description: "Hackathon platform ",
  },
  {
    name: "E-Cell MJCET",
    url: "https://www.ecell-mjcet.com",
    description: "Entrepreneurship Cell of MJCET",
  },
];

export function InternetExplorer() {
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: "tab-1",
      title: "Internet Explorer",
      url: "about:bookmarks",
      isLoading: false,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState("tab-1");
  const [urlInput, setUrlInput] = useState("about:bookmarks");

  const activeTab = tabs.find((tab) => tab.id === activeTabId) || tabs[0];

  const createNewTab = (
    url: string = "about:bookmarks",
    title: string = "New Tab"
  ) => {
    const newTabId = `tab-${Date.now()}`;
    const newTab: Tab = {
      id: newTabId,
      title,
      url,
      isLoading: url !== "about:bookmarks",
    };
    setTabs((prevTabs) => [...prevTabs, newTab]);
    setActiveTabId(newTabId);
    setUrlInput(url);
  };

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return; // Don't close the last tab

    setTabs((prevTabs) => {
      const newTabs = prevTabs.filter((tab) => tab.id !== tabId);
      if (activeTabId === tabId) {
        const tabIndex = prevTabs.findIndex((tab) => tab.id === tabId);
        const newActiveTab = newTabs[Math.max(0, tabIndex - 1)];
        setActiveTabId(newActiveTab.id);
        setUrlInput(newActiveTab.url);
      }
      return newTabs;
    });
  };

  const updateActiveTab = (updates: Partial<Tab>) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === activeTabId ? { ...tab, ...updates } : tab
      )
    );
  };

  const navigateTo = (url: string) => {
    updateActiveTab({
      url,
      isLoading: url !== "about:bookmarks",
      title:
        url === "about:bookmarks" ? "Internet Explorer" : new URL(url).hostname,
    });
    setUrlInput(url);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let processedUrl = urlInput;

    // Add https:// if no protocol is specified
    if (
      !urlInput.startsWith("http://") &&
      !urlInput.startsWith("https://") &&
      !urlInput.startsWith("about:")
    ) {
      processedUrl = "https://" + urlInput;
    }

    navigateTo(processedUrl);
  };

  const handleBookmarkClick = (url: string, name: string) => {
    // Check if we should open in current tab or new tab
    if (activeTab.url === "about:bookmarks") {
      navigateTo(url);
      updateActiveTab({ title: name });
    } else {
      createNewTab(url, name);
    }
  };

  const goBack = () => {
    // For now, simple back to bookmarks
    if (activeTab.url !== "about:bookmarks") {
      navigateTo("about:bookmarks");
    }
  };

  const goForward = () => {
    // Placeholder for forward functionality
    console.log("Forward clicked");
  };

  const refresh = () => {
    if (activeTab.url !== "about:bookmarks") {
      updateActiveTab({ isLoading: true });
      // Force iframe reload
      setTimeout(() => {
        updateActiveTab({ isLoading: false });
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F0F0F0]">
      {/* IE Menu Bar */}
      <div className="bg-gradient-to-b from-[#F8F8F8] to-[#E8E8E8] border-b border-[#C0C0C0]">
        <div className="flex items-center px-2 py-1 text-xs">
          <button className="px-3 py-1 hover:bg-[#E0E8F0] hover:border hover:border-[#5B9BD5] rounded text-[#333]">
            File
          </button>
          <button className="px-3 py-1 hover:bg-[#E0E8F0] hover:border hover:border-[#5B9BD5] rounded text-[#333]">
            Edit
          </button>
          <button className="px-3 py-1 hover:bg-[#E0E8F0] hover:border hover:border-[#5B9BD5] rounded text-[#333]">
            View
          </button>
          <button className="px-3 py-1 hover:bg-[#E0E8F0] hover:border hover:border-[#5B9BD5] rounded text-[#333]">
            Favorites
          </button>
          <button className="px-3 py-1 hover:bg-[#E0E8F0] hover:border hover:border-[#5B9BD5] rounded text-[#333]">
            Tools
          </button>
          <button className="px-3 py-1 hover:bg-[#E0E8F0] hover:border hover:border-[#5B9BD5] rounded text-[#333]">
            Help
          </button>
        </div>
      </div>

      {/* IE Toolbar */}
      <div className="bg-gradient-to-b from-[#F0F4F7] to-[#E1E8ED] border-b border-[#C0C0C0] px-2 py-2">
        <div className="flex items-center gap-1">
          {/* Navigation Buttons */}
          <div className="flex items-center bg-gradient-to-b from-white to-[#F0F0F0] border border-[#C0C0C0] rounded">
            <button
              onClick={goBack}
              disabled={activeTab.url === "about:bookmarks"}
              className="p-2 hover:bg-gradient-to-b hover:from-[#E0E8F0] hover:to-[#D0D8E0] disabled:opacity-50 disabled:cursor-not-allowed border-r border-[#C0C0C0]"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4 text-[#333]" />
            </button>
            <button
              onClick={goForward}
              disabled={true}
              className="p-2 hover:bg-gradient-to-b hover:from-[#E0E8F0] hover:to-[#D0D8E0] disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Forward"
            >
              <ArrowRight className="w-4 h-4 text-[#333]" />
            </button>
          </div>

          <div className="w-px h-6 bg-[#C0C0C0]" />

          {/* Refresh and Home */}
          <button
            onClick={refresh}
            className="p-2 bg-gradient-to-b from-white to-[#F0F0F0] border border-[#C0C0C0] rounded hover:bg-gradient-to-b hover:from-[#E0E8F0] hover:to-[#D0D8E0]"
            aria-label="Refresh"
          >
            <RotateCcw className="w-4 h-4 text-[#333]" />
          </button>
          <button
            onClick={() => navigateTo("about:bookmarks")}
            className="p-2 bg-gradient-to-b from-white to-[#F0F0F0] border border-[#C0C0C0] rounded hover:bg-gradient-to-b hover:from-[#E0E8F0] hover:to-[#D0D8E0]"
            aria-label="Home"
          >
            <Home className="w-4 h-4 text-[#333]" />
          </button>

          <div className="w-px h-6 bg-[#C0C0C0]" />

          {/* Address Bar */}
          <div className="flex-1 flex items-center gap-2">
            <span className="text-xs text-[#666] font-medium">Address</span>
            <form
              onSubmit={handleUrlSubmit}
              className="flex-1 flex items-center"
            >
              <div className="flex-1 flex items-center bg-white border-2 border-[#999] rounded-sm">
                <Globe className="w-4 h-4 text-[#666] ml-2" />
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 px-2 py-1 text-sm focus:outline-none"
                  placeholder="Type a Web address"
                />
              </div>
              <button
                type="submit"
                className="ml-2 px-3 py-1 bg-gradient-to-b from-white to-[#E8E8E8] border border-[#999] rounded text-xs hover:bg-gradient-to-b hover:from-[#F0F8FF] hover:to-[#E0E8F0]"
              >
                Go
              </button>
            </form>
          </div>

          <div className="w-px h-6 bg-[#C0C0C0]" />

          {/* Search and Favorites */}
          <button className="p-2 bg-gradient-to-b from-white to-[#F0F0F0] border border-[#C0C0C0] rounded hover:bg-gradient-to-b hover:from-[#E0E8F0] hover:to-[#D0D8E0]">
            <Search className="w-4 h-4 text-[#333]" />
          </button>
          <button className="p-2 bg-gradient-to-b from-white to-[#F0F0F0] border border-[#C0C0C0] rounded hover:bg-gradient-to-b hover:from-[#E0E8F0] hover:to-[#D0D8E0]">
            <Star className="w-4 h-4 text-[#FF6B00]" />
          </button>

          {/* New Tab Button */}
        </div>
      </div>

      {/* Tab Bar */}
      <div className="bg-gradient-to-b from-[#E8E8E8] to-[#D8D8D8] border-b border-[#C0C0C0] flex items-end overflow-x-auto">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`relative flex items-center min-w-[180px] max-w-[240px] h-8 cursor-pointer group ${
              tab.id === activeTabId
                ? "bg-white border-l border-r border-t border-[#C0C0C0] rounded-t-md z-10"
                : "bg-gradient-to-b from-[#F0F0F0] to-[#E0E0E0] border-r border-[#C0C0C0] hover:bg-gradient-to-b hover:from-[#F8F8F8] hover:to-[#E8E8E8]"
            }`}
            onClick={() => {
              setActiveTabId(tab.id);
              setUrlInput(tab.url);
            }}
          >
            <div className="flex items-center gap-2 px-3 py-1 flex-1 min-w-0">
              {tab.isLoading ? (
                <div className="w-3 h-3 border border-[#0066CC] border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
              ) : (
                <Globe className="w-3 h-3 text-[#666] flex-shrink-0" />
              )}
              <span className="text-xs text-[#333] truncate">{tab.title}</span>
            </div>
            {tabs.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                className="w-4 h-4 mr-1 flex items-center justify-center hover:bg-red-500  rounded-sm opacity-0 group-hover:opacity-100 transition-all"
              >
                <span className="text-xs font-bold">×</span>
              </button>
            )}
          </div>
        ))}
        <button
          onClick={() => createNewTab()}
          className="h-full px-2 bg-gradient-to-b from-white to-[#F0F0F0] border border-[#C0C0C0] rounded hover:bg-gradient-to-b hover:from-[#E0E8F0] hover:to-[#D0D8E0]"
          title="New Tab"
        >
          <span className="text-[#333] text-sm font-bold">+</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto bg-white">
        {activeTab.url === "about:bookmarks" ? (
          <div className="p-6 bg-white">
            {/* IE Home Page Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#4A9EFF] to-[#0066CC] rounded-lg flex items-center justify-center">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#003366]">
                    Internet Explorer
                  </h1>
                  <p className="text-sm text-[#666]">Bookmarks & Favorites</p>
                </div>
              </div>
            </div>

            {/* Bookmarks Grid */}
            <div className="max-w-4xl mx-auto">
              <h2 className="text-lg font-semibold text-[#333] mb-4 border-b border-[#E0E0E0] pb-2">
                Frequently Visited
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookmarks.map((bookmark, index) => (
                  <div
                    key={index}
                    onClick={() =>
                      handleBookmarkClick(bookmark.url, bookmark.name)
                    }
                    className="group cursor-pointer border border-[#D0D0D0] rounded-lg bg-gradient-to-b from-white to-[#F8F8F8] hover:from-[#F0F8FF] hover:to-[#E8F4FF] hover:border-[#5B9BD5] transition-all duration-200 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#4A9EFF] to-[#0066CC] rounded flex items-center justify-center flex-shrink-0">
                        <Globe className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[#003366] group-hover:text-[#0066CC] transition-colors truncate">
                          {bookmark.name}
                        </h3>
                        <p className="text-xs text-[#666] mt-1 line-clamp-2">
                          {bookmark.description}
                        </p>
                        <p className="text-xs text-[#999] mt-2 truncate">
                          {bookmark.url}
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-[#666] group-hover:text-[#0066CC] opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                  </div>
                ))}
              </div>

              {/* IE Style Footer */}
              <div className="mt-8 p-4 bg-gradient-to-b from-[#F0F8FF] to-[#E8F4FF] border border-[#D0E4FF] rounded">
                <div className="flex items-center gap-2 text-sm text-[#003366]">
                  <div className="w-4 h-4 bg-[#0066CC] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">i</span>
                  </div>
                  <span>
                    <strong>Internet Explorer Notice:</strong> Some websites may
                    not display correctly in iframe mode. Click on any bookmark
                    to navigate to the website. Use Ctrl+Click to open in new
                    tab.
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col bg-white">
            {/* Loading indicator */}
            {activeTab.isLoading && (
              <div className="border-b border-[#E0E0E0] bg-[#F8F8F8] px-4 py-1">
                <div className="flex items-center gap-2 text-xs text-[#666]">
                  <div className="w-3 h-3 border-2 border-[#0066CC] border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading {activeTab.url}...</span>
                </div>
              </div>
            )}

            <iframe
              key={activeTab.id} // Force re-render when tab changes
              src={activeTab.url}
              className="flex-1 w-full border-0"
              title="Website Content"
              onLoad={() => {
                console.log("Page loaded:", activeTab.url);
                updateActiveTab({ isLoading: false });
              }}
            />
          </div>
        )}
      </div>

      {/* IE Status Bar */}
      <div className="border-t border-[#C0C0C0] bg-gradient-to-b from-[#F0F0F0] to-[#E8E8E8] px-3 py-1 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <span className="text-[#333]">Done</span>
          <span className="text-[#666]">Protected Mode: On</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#666]">100%</span>
          <span className="text-[#333]">Internet Explorer 8</span>
        </div>
      </div>
    </div>
  );
}
