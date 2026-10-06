"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Home,
  Plus,
  X,
  Globe,
  ExternalLink,
  LockKeyhole,
} from "lucide-react";
import { useSystemControls } from "@/lib/system-controls";
interface Bookmark {
  name: string;
  url: string;
  description: string;
  favicon?: string;
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
  {
    name: "GetMarks Recap",
    url: "https://recap.getmarks.app",
    description:
      "Recap companion for GetMarks that helps students quickly revise key concepts and past questions.",
  },
  {
    name: "Quizrr",
    url: "https://app.quizrr.in",
    description:
      "Interactive quiz platform for engaging assessments and practice across different subjects.",
  },
  {
    name: "Airesumate",
    url: "https://airesumate.com",
    description:
      "AI-powered resume and profile enhancement tool to help professionals stand out.",
  },
];

export function InternetExplorer() {
  const wifiOn = useSystemControls((s) => s.wifiOn);
  const [tabs, setTabs] = useState([
    { id: 1, history: ["about:bookmarks"], cursor: 0 },
  ]);
  const [activeId, setActiveId] = useState(1);
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const tab = tabs.find((t) => t.id === activeId)!;
  const url = tab.history[tab.cursor];
  const title = (url: string) =>
    url === "about:bookmarks" ? "Start Page" : new URL(url).hostname;
  const navigate = (raw: string) => {
    let next = raw.trim();
    if (next !== "about:bookmarks") {
      try {
        const parsed = new URL(
          /^https?:\/\//i.test(next) ? next : `https://${next}`,
        );
        if (
          !["https:", "http:"].includes(parsed.protocol) ||
          !parsed.hostname.includes(".")
        )
          throw new Error();
        next = parsed.href;
      } catch {
        setError("Enter a valid website address.");
        return;
      }
    }
    setError("");
    setAddress(next === "about:bookmarks" ? "" : next);
    setTabs((all) =>
      all.map((t) =>
        t.id === activeId
          ? {
              ...t,
              history: [...t.history.slice(0, t.cursor + 1), next],
              cursor: t.cursor + 1,
            }
          : t,
      ),
    );
  };
  const step = (delta: number) => {
    const next = tab.cursor + delta;
    setTabs((all) =>
      all.map((t) => (t.id === activeId ? { ...t, cursor: next } : t)),
    );
    setAddress(
      tab.history[next] === "about:bookmarks" ? "" : tab.history[next],
    );
  };
  return (
    <div className="safari-app">
      <div className="mac-toolbar">
        <button
          className="mac-icon-button"
          aria-label="Back"
          disabled={tab.cursor === 0}
          onClick={() => step(-1)}
        >
          <ChevronLeft size={19} />
        </button>
        <button
          className="mac-icon-button"
          aria-label="Forward"
          disabled={tab.cursor === tab.history.length - 1}
          onClick={() => step(1)}
        >
          <ChevronRight size={19} />
        </button>
        <button
          className="mac-icon-button"
          aria-label="Start page"
          onClick={() => navigate("about:bookmarks")}
        >
          <Home size={16} />
        </button>
        <form
          className="safari-address"
          onSubmit={(e) => {
            e.preventDefault();
            navigate(address);
          }}
        >
          <LockKeyhole size={12} />
          <input
            aria-label="Website address"
            placeholder="Search or enter website name"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <button
            type="button"
            aria-label="Reload page"
            onClick={() => setReload(reload + 1)}
          >
            <RotateCcw size={13} />
          </button>
        </form>
        <button
          className="mac-icon-button"
          aria-label="New tab"
          onClick={() => {
            const id = Date.now();
            setTabs([...tabs, { id, history: ["about:bookmarks"], cursor: 0 }]);
            setActiveId(id);
            setAddress("");
          }}
        >
          <Plus size={18} />
        </button>
      </div>
      <div className="safari-tabs" role="tablist">
        {tabs.map((t) => (
          <div key={t.id} data-active={t.id === activeId}>
            <button
              role="tab"
              aria-selected={t.id === activeId}
              onClick={() => {
                setActiveId(t.id);
                setAddress(
                  t.history[t.cursor] === "about:bookmarks"
                    ? ""
                    : t.history[t.cursor],
                );
              }}
            >
              <Globe size={12} />
              <span>{title(t.history[t.cursor])}</span>
            </button>
            {tabs.length > 1 && (
              <button
                aria-label={`Close ${title(t.history[t.cursor])} tab`}
                onClick={() => {
                  const next = tabs.filter((item) => item.id !== t.id);
                  setTabs(next);
                  if (t.id === activeId) {
                    setActiveId(next[0].id);
                    setAddress(
                      next[0].history[next[0].cursor] === "about:bookmarks"
                        ? ""
                        : next[0].history[next[0].cursor],
                    );
                  }
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>
        ))}
      </div>
      {error && (
        <p role="alert" className="p-3 text-xs text-red-500">
          {error}
        </p>
      )}
      {!wifiOn ? (
        <div className="empty-state">
          <Globe size={36} />
          <h2>You’re Offline</h2>
          <p>Turn Wi-Fi on in Control Center to browse.</p>
        </div>
      ) : url === "about:bookmarks" ? (
        <div className="safari-start">
          <h1>Favorites</h1>
          <p>Products I’ve worked on</p>
          <div className="safari-favorites">
            {bookmarks.map((bookmark, index) => (
              <button
                key={bookmark.url}
                onClick={() => navigate(bookmark.url)}
                title={bookmark.description}
              >
                <span
                  style={{
                    background: ["#0a66c2", "#6366f1", "#c08a50", "#303034"][
                      index % 4
                    ],
                  }}
                >
                  {bookmark.name.charAt(0)}
                </span>
                <strong>{bookmark.name}</strong>
              </button>
            ))}
          </div>
          <h2>Reading List</h2>
          <p>Explore a project to see it in action.</p>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="safari-external">
            <span>Some websites open best in a separate tab.</span>
            <a
              className="mac-button"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open website <ExternalLink size={12} />
            </a>
          </div>
          <iframe
            key={`${activeId}-${reload}`}
            src={url}
            title={title(url)}
            className="min-h-0 w-full flex-1 border-0 bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>
      )}
    </div>
  );
}
