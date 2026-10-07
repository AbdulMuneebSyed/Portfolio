"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  Glasses,
  Globe,
  Laptop,
  Link,
  PanelLeft,
  Plus,
  RotateCw,
  Search,
  Share,
  ShieldCheck,
  Star,
  Trash2,
  WifiOff,
  X,
} from "lucide-react";
import { useSystemControls } from "@/lib/system-controls";
import { START_SECTIONS, useSafari, type SafariPage } from "@/lib/safari-store";
import {
  START_PAGE,
  hostLabel,
  resolveAddress,
  sameUrl,
  searchQuery,
} from "@/lib/safari-url";

interface Tab {
  id: number;
  history: string[];
  cursor: number;
  loading: boolean;
}

type SidebarView = "tabs" | "bookmarks" | "reading" | "history";

const newTab = (url = START_PAGE): Tab => ({
  id: Date.now() + Math.random(),
  history: [url],
  cursor: 0,
  loading: url !== START_PAGE,
});

const TILE_COLORS = [
  "#0a66c2",
  "#5e5ce6",
  "#bf5af2",
  "#ff375f",
  "#ff9f0a",
  "#30b158",
  "#64a8d6",
  "#8e8e93",
];

// Site icon like Safari's: the site's own icon on a tile, or its initial on a
// coloured tile when the site has no large icon.
function SiteIcon({
  url,
  title,
  size,
}: {
  url: string;
  title: string;
  size: number;
}) {
  const host = hostLabel(url);
  const [fallback, setFallback] = useState(false);
  const small = size < 24;
  if (fallback || !host) {
    if (small)
      return (
        <Globe size={size} className="shrink-0 text-[var(--mac-secondary)]" />
      );
    const color =
      TILE_COLORS[
        [...host].reduce((sum, c) => sum + c.charCodeAt(0), 0) %
          TILE_COLORS.length
      ];
    return (
      <span
        className="safari-tile"
        style={{
          width: size,
          height: size,
          background: color,
          fontSize: size * 0.5,
        }}
      >
        {(title || host).charAt(0).toUpperCase()}
      </span>
    );
  }
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt=""
      src={`https://www.google.com/s2/favicons?domain=${host}&sz=${small ? 32 : 128}`}
      width={small ? size : size * 0.62}
      height={small ? size : size * 0.62}
      draggable={false}
      onError={() => setFallback(true)}
      // Google answers unknown sites with a 16px globe: use the letter tile.
      onLoad={(e) =>
        !small && e.currentTarget.naturalWidth <= 16 && setFallback(true)
      }
    />
  );
  if (small) return <span className="safari-favicon">{img}</span>;
  return (
    <span
      className="safari-tile safari-tile-icon"
      style={{ width: size, height: size }}
    >
      {img}
    </span>
  );
}

