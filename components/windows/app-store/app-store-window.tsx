"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowDownToLine,
  Check,
  ChevronLeft,
  Hammer,
  Joystick,
  Layers,
  LayoutGrid,
  Newspaper,
  PenTool,
  Rocket,
  Search,
  Send,
  Share,
  Star,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  STORE_ITEMS,
  getStoreItem,
} from "@/lib/app-store/catalog";
import { TAB_TITLES } from "@/lib/app-store/editorial";
import {
  StoreNavContext,
  routeTitle,
  type Route,
  type SidebarTab,
  type StoreNav,
} from "./nav";
import { ProductPage } from "./product-page";
import {
  AccountPage,
  CategoriesPage,
  CategoryPage,
  SearchPage,
  SeeAllPage,
  TabPage,
  UpdatesPage,
} from "./pages";

const SIDEBAR: { id: SidebarTab; label: string; icon: LucideIcon }[] = [
  { id: "discover", label: "Discover", icon: Star },
  { id: "arcade", label: "Arcade", icon: Joystick },
  { id: "create", label: "Create", icon: PenTool },
  { id: "work", label: "Work", icon: Send },
  { id: "play", label: "Play", icon: Rocket },
  { id: "develop", label: "Develop", icon: Hammer },
  { id: "categories", label: "Categories", icon: LayoutGrid },
  { id: "updates", label: "Updates", icon: ArrowDownToLine },
];

// The iPhone App Store's bottom tab bar.
const PHONE_TABS: { id: SidebarTab | "search"; label: string; icon: LucideIcon }[] = [
  { id: "discover", label: "Today", icon: Newspaper },
  { id: "arcade", label: "Arcade", icon: Joystick },
  { id: "categories", label: "Apps", icon: Layers },
  { id: "updates", label: "Updates", icon: ArrowDownToLine },
  { id: "search", label: "Search", icon: Search },
];

const TITLES: Record<string, string> = {
  ...TAB_TITLES,
  categories: "Categories",
  updates: "Updates",
  account: "Account",
  ...Object.fromEntries(STORE_ITEMS.map((item) => [item.id, item.name])),
};

const NARROW_WIDTH = 640;

function initialStack(route?: Route): Route[] {
  if (!route) return [{ kind: "tab", id: "discover" }];
  if (route.kind === "tab") return [route];
  return [{ kind: "tab", id: "discover" }, route];
}

