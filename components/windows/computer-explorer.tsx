"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  LayoutGrid,
  List,
  Home,
  Monitor,
  FileText,
  Music,
  Image,
  AppWindow,
  Folder,
  HardDrive,
  Gamepad2,
} from "lucide-react";
import { AppIcon } from "@/lib/app-icons";
import { FinderLabel } from "@/components/finder-label";
import { getLaunchableApps } from "@/lib/app-registry";
import { useInstalledApps } from "@/lib/app-store/installed";
import { launchApp } from "@/lib/launch-app";
import { useWindowManager } from "@/lib/window-manager";

interface Item {
  id: string;
  name: string;
  kind: string;
  folder?: string;
  app?: string;
  image?: string;
  song?: string;
}
const folder = (name: string): Item => ({
  id: name,
  name,
  kind: "Folder",
  folder: name,
});
const portfolio: Item[] = [
  { id: "about", name: "About Me", kind: "Application", app: "about" },
  { id: "projects", name: "Projects", kind: "Folder", app: "projects" },
  { id: "resume", name: "Resume.pdf", kind: "PDF document", app: "resume" },
  { id: "contact", name: "Contact", kind: "Application", app: "contact" },
];
const library: Record<string, Item[]> = {
  Home: [
    folder("Desktop"),
    folder("Documents"),
    folder("Applications"),
    folder("Pictures"),
    folder("Music"),
    folder("Games"),
  ],
  Desktop: portfolio,
  Documents: [
    portfolio[2],
    { id: "notes", name: "Project Notes", kind: "Text document", app: "notes" },
  ],
  Pictures: [
    {
      id: "profile",
      name: "profile.jpg",
      kind: "JPEG image",
      image: "/profile.jpg",
    },
    {
      id: "avatar",
      name: "avatar.jpg",
      kind: "JPEG image",
      image: "/avatar-1200.jpg",
    },
  ],
  Music: [
    {
      id: "music",
      name: "For A Reason",
      kind: "MP3 audio",
      app: "music",
      song: "ForAReason.mp3",
    },
    {
      id: "regrets",
      name: "Regrets",
      kind: "MP3 audio",
      app: "music",
      song: "regrets.mp3",
    },
  ],
  // Filled from the games installed in the App Store.
  Games: [],
  "Macintosh HD": [folder("Home"), folder("Applications")],
};
const locations = [
  { name: "Home", icon: Home },
  { name: "Desktop", icon: Monitor },
  { name: "Documents", icon: FileText },
  { name: "Applications", icon: AppWindow },
  { name: "Pictures", icon: Image },
  { name: "Music", icon: Music },
  { name: "Games", icon: Gamepad2 },
];