// `url` opens a page in a new tab, e.g. from the App Store's View button;
// `at` lets the same URL be requested again.
export function InternetExplorer({ url: requestedUrl, at }: { url?: string; at?: number }) {
  const wifiOn = useSystemControls((s) => s.wifiOn);
  const safari = useSafari();
  const { load } = safari;
  useEffect(load, [load]);

  const [tabs, setTabs] = useState<Tab[]>(() => [newTab(requestedUrl)]);
  const [activeId, setActiveId] = useState(tabs[0].id);
  const [closed, setClosed] = useState<Tab[]>([]);
  const [reloads, setReloads] = useState<Record<number, number>>({});
  const [sidebarView, setSidebarView] = useState<SidebarView>("tabs");
  const [overview, setOverview] = useState(false);
  const [menu, setMenu] = useState<"share" | "edit" | null>(null);
  const [editing, setEditing] = useState(false);
  const [address, setAddress] = useState("");
  const [highlight, setHighlight] = useState(0);
  const [copied, setCopied] = useState(false);
  const addressRef = useRef<HTMLInputElement>(null);

  // Select the whole address once editing starts and the full URL is shown.
  useLayoutEffect(() => {
    if (editing) addressRef.current?.select();
  }, [editing]);

  const tab = tabs.find((t) => t.id === activeId) ?? tabs[0];
  const url = tab.history[tab.cursor];
  const onStart = url === START_PAGE;

  const titleFor = (u: string) => {
    if (u === START_PAGE) return "Start Page";
    const query = searchQuery(u);
    if (query !== null) return `${query} - Google Search`;
    const known = [...safari.bookmarks, ...safari.readingList].find((p) =>
      sameUrl(p.url, u),
    );
    return known?.title ?? hostLabel(u);
  };
  const page: SafariPage = { url, title: titleFor(url) };
  const bookmarked = safari.bookmarks.some((b) => sameUrl(b.url, url));
  const inReadingList = safari.readingList.some((r) => sameUrl(r.url, url));

  const patchTab = (id: number, patch: (t: Tab) => Partial<Tab>) =>
    setTabs((all) => all.map((t) => (t.id === id ? { ...t, ...patch(t) } : t)));

  const open = (target: string, inTabId = activeId) => {
    setEditing(false);
    setOverview(false);
    setMenu(null);
    addressRef.current?.blur();
    if (target !== START_PAGE) {
      safari.visit({ url: target, title: titleFor(target) });
      const reading = safari.readingList.find((r) => sameUrl(r.url, target));
      if (reading && !reading.read) safari.markRead(target, true);
    }
    patchTab(inTabId, (t) => ({
      history: [...t.history.slice(0, t.cursor + 1), target],
      cursor: t.cursor + 1,
      loading: target !== START_PAGE,
    }));
  };

  const step = (delta: number) =>
    patchTab(activeId, (t) => ({
      cursor: t.cursor + delta,
      loading: t.history[t.cursor + delta] !== START_PAGE,
    }));

  const reload = () => {
    if (onStart) return;
    patchTab(activeId, () => ({ loading: true }));
    setReloads((r) => ({ ...r, [activeId]: (r[activeId] ?? 0) + 1 }));
  };

  const addTab = (target = START_PAGE) => {
    const t = newTab(target);
    setTabs((all) => [...all, t]);
    setActiveId(t.id);
    setOverview(false);
    if (target === START_PAGE) setTimeout(() => addressRef.current?.focus(), 0);
  };

  const firstRequest = useRef(true);
  useEffect(() => {
    if (firstRequest.current) {
      firstRequest.current = false;
      return;
    }
    if (requestedUrl) addTab(requestedUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedUrl, at]);

  const closeTab = (id: number) => {
    const index = tabs.findIndex((t) => t.id === id);
    const gone = tabs[index];
    setClosed((c) => [gone, ...c.filter((t) => t.id !== id)].slice(0, 8));
    if (tabs.length === 1) {
      const fresh = newTab();
      setTabs([fresh]);
      setActiveId(fresh.id);
      return;
    }
    const rest = tabs.filter((t) => t.id !== id);
    setTabs(rest);
    if (id === activeId) setActiveId(rest[Math.min(index, rest.length - 1)].id);
  };

  const reopen = (t: Tab) => {
    setClosed((c) => c.filter((item) => item.id !== t.id));
    setTabs((all) => [
      ...all,
      { ...t, loading: t.history[t.cursor] !== START_PAGE },
    ]);
    setActiveId(t.id);
  };

  // Smart Search field suggestions: the typed site or a search first, then
  // matching bookmarks and history.
  const suggestions = useMemo(() => {
    const text = address.trim();
    if (!editing || !text || text === url) return [];
    const target = resolveAddress(text);
    if (!target) return [];
    const isSearch = searchQuery(target) !== null;
    const first = {
      url: target,
      title: isSearch ? text : hostLabel(target),
      hint: isSearch ? "Search Google" : "Go to site",
    };
    const needle = text.toLowerCase();
    const seen = new Set([target.toLowerCase()]);
    const matches = [...safari.bookmarks, ...safari.history]
      .filter((p) => {
        const key = p.url.toLowerCase();
        if (seen.has(key)) return false;
        if (!p.title.toLowerCase().includes(needle) && !key.includes(needle))
          return false;
        seen.add(key);
        return true;
      })
      .slice(0, 6)
      .map((p) => ({ url: p.url, title: p.title, hint: hostLabel(p.url) }));
    return [first, ...matches];
  }, [address, editing, url, safari.bookmarks, safari.history]);

  const submit = () => {
    const picked = suggestions[highlight]?.url ?? resolveAddress(address);
    if (picked) open(picked);
  };

  const frequent = useMemo(() => {
    const counts = new Map<string, { page: SafariPage; n: number }>();
    for (const h of safari.history) {
      if (searchQuery(h.url) !== null) continue;
      const key = hostLabel(h.url);
      const hit = counts.get(key);
      counts.set(key, { page: hit?.page ?? h, n: (hit?.n ?? 0) + 1 });
    }
    return [...counts.values()]
      .filter(
        ({ page }) =>
          !safari.bookmarks.some(
            (b) => hostLabel(b.url) === hostLabel(page.url),
          ),
      )
      .sort((a, b) => b.n - a.n)
      .slice(0, 8)
      .map(({ page }) => page);
  }, [safari.history, safari.bookmarks]);

  const monthAgo = Date.now() - 30 * 864e5;
  const recent = safari.history.filter((h) => h.at > monthAgo);
  const sitesThisMonth = new Set(recent.map((h) => hostLabel(h.url))).size;

  const historyGroups = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    const groups: { label: string; items: typeof safari.history }[] = [];
    for (const h of safari.history) {
      const label =
        h.at >= today
          ? "Today"
          : h.at >= today - 864e5
            ? "Yesterday"
            : new Date(h.at).toLocaleDateString(undefined, {
                weekday: "long",
                day: "numeric",
                month: "long",
              });
      const group = groups.at(-1);
      if (group?.label === label) group.items.push(h);
      else groups.push({ label, items: [h] });
    }
    return groups;
  }, [safari.history]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard blocked */
    }
    setMenu(null);
  };

  const sidebar = (
    <aside className="mac-sidebar safari-sidebar">
      <div className="safari-sidebar-bar">
        <button
          className="mac-icon-button"
          aria-label="Hide sidebar"
          aria-pressed="true"
          onClick={() => safari.setSidebarOpen(false)}
        >
          <PanelLeft size={17} />
        </button>
      </div>
      <div className="safari-sidebar-list">
        {sidebarView === "tabs" ? (
          <>
            <div className="sidebar-item" data-selected="true">
              <Laptop />
              <span className="flex-1">
                {tabs.length === 1 ? "1 Tab" : `${tabs.length} Tabs`}
              </span>
            </div>
            {tabs.map((t) => (
              <div
                key={t.id}
                className="safari-sidebar-row"
                data-active={t.id === activeId}
              >
                <button
                  className="sidebar-item pl-6"
                  onClick={() => setActiveId(t.id)}
                >
                  {t.history[t.cursor] === START_PAGE ? (
                    <Star
                      size={15}
                      className="shrink-0 text-[var(--mac-secondary)]"
                    />
                  ) : (
                    <SiteIcon url={t.history[t.cursor]} title="" size={16} />
                  )}
                  <span className="truncate">
                    {titleFor(t.history[t.cursor])}
                  </span>
                </button>
                <button
                  aria-label={`Close ${titleFor(t.history[t.cursor])}`}
                  onClick={() => closeTab(t.id)}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            <div className="sidebar-heading">Saved</div>
            <button
              className="sidebar-item"
              onClick={() => setSidebarView("bookmarks")}
            >
              <BookOpen />
              <span className="flex-1">Bookmarks</span>
              <span className="safari-count">{safari.bookmarks.length}</span>
            </button>
            <button
              className="sidebar-item"
              onClick={() => setSidebarView("reading")}
            >
              <Glasses />
              <span className="flex-1">Reading List</span>
              <span className="safari-count">
                {safari.readingList.filter((r) => !r.read).length || ""}
              </span>
            </button>
            <button
              className="sidebar-item"
              onClick={() => setSidebarView("history")}
            >
              <Clock />
              <span className="flex-1">History</span>
            </button>
          </>
        ) : (
          <>
            <button
              className="safari-sidebar-back"
              onClick={() => setSidebarView("tabs")}
            >
              <ChevronLeft size={16} />
              {sidebarView === "bookmarks"
                ? "Bookmarks"
                : sidebarView === "reading"
                  ? "Reading List"
                  : "History"}
            </button>
            {sidebarView === "bookmarks" &&
              (safari.bookmarks.length ? (
                safari.bookmarks.map((b) => (
                  <div
                    key={b.url}
                    className="safari-sidebar-row"
                    data-active={sameUrl(b.url, url)}
                  >
                    <button
                      className="sidebar-item"
                      onClick={() => open(b.url)}
                      title={b.url}
                    >
                      <SiteIcon url={b.url} title={b.title} size={16} />
                      <span className="truncate">{b.title}</span>
                    </button>
                    <button
                      aria-label={`Delete bookmark ${b.title}`}
                      onClick={() => safari.removeBookmark(b.url)}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="safari-sidebar-empty">
                  No bookmarks. Use the Share button to add one.
                </p>
              ))}
            {sidebarView === "reading" &&
              (safari.readingList.length ? (
                safari.readingList.map((r) => (
                  <div
                    key={r.url}
                    className="safari-sidebar-row safari-reading-row"
                    data-active={sameUrl(r.url, url)}
                  >
                    <button
                      className="sidebar-item"
                      onClick={() => open(r.url)}
                    >
                      <span className="safari-unread" data-read={r.read} />
                      <span className="min-w-0 flex-1">
                        <strong className="block truncate">{r.title}</strong>
                        <small className="block truncate">
                          {hostLabel(r.url)}
                        </small>
                      </span>
                    </button>
                    <button
                      aria-label={
                        r.read
                          ? `Mark ${r.title} as unread`
                          : `Mark ${r.title} as read`
                      }
                      onClick={() => safari.markRead(r.url, !r.read)}
                    >
                      <Check size={12} />
                    </button>
                    <button
                      aria-label={`Remove ${r.title}`}
                      onClick={() => safari.removeFromReadingList(r.url)}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="safari-sidebar-empty">
                  Your Reading List is empty. Use the Share button to save pages
                  to read later.
                </p>
              ))}
            {sidebarView === "history" &&
              (historyGroups.length ? (
                <>
                  {historyGroups.map((g) => (
                    <div key={g.label}>
                      <div className="sidebar-heading">{g.label}</div>
                      {g.items.map((h) => (
                        <button
                          key={h.at + h.url}
                          className="sidebar-item"
                          onClick={() => open(h.url)}
                          title={h.url}
                        >
                          <SiteIcon url={h.url} title={h.title} size={16} />
                          <span className="min-w-0 flex-1 truncate">
                            {h.title}
                          </span>
                          <span className="safari-count">
                            {new Date(h.at).toLocaleTimeString(undefined, {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                        </button>
                      ))}
                    </div>
                  ))}
                  <button
                    className="mac-button mx-2 mt-3"
                    onClick={safari.clearHistory}
                  >
                    Clear History…
                  </button>
                </>
              ) : (
                <p className="safari-sidebar-empty">No history yet.</p>
              ))}
          </>
        )}
      </div>
    </aside>
  );

  const startPage = (
    <div className="safari-start">
      <div className="safari-start-inner">
        {safari.sections.favorites && (
          <section>
            <h2>Favourites</h2>
            {safari.bookmarks.length ? (
              <div className="safari-favorites">
                {safari.bookmarks.map((b) => (
                  <button
                    key={b.url}
                    onClick={() => open(b.url)}
                    title={b.description ?? b.url}
                  >
                    <SiteIcon url={b.url} title={b.title} size={60} />
                    <span>{b.title}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="safari-hint">Bookmarks you add appear here.</p>
            )}
          </section>
        )}
        {safari.sections.frequent && frequent.length > 0 && (
          <section>
            <h2>Frequently Visited</h2>
            <div className="safari-favorites">
              {frequent.map((p) => (
                <button key={p.url} onClick={() => open(p.url)} title={p.url}>
                  <SiteIcon url={p.url} title={p.title} size={60} />
                  <span>{p.title}</span>
                </button>
              ))}
            </div>
          </section>
        )}
        {safari.sections.privacy && (
          <section>
            <h2>Privacy Report</h2>
            <div className="safari-card safari-privacy">
              <div className="flex min-w-0 items-start gap-4">
                <ShieldCheck
                  size={44}
                  className="shrink-0 text-[#30b158]"
                  strokeWidth={1.6}
                />
                <p>
                  Every website opens in a sandboxed frame, so it can’t read
                  cookies or data from the rest of this{" "}
                  <span className="desktop-only">Mac</span>
                  <span className="mobile-only">iPhone</span>.
                </p>
              </div>
              <div className="safari-privacy-stats">
                <span className="safari-hint col-span-2">Last 30 days</span>
                <div>
                  <span>Websites visited</span>
                  <strong>{sitesThisMonth}</strong>
                </div>
                <div>
                  <span>Pages opened</span>
                  <strong>{recent.length}</strong>
                </div>
              </div>
            </div>
          </section>
        )}
        {safari.sections.reading && (
          <section>
            <h2>Reading List</h2>
            {safari.readingList.length ? (
              <div className="safari-cards">
                {safari.readingList.slice(0, 6).map((r) => (
                  <button
                    key={r.url}
                    className="safari-card"
                    onClick={() => open(r.url)}
                  >
                    <SiteIcon url={r.url} title={r.title} size={36} />
                    <span className="min-w-0 flex-1 text-left">
                      <strong className="block truncate">{r.title}</strong>
                      <small className="block truncate">
                        {hostLabel(r.url)}
                      </small>
                    </span>
                    {!r.read && (
                      <span className="safari-unread" data-read="false" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className="safari-hint">
                Save a page with Share › Add to Reading List to read it later.
              </p>
            )}
          </section>
        )}
        {safari.sections.closed && closed.length > 0 && (
          <section>
            <h2>Recently Closed Tabs</h2>
            <div className="safari-cards">
              {closed.map((t) => {
                const u = t.history[t.cursor];
                return (
                  <button
                    key={t.id}
                    className="safari-card"
                    onClick={() => reopen(t)}
                  >
                    {u === START_PAGE ? (
                      <span
                        className="safari-tile safari-tile-icon"
                        style={{ width: 36, height: 36 }}
                      >
                        <Star
                          size={18}
                          className="text-[var(--mac-secondary)]"
                        />
                      </span>
                    ) : (
                      <SiteIcon url={u} title={titleFor(u)} size={36} />
                    )}
                    <span className="min-w-0 flex-1 text-left">
                      <strong className="block truncate">{titleFor(u)}</strong>
                      <small className="block truncate">
                        {hostLabel(u) || "Safari"}
                      </small>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );

  // Pinned to the bottom-right corner, outside the scrolling page.
  const editButton = (
    <div className="safari-edit">
      {menu === "edit" && (
        <div className="safari-menu safari-edit-menu" role="menu">
          {START_SECTIONS.map((s) => (
            <label key={s.id}>
              <input
                type="checkbox"
                checked={safari.sections[s.id]}
                onChange={() => safari.toggleSection(s.id)}
              />
              {s.label}
            </label>
          ))}
        </div>
      )}
      <button
        className="mac-button"
        aria-expanded={menu === "edit"}
        onClick={() => setMenu(menu === "edit" ? null : "edit")}
      >
        Edit
      </button>
    </div>
  );

  return (
    <div className="mac-split safari-app" data-sidebar={safari.sidebarOpen}>
      {safari.sidebarOpen && sidebar}
      <div className="finder-main safari-main">
        <div className="mac-toolbar">
          {!safari.sidebarOpen && (
            <button
              className="mac-icon-button"
              aria-label="Show sidebar"
              onClick={() => safari.setSidebarOpen(true)}
            >
              <PanelLeft size={17} />
            </button>
          )}
          <div className="toolbar-group">
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
          </div>
          <form
            className="safari-address"
            data-editing={editing}
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            {editing || onStart ? (
              <Search size={13} className="shrink-0" />
            ) : (
              <SiteIcon key={url} url={url} title="" size={14} />
            )}
            <input
              ref={addressRef}
              aria-label="Smart Search field"
              placeholder="Search or enter website name"
              spellCheck={false}
              value={
                editing
                  ? address
                  : hostLabel(url) && (searchQuery(url) ?? hostLabel(url))
              }
              onFocus={(e) => {
                setEditing(true);
                setAddress(onStart ? "" : url);
                setHighlight(0);
              }}
              onBlur={() => setEditing(false)}
              onChange={(e) => {
                setAddress(e.target.value);
                setHighlight(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") e.currentTarget.blur();
                if (e.key === "ArrowDown" && suggestions.length) {
                  e.preventDefault();
                  setHighlight((h) => (h + 1) % suggestions.length);
                }
                if (e.key === "ArrowUp" && suggestions.length) {
                  e.preventDefault();
                  setHighlight(
                    (h) => (h - 1 + suggestions.length) % suggestions.length,
                  );
                }
              }}
            />
            {!onStart && !editing && (
              <button
                type="button"
                aria-label={tab.loading ? "Stop loading" : "Reload page"}
                onClick={reload}
              >
                {tab.loading ? <X size={13} /> : <RotateCw size={13} />}
              </button>
            )}
            {!onStart && tab.loading && (
              <span
                className="safari-progress"
                key={`${tab.id}-${tab.cursor}-${reloads[tab.id] ?? 0}`}
              />
            )}
            {suggestions.length > 0 && (
              <ul className="safari-menu safari-suggestions" role="listbox">
                {suggestions.map((s, i) => (
                  <li
                    key={s.url}
                    role="option"
                    aria-selected={i === highlight}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setHighlight(i)}
                    onClick={() => open(s.url)}
                  >
                    {i === 0 && searchQuery(s.url) !== null ? (
                      <Search size={14} className="shrink-0" />
                    ) : (
                      <SiteIcon url={s.url} title={s.title} size={16} />
                    )}
                    <span className="truncate">{s.title}</span>
                    <small>{s.hint}</small>
                  </li>
                ))}
              </ul>
            )}
          </form>
          <div className="toolbar-group">
            <button
              className="mac-icon-button"
              aria-label="Share"
              aria-expanded={menu === "share"}
              onClick={() => setMenu(menu === "share" ? null : "share")}
            >
              {copied ? <Check size={16} /> : <Share size={16} />}
            </button>
            <button
              className="mac-icon-button"
              aria-label="New tab"
              onClick={() => addTab()}
            >
              <Plus size={18} />
            </button>
            <button
              className="mac-icon-button"
              aria-label="Show all tabs"
              aria-pressed={overview}
              onClick={() => setOverview(!overview)}
            >
              <Copy size={15} />
            </button>
          </div>
          {menu === "share" && (
            <div className="safari-menu safari-share-menu" role="menu">
              <button role="menuitem" disabled={onStart} onClick={copyLink}>
                <Link size={14} /> Copy Link
              </button>
              <button
                role="menuitem"
                disabled={onStart}
                onClick={() => {
                  safari.toggleBookmark(page);
                  setMenu(null);
                }}
              >
                <Star size={14} />{" "}
                {bookmarked ? "Remove from Favourites" : "Add to Favourites"}
              </button>
              <button
                role="menuitem"
                disabled={onStart}
                onClick={() => {
                  if (inReadingList) safari.removeFromReadingList(url);
                  else safari.addToReadingList(page);
                  setMenu(null);
                }}
              >
                <Glasses size={14} />{" "}
                {inReadingList
                  ? "Remove from Reading List"
                  : "Add to Reading List"}
              </button>
              <hr />
              <button
                role="menuitem"
                disabled={onStart}
                onClick={() => {
                  window.open(url, "_blank", "noopener,noreferrer");
                  setMenu(null);
                }}
              >
                <ExternalLink size={14} /> Open in New Browser Tab
              </button>
            </div>
          )}
        </div>

        {/* Like Safari, the tab bar appears once a second tab is open. */}
        {tabs.length > 1 && !overview && (
          <div className="safari-tabs" role="tablist">
            {tabs.map((t) => {
              const u = t.history[t.cursor];
              return (
                <div key={t.id} data-active={t.id === activeId}>
                  <button
                    aria-label={`Close ${titleFor(u)} tab`}
                    onClick={() => closeTab(t.id)}
                  >
                    <X size={11} />
                  </button>
                  <button
                    role="tab"
                    aria-selected={t.id === activeId}
                    onClick={() => setActiveId(t.id)}
                  >
                    {u !== START_PAGE && (
                      <SiteIcon url={u} title="" size={14} />
                    )}
                    <span>{titleFor(u)}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="safari-body">
          {overview ? (
            <div className="safari-overview">
              {tabs.map((t) => {
                const u = t.history[t.cursor];
                return (
                  <div
                    key={t.id}
                    className="safari-overview-card"
                    data-active={t.id === activeId}
                  >
                    <button
                      className="safari-overview-preview"
                      onClick={() => {
                        setActiveId(t.id);
                        setOverview(false);
                      }}
                    >
                      {u === START_PAGE ? (
                        <Star
                          size={28}
                          className="text-[var(--mac-secondary)]"
                        />
                      ) : (
                        <SiteIcon url={u} title={titleFor(u)} size={56} />
                      )}
                    </button>
                    <div className="safari-overview-title">
                      <button
                        aria-label={`Close ${titleFor(u)} tab`}
                        onClick={() => closeTab(t.id)}
                      >
                        <X size={11} />
                      </button>
                      <span>{titleFor(u)}</span>
                    </div>
                  </div>
                );
              })}
              <button
                className="safari-overview-card safari-overview-new"
                onClick={() => addTab()}
                aria-label="New tab"
              >
                <Plus size={28} />
              </button>
            </div>
          ) : null}
          {/* Every open tab keeps its page loaded, as in Safari. */}
          {tabs.map((t) => {
            const u = t.history[t.cursor];
            const visible = !overview && t.id === activeId;
            if (u === START_PAGE)
              return visible ? (
                <div key={t.id} className="contents">
                  {startPage}
                  {editButton}
                </div>
              ) : null;
            if (!wifiOn)
              return visible ? (
                <div key={t.id} className="empty-state">
                  <WifiOff size={36} />
                  <h2>You Are Not Connected to the Internet</h2>
                  <p>
                    This page can’t be displayed because your computer is
                    offline. Turn Wi-Fi on in Control Center.
                  </p>
                </div>
              ) : null;
            return (
              <div key={t.id} className="safari-page" hidden={!visible}>
                <iframe
                  key={`${u}-${reloads[t.id] ?? 0}`}
                  src={u}
                  title={titleFor(u)}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  onLoad={() => patchTab(t.id, () => ({ loading: false }))}
                />
                <div className="safari-page-note">
                  <span>
                    Page not showing? Some sites don’t allow being opened inside
                    another page.
                  </span>
                  <a href={u} target="_blank" rel="noopener noreferrer">
                    Open in new browser tab <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {menu && (
        <div className="safari-dismiss" onMouseDown={() => setMenu(null)} />
      )}
    </div>
  );
}
