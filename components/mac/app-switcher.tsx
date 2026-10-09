"use client";

import { useEffect, useRef, useState } from "react";
import { AppIcon } from "@/lib/app-icons";
import { getApp } from "@/lib/app-registry";
import { useWindowManager } from "@/lib/window-manager";
import type { WindowState } from "@/lib/types";

// The app switcher: hold ⌥ and press Tab (⌘Tab belongs to the OS) to step
// through open apps, most recent first; let go of ⌥ to switch. ⇧ steps back,
// Esc cancels.
export function AppSwitcher() {
  const [apps, setApps] = useState<WindowState[] | null>(null);
  const [index, setIndex] = useState(0);
  const state = useRef({ apps: null as WindowState[] | null, index: 0 });
  state.current = { apps, index };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const { apps, index } = state.current;
      if (e.key === "Tab" && e.altKey && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        if (apps) {
          setIndex((index + (e.shiftKey ? apps.length - 1 : 1)) % apps.length);
          return;
        }
        const { windows, activeWindowId } = useWindowManager.getState();
        const recent = [...windows].sort((a, b) => {
          if (a.id === activeWindowId) return -1;
          if (b.id === activeWindowId) return 1;
          return (b.lastActiveAt ?? "").localeCompare(a.lastActiveAt ?? "");
        });
        if (recent.length < 1) return;
        setApps(recent);
        setIndex(recent.length > 1 ? (e.shiftKey ? recent.length - 1 : 1) : 0);
      } else if (apps && e.key === "Escape") {
        e.preventDefault();
        setApps(null);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const { apps, index } = state.current;
      if (!apps || e.key !== "Alt") return;
      const target = apps[index];
      setApps(null);
      if (!target) return;
      const wm = useWindowManager.getState();
      if (target.isMinimized) wm.restoreWindow(target.id);
      else wm.setActiveWindow(target.id);
    };
    const cancel = () => setApps(null);
    addEventListener("keydown", onKeyDown);
    addEventListener("keyup", onKeyUp);
    addEventListener("blur", cancel);
    return () => {
      removeEventListener("keydown", onKeyDown);
      removeEventListener("keyup", onKeyUp);
      removeEventListener("blur", cancel);
    };
  }, []);

  if (!apps) return null;
  const selected = apps[index];
  return (
    <div className="app-switcher" role="listbox" aria-label="Open apps">
      {apps.map((w, i) => (
        <div
          key={w.id}
          role="option"
          aria-selected={i === index}
          className="app-switcher-item"
          onPointerEnter={() => setIndex(i)}
          onClick={() => {
            setApps(null);
            const wm = useWindowManager.getState();
            if (w.isMinimized) wm.restoreWindow(w.id);
            else wm.setActiveWindow(w.id);
          }}
        >
          <AppIcon appId={w.appId ?? w.id} size={72} />
        </div>
      ))}
      <span className="app-switcher-name">
        {selected && (getApp(selected.appId ?? selected.id)?.title ?? selected.title)}
      </span>
    </div>
  );
}
