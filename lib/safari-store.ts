import { create } from "zustand";
import { sameUrl } from "./safari-url";

// Safari's saved data: bookmarks, Reading List, history and which Start Page
// sections are shown. Remembered between visits like the real app.

export interface SafariPage {
  url: string;
  title: string;
  description?: string;
}
export interface HistoryEntry extends SafariPage {
  at: number;
}
export interface ReadingItem extends SafariPage {
  added: number;
  read: boolean;
}
export type StartSection =
  | "favorites"
  | "frequent"
  | "privacy"
  | "reading"
  | "closed";

export const START_SECTIONS: { id: StartSection; label: string }[] = [
  { id: "favorites", label: "Favourites" },
  { id: "frequent", label: "Frequently Visited" },
  { id: "privacy", label: "Privacy Report" },
  { id: "reading", label: "Reading List" },
  { id: "closed", label: "Recently Closed Tabs" },
];

export const DEFAULT_BOOKMARKS: SafariPage[] = [
  {
    title: "LinkedIn",
    url: "https://www.linkedin.com/in/syed-abdul-muneeb/",
    description:
      "Professional profile of Syed Abdul Muneeb - Software Developer and Entrepreneur",
  },
  {
    title: "GetMarks",
    url: "https://web.getmarks.app/",
    description:
      "Product of MathonGo, MARKS is a free exam preparation app for Indian students that provides chapter-wise previous year questions and mock tests for competitive exams like IIT JEE and NEET.",
  },
  {
    title: "PulseGen",
    url: "https://www.pulsegen.io/",
    description:
      "PulseGen, where Muneeb builds Arrwin, an AI assistant for product managers.",
  },
  {
    title: "Hack Revolution",
    url: "https://www.hackrevolution.in/",
    description: "Hackathon platform",
  },
  {
    title: "E-Cell MJCET",
    url: "https://www.ecell-mjcet.com/",
    description: "Entrepreneurship Cell of MJCET",
  },
  {
    title: "GetMarks Recap",
    url: "https://recap.getmarks.app/",
    description:
      "Recap companion for GetMarks that helps students quickly revise key concepts and past questions.",
  },
  {
    title: "Quizrr",
    url: "https://app.quizrr.in/",
    description:
      "Interactive quiz platform for engaging assessments and practice across different subjects.",
  },
  {
    title: "Airesumate",
    url: "https://airesumate.com/",
    description:
      "AI-powered resume and profile enhancement tool to help professionals stand out.",
  },
  {
    title: "GitHub",
    url: "https://github.com/",
  },
  {
    title: "Wikipedia",
    url: "https://www.wikipedia.org/",
  },
];

interface Persisted {
  bookmarks: SafariPage[];
  readingList: ReadingItem[];
  history: HistoryEntry[];
  sections: Record<StartSection, boolean>;
  sidebarOpen: boolean;
}

interface SafariState extends Persisted {
  loaded: boolean;
  load: () => void;
  toggleBookmark: (page: SafariPage) => void;
  removeBookmark: (url: string) => void;
  addToReadingList: (page: SafariPage) => void;
  removeFromReadingList: (url: string) => void;
  markRead: (url: string, read: boolean) => void;
  visit: (page: SafariPage) => void;
  clearHistory: () => void;
  toggleSection: (id: StartSection) => void;
  setSidebarOpen: (open: boolean) => void;
}

const STORAGE_KEY = "muneebos-safari-v1";
const HISTORY_LIMIT = 300;

const DEFAULTS: Persisted = {
  bookmarks: DEFAULT_BOOKMARKS,
  readingList: [],
  history: [],
  sections: {
    favorites: true,
    frequent: true,
    privacy: true,
    reading: true,
    closed: true,
  },
  sidebarOpen: false,
};

export const useSafari = create<SafariState>((set, get) => {
  const update = (patch: Partial<Persisted>) => {
    set(patch);
    if (typeof window === "undefined") return;
    const { bookmarks, readingList, history, sections, sidebarOpen } = get();
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ bookmarks, readingList, history, sections, sidebarOpen }),
      );
    } catch {
      /* storage unavailable */
    }
  };

  return {
    ...DEFAULTS,
    loaded: false,
    load: () => {
      if (get().loaded) return;
      let saved: Partial<Persisted> = {};
      try {
        saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
      } catch {
        /* corrupt or unavailable */
      }
      set({
        loaded: true,
        bookmarks: Array.isArray(saved.bookmarks)
          ? saved.bookmarks
          : DEFAULTS.bookmarks,
        readingList: Array.isArray(saved.readingList) ? saved.readingList : [],
        history: Array.isArray(saved.history) ? saved.history : [],
        sections: { ...DEFAULTS.sections, ...saved.sections },
        sidebarOpen: saved.sidebarOpen === true,
      });
    },
    toggleBookmark: (page) => {
      const { bookmarks } = get();
      update({
        bookmarks: bookmarks.some((b) => sameUrl(b.url, page.url))
          ? bookmarks.filter((b) => !sameUrl(b.url, page.url))
          : [...bookmarks, { url: page.url, title: page.title }],
      });
    },
    removeBookmark: (url) =>
      update({ bookmarks: get().bookmarks.filter((b) => !sameUrl(b.url, url)) }),
    addToReadingList: (page) => {
      const rest = get().readingList.filter((r) => !sameUrl(r.url, page.url));
      update({
        readingList: [
          { url: page.url, title: page.title, added: Date.now(), read: false },
          ...rest,
        ],
      });
    },
    removeFromReadingList: (url) =>
      update({
        readingList: get().readingList.filter((r) => !sameUrl(r.url, url)),
      }),
    markRead: (url, read) =>
      update({
        readingList: get().readingList.map((r) =>
          sameUrl(r.url, url) ? { ...r, read } : r,
        ),
      }),
    visit: (page) =>
      update({
        history: [
          { url: page.url, title: page.title, at: Date.now() },
          ...get().history,
        ].slice(0, HISTORY_LIMIT),
      }),
    clearHistory: () => update({ history: [] }),
    toggleSection: (id) =>
      update({ sections: { ...get().sections, [id]: !get().sections[id] } }),
    setSidebarOpen: (sidebarOpen) => update({ sidebarOpen }),
  };
});