export function ComputerExplorer({
  initialFolder,
}: { initialFolder?: string; initialPath?: string[] } = {}) {
  const [history, setHistory] = useState([
    initialFolder && library[initialFolder] ? initialFolder : "Home",
  ]);
  const [cursor, setCursor] = useState(0);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<"icons" | "list">("icons");
  const [sortAsc, setSortAsc] = useState(true);
  const current = history[cursor];
  const label = (name: string) =>
    name === "Desktop" ? (
      <>
        <span className="desktop-only">Desktop</span>
        <span className="mobile-only">Portfolio</span>
      </>
    ) : (
      name
    );
  useEffect(() => {
    if (initialFolder) {
      setHistory([initialFolder]);
      setCursor(0);
      setQuery("");
      setSelected(null);
    }
  }, [initialFolder]);
  const navigate = (name: string) => {
    setHistory([...history.slice(0, cursor + 1), name]);
    setCursor(cursor + 1);
    setQuery("");
    setSelected(null);
  };
  const step = (delta: number) => {
    setCursor(Math.max(0, Math.min(history.length - 1, cursor + delta)));
    setQuery("");
    setSelected(null);
  };
  // Applications and Games follow what's installed in the App Store.
  useInstalledApps((s) => s.overrides);
  const asItems = (apps: ReturnType<typeof getLaunchableApps>): Item[] =>
    apps.map((app) => ({
      id: app.id,
      name: app.title,
      kind: "Application",
      app: app.id,
    }));
  const items: Item[] =
    current === "Applications"
      ? asItems(getLaunchableApps().filter((app) => !app.externalUrl))
      : current === "Games"
        ? asItems(getLaunchableApps().filter((app) => app.category === "Games"))
        : (library[current] ?? []);
  const filtered = items
    .filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => (sortAsc ? 1 : -1) * a.name.localeCompare(b.name));
  const open = (item: Item) => {
    if (item.folder) navigate(item.folder);
    else if (item.app)
      launchApp(item.app, item.song ? { fileName: item.song } : undefined);
    else if (item.image)
      useWindowManager.getState().openWindow({
        id: `preview-${item.id}`,
        title: item.name,
        icon: item.image,
        component: "PhotoPreview",
        isMinimized: false,
        isMaximized: false,
        position: { x: 160, y: 70 },
        size: { width: 640, height: 500 },
        metadata: { fileName: item.name, filePath: item.image },
      });
  };
  const art = (item: Item, size: number) =>
    item.image ? (
      <img
        src={item.image}
        alt=""
        className="rounded object-cover"
        style={{ width: size, height: size }}
      />
    ) : (
      <AppIcon
        appId={
          item.folder || item.id === "projects"
            ? "projects"
            : (item.app ?? "resume")
        }
        size={size}
      />
    );
  return (
    <div
      className="mac-split"
      onKeyDown={(e) => {
        if ((e.target as HTMLElement).matches("input")) return;
        const mod = e.metaKey || e.ctrlKey;
        if (mod && ["1", "2"].includes(e.key)) {
          e.preventDefault();
          setView(e.key === "1" ? "icons" : "list");
        } else if (mod && e.key === "ArrowUp") {
          e.preventDefault();
          navigate("Home");
        } else if (mod && (e.key === "[" || e.key === "]")) {
          e.preventDefault();
          step(e.key === "[" ? -1 : 1);
        } else if (
          (e.key === "Enter" ||
            (mod && (e.key === "o" || e.key === "ArrowDown"))) &&
          selected
        ) {
          e.preventDefault();
          const item = items.find((i) => i.id === selected);
          if (item) open(item);
        } else if (
          ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"].includes(e.key)
        ) {
          e.preventDefault();
          const index = filtered.findIndex((i) => i.id === selected);
          const next = Math.max(
            0,
            Math.min(
              filtered.length - 1,
              index + (["ArrowDown", "ArrowRight"].includes(e.key) ? 1 : -1),
            ),
          );
          setSelected(filtered[next]?.id ?? null);
        }
      }}
      tabIndex={0}
    >
      <aside className="mac-sidebar">
        <div className="sidebar-heading">Favorites</div>
        <nav aria-label="File locations">
          {locations.map((loc) => (
            <button
              key={loc.name}
              className="sidebar-item"
              data-selected={current === loc.name}
              onClick={() => navigate(loc.name)}
            >
              <loc.icon />
              <span>{label(loc.name)}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-heading">Locations</div>
        <button
          className="sidebar-item"
          data-selected={current === "Macintosh HD"}
          onClick={() => navigate("Macintosh HD")}
        >
          <HardDrive />
          <span>Macintosh HD</span>
        </button>
      </aside>
      <main className="finder-main">
        <div className="mac-toolbar">
          <div className="toolbar-group">
            <button
              className="mac-icon-button"
              aria-label="Back"
              disabled={cursor === 0}
              onClick={() => step(-1)}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className="mac-icon-button"
              aria-label="Forward"
              disabled={cursor === history.length - 1}
              onClick={() => step(1)}
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <h2>{label(current)}</h2>
          <div className="toolbar-group">
            <button
              className="mac-icon-button"
              aria-label="Icon view"
              aria-pressed={view === "icons"}
              onClick={() => setView("icons")}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              className="mac-icon-button"
              aria-label="List view"
              aria-pressed={view === "list"}
              onClick={() => setView("list")}
            >
              <List size={18} />
            </button>
          </div>
          <label className="mac-search">
            <Search size={14} />
            <input
              aria-label="Search folder"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          {!filtered.length ? (
            <div className="empty-state">
              <Search size={32} />
              <p>No items found</p>
              <span className="text-xs">Try a different search.</span>
            </div>
          ) : view === "icons" ? (
            <div className="finder-grid">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  className="finder-file"
                  data-selected={selected === item.id}
                  onFocus={() => setSelected(item.id)}
                  onClick={() => setSelected(item.id)}
                  onDoubleClick={() => open(item)}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    open(item);
                  }}
                >
                  <span className="finder-file-art">{art(item, 64)}</span>
                  <span className="finder-file-name">
                    {item.name === "Desktop" ? (
                      label(item.name)
                    ) : (
                      <FinderLabel name={item.name} />
                    )}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <table className="finder-list">
              <thead>
                <tr>
                  <th>
                    <button onClick={() => setSortAsc(!sortAsc)}>
                      Name {sortAsc ? "⌃" : "⌄"}
                    </button>
                  </th>
                  <th className="optional-column">Kind</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    tabIndex={0}
                    data-selected={selected === item.id}
                    onFocus={() => setSelected(item.id)}
                    onClick={() => setSelected(item.id)}
                    onDoubleClick={() => open(item)}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      open(item);
                    }}
                  >
                    <td>
                      <span className="flex items-center gap-2">
                        {art(item, 26)}
                        {label(item.name)}
                      </span>
                    </td>
                    <td className="optional-column">{item.kind}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="mac-statusbar finder-status">
          {filtered.length} {filtered.length === 1 ? "item" : "items"}
          {selected ? ", 1 selected" : ""}
        </div>
      </main>
    </div>
  );
}
