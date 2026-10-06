"use client";
import type React from "react";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { searchApps, getApp } from "@/lib/app-registry";
import { AppIcon } from "@/lib/app-icons";
import { launchApp } from "@/lib/launch-app";
import { useWindowManager } from "@/lib/window-manager";

interface SpotlightProps {
  open: boolean;
  onClose: () => void;
}

export function Spotlight({ open, onClose }: SpotlightProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const windows = useWindowManager((s) => s.windows);
  const results = useMemo(
    () => [
      ...searchApps(query),
      ...windows
        .filter(
          (w) =>
            !getApp(w.appId ?? w.id) &&
            w.title.toLowerCase().includes(query.toLowerCase()),
        )
        .map((w) => ({ id: w.id, title: w.title, description: "Open window" })),
    ],
    [query, windows],
  );

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

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[10001]" onMouseDown={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.1 } }}
            transition={{ duration: 0.15 }}
            className="font-mac absolute inset-x-0 top-[22%] mx-auto w-[680px] max-w-[calc(100vw-32px)] overflow-hidden rounded-[14px] border border-black/10 bg-[#ececec]/80 dark:border-white/10 dark:bg-[#2c2c2e]/85 shadow-[0_24px_80px_rgba(0,0,0,0.35),inset_0_0_0_0.5px_rgba(255,255,255,0.6)] backdrop-blur-3xl backdrop-saturate-150"
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
                placeholder="Spotlight Search"
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
                      <AppIcon appId={app.id} size={30} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {app.title}
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