// Deep links arrive as window metadata: { route, at }. `at` changes on every
// request so asking for the page that's already showing still works.
export function AppStoreWindow({ route, at }: { route?: Route; at?: number }) {
  const [stack, setStack] = useState<Route[]>(() => initialStack(route));
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [copied, setCopied] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const main = useRef<HTMLDivElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const scrollPositions = useRef<number[]>([]);

  const top = stack[stack.length - 1];
  const baseTab = stack[0].kind === "tab" ? stack[0].id : "discover";

  const firstRequest = useRef(true);
  useEffect(() => {
    if (firstRequest.current) {
      firstRequest.current = false;
      return;
    }
    if (route) setStack(initialStack(route));
  }, [route, at]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const observer = new ResizeObserver(() =>
      setNarrow(el.clientWidth < NARROW_WIDTH),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Each page in the stack keeps its scroll position for when Back returns.
  useLayoutEffect(() => {
    const el = main.current;
    if (!el) return;
    el.scrollTop = scrollPositions.current[stack.length - 1] ?? 0;
    setScrolled(el.scrollTop > 40);
  }, [stack]);

  const push = (next: Route) => {
    scrollPositions.current[stack.length - 1] = main.current?.scrollTop ?? 0;
    scrollPositions.current.length = stack.length;
    setStack((s) => [...s, next]);
  };
  const back = () => {
    if (stack.length < 2) return;
    if (top.kind === "search") setQuery("");
    setStack((s) => s.slice(0, -1));
  };
  const selectTab = (id: SidebarTab) => {
    scrollPositions.current = [];
    setQuery("");
    setStack([{ kind: "tab", id }]);
  };
  const search = (value: string) => {
    setQuery(value);
    const q = value.trim();
    scrollPositions.current.length = 1;
    setStack((s) => {
      const base = s.filter((r) => r.kind === "tab").slice(0, 1);
      return q ? [...base, { kind: "search", query: q }] : base;
    });
  };

  const nav: StoreNav = useMemo(
    () => ({
      push: (next) => {
        if (next.kind === "search") setQuery(next.query);
        push(next);
      },
      openItem: (id) => push({ kind: "product", id }),
      narrow,
    }),
    // push reads the current stack length.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stack, narrow],
  );

  const productItem = top.kind === "product" ? getStoreItem(top.id) : undefined;
  const title = routeTitle(top, TITLES);

  const share = async () => {
    if (!productItem) return;
    const url = `${location.origin}/?app=${encodeURIComponent(productItem.id)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  const page = (() => {
    switch (top.kind) {
      case "product":
        return productItem ? (
          <ProductPage key={productItem.id} item={productItem} />
        ) : (
          <p className="store-empty">This item isn&apos;t available.</p>
        );
      case "category":
        return <CategoryPage category={top.id} />;
      case "see-all":
        return <SeeAllPage itemIds={top.itemIds} />;
      case "search":
        return <SearchPage query={top.query} />;
      case "tab":
        if (top.id === "categories") return <CategoriesPage />;
        if (top.id === "updates") return <UpdatesPage />;
        if (top.id === "account") return <AccountPage />;
        return <TabPage tab={top.id} />;
    }
  })();

  const searchField = (
    <label className="store-search">
      <Search size={15} />
      <input
        ref={searchInput}
        aria-label="Search the App Store"
        placeholder="Search"
        value={query}
        onChange={(e) => search(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            search("");
            e.currentTarget.blur();
          }
        }}
      />
      {query && (
        <button aria-label="Clear search" onClick={() => search("")}>
          <X size={13} />
        </button>
      )}
    </label>
  );

  return (
    <StoreNavContext.Provider value={nav}>
      <div
        ref={root}
        className="mac-split app-store"
        data-narrow={narrow}
        onKeyDown={(e) => {
          const mod = e.metaKey || e.ctrlKey;
          if (mod && e.key.toLowerCase() === "f") {
            e.preventDefault();
            searchInput.current?.focus();
          } else if (mod && e.key === "[") {
            e.preventDefault();
            back();
          }
        }}
      >
        {!narrow && (
          <aside className="mac-sidebar store-sidebar">
            {searchField}
            <nav aria-label="App Store">
              {SIDEBAR.map((item) => (
                <button
                  key={item.id}
                  className="sidebar-item"
                  data-selected={baseTab === item.id && top.kind !== "search"}
                  aria-current={baseTab === item.id ? "page" : undefined}
                  onClick={() => selectTab(item.id)}
                >
                  <item.icon />
                  <span className="flex-1">{item.label}</span>
                </button>
              ))}
            </nav>
            <button
              className="store-account"
              data-selected={baseTab === "account"}
              onClick={() => selectTab("account")}
            >
              <Image src="/avatar-256.jpg" alt="" width={34} height={34} />
              <span>Syed Abdul Muneeb</span>
            </button>
          </aside>
        )}
        <main className="store-main">
          <div className="mac-toolbar store-toolbar" data-scrolled={scrolled}>
            {stack.length > 1 && (
              <button className="mac-icon-button" aria-label="Back" onClick={back}>
                <ChevronLeft size={18} />
              </button>
            )}
            <h2 aria-hidden={!scrolled}>{scrolled ? title : ""}</h2>
            {productItem && (
              <button
                className="mac-icon-button"
                aria-label={copied ? "Link copied" : `Copy link to ${productItem.name}`}
                title="Copy link"
                onClick={share}
              >
                {copied ? <Check size={16} /> : <Share size={16} />}
              </button>
            )}
          </div>
          <div
            ref={main}
            className="store-scroll"
            onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 40)}
          >
            {narrow && top.kind !== "product" && (
              <div className="store-narrow-nav">
                {searchField}
                <nav aria-label="App Store sections">
                  {[...SIDEBAR, { id: "account" as const, label: "Account" }].map((item) => (
                    <button
                      key={item.id}
                      aria-pressed={baseTab === item.id && top.kind !== "search"}
                      onClick={() => selectTab(item.id)}
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>
            )}
            <div className="store-page">
              {top.kind !== "product" && <h1 className="store-title">{title}</h1>}
              {page}
            </div>
          </div>
          <nav className="store-phone-tabs mobile-only" aria-label="App Store">
            {PHONE_TABS.map((tab) => {
              const selected =
                tab.id === "search"
                  ? top.kind === "search"
                  : baseTab === tab.id && top.kind !== "search";
              return (
                <button
                  key={tab.id}
                  aria-pressed={selected}
                  onClick={() => {
                    if (tab.id !== "search") return selectTab(tab.id);
                    main.current?.scrollTo({ top: 0 });
                    searchInput.current?.focus();
                  }}
                >
                  <tab.icon size={23} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </main>
      </div>
    </StoreNavContext.Provider>
  );
}
