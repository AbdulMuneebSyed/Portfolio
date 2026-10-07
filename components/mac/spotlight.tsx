"use client";
import type React from "react";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import {
  APP_REGISTRY,
  getApp,
  isAppInstalled,
  searchApps,
} from "@/lib/app-registry";
import { AppIcon, PhoneAppIcon } from "@/lib/app-icons";
import { phoneApp, phoneTitle, usePhone } from "@/lib/phone";
import { launchApp } from "@/lib/launch-app";
import { useWindowManager } from "@/lib/window-manager";

const SUGGESTED = [
  "about",
  "projects",
  "resume",
  "contact",
  "github-activity",
  "ie",
  "music",
  "settings",
];

type Result = { id: string; title: string; description: string };

// iPhone Search: the field at the top with Cancel, Siri Suggestions while
// it's empty, then a Top Hit and the other matching apps.
function PhoneSearch({
  query,
  setQuery,
  results,
  inputRef,
  launch,
  onClose,
}: {
  query: string;
  setQuery: (q: string) => void;
  results: Result[];
  inputRef: React.RefObject<HTMLInputElement>;
  launch: (id: string) => void;
  onClose: () => void;
}) {
  const [top, ...rest] = results;
  const name = (r: Result) => phoneTitle(r.id, r.title);
  return (
    <motion.div
      className="psearch"
      role="dialog"
      aria-label="Search"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={(e: React.MouseEvent) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="psearch-body"
        initial={{ y: 24 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 36 }}
      >
        <form
          className="psearch-bar"
          onSubmit={(e) => {
            e.preventDefault();
            if (top) launch(top.id);
          }}
        >
          <label>
            <Search size={17} />
            <input
              ref={inputRef}
              type="search"
              enterKeyHint="go"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && onClose()}
              placeholder="Search"
              aria-label="Search apps"
            />
          </label>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </form>

        {!query.trim() ? (
          <section>
            <h2>Siri Suggestions</h2>
            <div className="psearch-suggestions">
              {SUGGESTED.filter((id) => getApp(id)).map((id) => (
                <button key={id} onClick={() => launch(id)}>
                  <PhoneAppIcon appId={id} size={60} />
                  <span>{phoneTitle(id, getApp(id)!.title)}</span>
                </button>
              ))}
            </div>
          </section>
        ) : !top ? (
          <p className="psearch-empty">No Results for “{query}”</p>
        ) : (
          <>
            <section>
              <h2>Top Hit</h2>
              <button className="psearch-top" onClick={() => launch(top.id)}>
                <PhoneAppIcon appId={top.id} size={60} />
                <span>
                  <strong>{name(top)}</strong>
                  <small>{top.description}</small>
                </span>
              </button>
            </section>
            {rest.length > 0 && (
              <section>
                <h2>Apps</h2>
                <div className="psearch-list">
                  {rest.map((r) => (
                    <button key={r.id} onClick={() => launch(r.id)}>
                      <PhoneAppIcon appId={r.id} size={40} />
                      <span>
                        <strong>{name(r)}</strong>
                        <small>{r.description}</small>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

interface SpotlightProps {
  open: boolean;
  onClose: () => void;
}

export function Spotlight({ open, onClose }: SpotlightProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const windows = useWindowManager((s) => s.windows);
  const phone = usePhone();
  const results = useMemo(
    () => [
      ...searchApps(query),
      // On a phone, apps are also found by their iPhone names ("Files").
      ...(phone && query.trim()
        ? APP_REGISTRY.filter(
            (app) =>
              phoneTitle(app.id, app.title) !== app.title &&
              phoneTitle(app.id, app.title)
                .toLowerCase()
                .includes(query.trim().toLowerCase()) &&
              !searchApps(query).some((hit) => hit.id === app.id),
          )
        : []),
      // Apps not installed yet open on their App Store page.
      ...(query.trim()
        ? APP_REGISTRY.filter(
            (app) =>
              app.installable &&
              !isAppInstalled(app.id) &&
              [app.title, ...(app.launchAliases ?? [])].some((name) =>
                name.toLowerCase().includes(query.trim().toLowerCase()),
              ),
          ).map((app) => ({
            id: app.id,
            title: app.title,
            description: "Get in the App Store",
          }))
        : []),
      ...windows
        .filter(
          (w) =>
            !getApp(w.appId ?? w.id) &&
            w.title.toLowerCase().includes(query.toLowerCase()),
        )
        .map((w) => ({ id: w.id, title: w.title, description: "Open window" })),
    ],
    [query, windows, phone],
  );
  // On a phone, apps whose iPhone name starts with the query lead.
  const q = query.trim().toLowerCase();
  const phoneResults =
    phone && q
      ? results.filter((r) => !phoneApp(r.id)?.macOnly).sort(
          (a, b) =>
            Number(!phoneTitle(a.id, a.title).toLowerCase().startsWith(q)) -
            Number(!phoneTitle(b.id, b.title).toLowerCase().startsWith(q)),
        )
      : results;

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setSelected(0);
    // Focus after the open animation mounts the input.
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => setSelected(0), [query]);

  const launch = (appId: string) => {
    if (getApp(appId)) launchApp(appId);
    else useWindowManager.getState().restoreWindow(appId);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selected]) {
      launch(results[selected].id);
    }
  };

  if (phone)
    return (
      <AnimatePresence>
        {open && (
          <PhoneSearch
            query={query}
            setQuery={setQuery}
            results={phoneResults}
            inputRef={inputRef}
            launch={launch}
            onClose={onClose}
          />
        )}
      </AnimatePresence>
    );

  return (
    <AnimatePresence>
      {open && (
        <div className="ios-search-backdrop fixed inset-0 z-[10001]" onMouseDown={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.1 } }}
            transition={{ duration: 0.15 }}
            className="ios-search-panel font-mac absolute inset-x-0 top-[22%] mx-auto w-[680px] max-w-[calc(100vw-32px)] overflow-hidden rounded-[14px] border border-black/10 bg-[#ececec]/80 dark:border-white/10 dark:bg-[#2c2c2e]/85 shadow-[0_24px_80px_rgba(0,0,0,0.35),inset_0_0_0_0.5px_rgba(255,255,255,0.6)] backdrop-blur-3xl backdrop-saturate-150"
            onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
            role="dialog"
            aria-label="Spotlight search"
          >
            <div className="flex items-center gap-3 px-4 py-3">
              <Search className="size-5 text-[#6e6e73]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search apps"
                className="min-w-0 flex-1 bg-transparent text-[22px] font-light text-[#1d1d1f] outline-none dark:text-white placeholder:text-[#8e8e93]"
                aria-label="Search apps"
              />
            </div>
            {results.length > 0 ? (
              <ul className="max-h-[min(360px,55dvh)] overflow-y-auto border-t border-black/10 p-1.5 dark:border-white/10">
                {results.map((app, index) => (
                  <li key={app.id}>
                    <button
                      onMouseEnter={() => setSelected(index)}
                      onClick={() => launch(app.id)}
                      className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-1.5 text-left ${
                        index === selected
                          ? "bg-[#0a82ff] text-white"
                          : "text-[#1d1d1f] dark:text-white"
                      }`}
                    >
                      {phone ? (
                        <PhoneAppIcon appId={app.id} size={30} />
                      ) : (
                        <AppIcon appId={app.id} size={30} />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {phone ? phoneTitle(app.id, app.title) : app.title}
                        </span>
                        <span
                          className={`block truncate text-xs ${
                            index === selected
                              ? "text-white/80"
                              : "text-[#6e6e73] dark:text-white/55"
                          }`}
                        >
                          {app.description}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="border-t border-black/10 px-4 py-6 text-center text-sm text-[#6e6e73]">
                No results for “{query}”
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
