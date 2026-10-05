"use client";
import type React from "react";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { searchApps } from "@/lib/app-registry";
import { AppIcon } from "@/lib/app-icons";
import { launchApp } from "@/lib/launch-app";

interface SpotlightProps {
  open: boolean;
  onClose: () => void;
}

export function Spotlight({ open, onClose }: SpotlightProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => searchApps(query).slice(0, 8), [query]);

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
    launchApp(appId);
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
            className="absolute inset-x-0 top-[18%] mx-auto w-[640px] max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl border border-white/40 bg-white/70 shadow-[0_24px_80px_rgba(0,0,0,0.4)] backdrop-blur-2xl backdrop-saturate-150"
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
                className="flex-1 bg-transparent text-xl text-[#1d1d1f] outline-none placeholder:text-[#8e8e93]"
                aria-label="Search apps"
              />
            </div>
            {results.length > 0 ? (
              <ul className="max-h-[360px] overflow-y-auto border-t border-black/10 p-1.5">
                {results.map((app, index) => (
                  <li key={app.id}>
                    <button
                      onMouseEnter={() => setSelected(index)}
                      onClick={() => launch(app.id)}
                      className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-1.5 text-left ${
                        index === selected
                          ? "bg-[#0a63e1] text-white"
                          : "text-[#1d1d1f]"
                      }`}
                    >
                      <AppIcon appId={app.id} size={30} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {app.title}
                        </span>
                        <span
                          className={`block truncate text-xs ${
                            index === selected ? "text-white/80" : "text-[#6e6e73]"
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
