"use client";
import type React from "react";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { DOCK_APP_IDS, getApp } from "@/lib/app-registry";
import { AppIcon } from "@/lib/app-icons";
import { launchApp } from "@/lib/launch-app";
import { useSystemControls } from "@/lib/system-controls";
import { Search } from "lucide-react";
import { useWindowManager } from "@/lib/window-manager";

// Icon canvas sizes; Big Sur artwork fills ~80% of the canvas.
const BASE_SIZE = 56;
const MAX_SIZE = 80;
const MAGNIFY_DISTANCE = 130;

export function Dock({ onSearch }: { onSearch: () => void }) {
  const [compact, setCompact] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(1440);
  const reduceMotion = useSystemControls((s) => s.reduceMotion);
  useEffect(() => {
    const update = () => {
      setCompact(innerWidth < 700);
      setViewportWidth(innerWidth);
    };
    update();
    addEventListener("resize", update);
    return () => removeEventListener("resize", update);
  }, []);
  const mouseX = useMotionValue(Infinity);
  const windows = useWindowManager((state) => state.windows);

  const runningAppIds = new Set(windows.map((w) => w.appId ?? w.id));

  const ids: string[] = compact
    ? ["computer", "projects", "contact", "settings"]
    : [...DOCK_APP_IDS];
  const extra = [...runningAppIds].filter((id) => !ids.includes(id));
  // Like macOS, minimized windows sit at the end of the Dock, before Trash.
  const minimized = compact
    ? []
    : windows.filter((w) => w.isMinimized && !w.isHidden);
  const dockIds = compact
    ? ids
    : [...ids.slice(0, -1), ...extra, ...minimized.map((w) => `window:${w.id}`), "recycle"];
  // As on macOS, a full Dock shrinks its icons to stay on screen.
  const iconCount = dockIds.filter((id) => id !== "separator").length;
  const base = Math.max(
    32,
    Math.min(BASE_SIZE, Math.floor((viewportWidth - 64) / iconCount)),
  );
  return (
    <div className="mac-dock font-mac pointer-events-none fixed inset-x-0 bottom-1.5 z-[9000] flex justify-center">
      <motion.nav
        aria-label="Dock"
        onMouseMove={(e: React.MouseEvent) =>
          !compact && !reduceMotion && mouseX.set(e.clientX)
        }
        onMouseLeave={() => mouseX.set(Infinity)}
        style={{ height: base + 8 }}
        className="pointer-events-auto flex items-end gap-px rounded-[18px] border border-white/25 bg-white/20 px-1.5 pb-1 shadow-[0_0_0_0.5px_rgba(0,0,0,0.25),0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-3xl backdrop-saturate-150"
      >
        {dockIds.map((id, index) =>
          id === "separator" ? (
            <div
              key={`separator-${index}`}
              className="mx-1.5 h-[46px] w-px self-center bg-black/20"
            />
          ) : id.startsWith("window:") ? (
            <DockItem
              key={id}
              appId={
                minimized.find((w) => `window:${w.id}` === id)?.appId ??
                id.slice(7)
              }
              windowId={id.slice(7)}
              base={base}
              mouseX={mouseX}
              isRunning={false}
            />
          ) : (
            <DockItem
              key={id}
              appId={id}
              base={base}
              mouseX={mouseX}
              isRunning={runningAppIds.has(id)}
            />
          ),
        )}
        {compact && (
          <button
            className="flex size-14 items-center justify-center text-white"
            aria-label="All apps and search"
            onClick={onSearch}
          >
            <Search size={26} />
          </button>
        )}
      </motion.nav>
    </div>
  );
}

interface DockItemProps {
  appId: string;
  // Set for a minimized window: shown as a small window with its app's
  // icon, and clicking it restores that window.
  windowId?: string;
  // Resting size; magnified it grows to MAX_SIZE.
  base: number;
  mouseX: MotionValue<number>;
  isRunning: boolean;
}

function DockItem({ appId, windowId, base, mouseX, isRunning }: DockItemProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  // Just the fields this item shows, so other windows changing (focus,
  // minimize) doesn't re-render every Dock icon.
  const runningTitle = useWindowManager(
    (s) => s.windows.find((w) => (w.appId ?? w.id) === appId)?.title,
  );
  const startedAt = useWindowManager(
    (s) => s.windows.find((w) => (w.appId ?? w.id) === appId)?.startedAt,
  );
  const windowTitle = useWindowManager((s) =>
    windowId ? s.windows.find((w) => w.id === windowId)?.title : undefined,
  );
  const app = windowId
    ? windowTitle
      ? { title: windowTitle }
      : undefined
    : getApp(appId) ?? (runningTitle ? { title: runningTitle } : undefined);

  const distance = useTransform(mouseX, (x) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return Infinity;
    return x - (rect.left + rect.width / 2);
  });
  const targetSize = useTransform(
    distance,
    [-MAGNIFY_DISTANCE, 0, MAGNIFY_DISTANCE],
    [base, MAX_SIZE, base],
  );
  const size = useSpring(targetSize, {
    mass: 0.1,
    stiffness: 170,
    damping: 14,
  });
  // The icon is drawn once at full size and scaled, so magnifying doesn't
  // re-render React on every frame of the spring.
  const iconScale = useTransform(size, (value) => value / MAX_SIZE);

  // Bounce while the app launches, like the macOS Dock.
  // Only a window started moments ago bounces; restored ones don't.
  const [bouncing, setBouncing] = useState(false);
  useEffect(() => {
    if (!windowId && startedAt && Date.now() - Date.parse(startedAt) < 1000)
      setBouncing(true);
  }, [startedAt, windowId]);

  if (!app) return null;

  const handleClick = () => {
    const { windows, restoreWindow } = useWindowManager.getState();
    if (windowId) {
      restoreWindow(windowId);
      return;
    }
    const existing = windows.find((w) => (w.appId ?? w.id) === appId);
    if (existing) {
      restoreWindow(existing.id);
      return;
    }
    launchApp(appId);
  };

  return (
    <motion.button
      ref={ref}
      id={windowId ? `dock-window-${windowId}` : `dock-item-${appId}`}
      data-dock-id={windowId ? undefined : appId}
      aria-label={windowId ? `${app.title}, minimized` : app.title}
      onClick={handleClick}
      // The name shows for keyboard focus too, not only on hover.
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      whileTap={{ y: -10 }}
      style={{ width: size, height: size }}
      className="relative flex shrink-0 items-end justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
    >
      {isHovered && (
        <span className="pointer-events-none absolute -top-8 whitespace-nowrap rounded-[6px] border border-black/10 bg-[#ececec]/90 px-2.5 py-[3px] text-[13px] text-[#1d1d1f] dark:border-white/10 dark:bg-[#2c2c2e]/90 dark:text-white shadow-md backdrop-blur">
          {app.title}
        </span>
      )}
      <motion.span
        className="absolute inset-0 flex items-end justify-center"
        animate={bouncing ? { y: [0, -22, 0, -11, 0] } : { y: 0 }}
        transition={
          bouncing
            ? { duration: 0.9, times: [0, 0.25, 0.5, 0.72, 1], ease: "easeOut" }
            : { duration: 0 }
        }
        onAnimationComplete={() => setBouncing(false)}
      >
        <motion.span
          className="flex flex-none origin-bottom"
          style={{ scale: iconScale }}
        >
          {windowId ? (
            <span className="dock-window-thumb">
              <AppIcon appId={appId} size={46} />
            </span>
          ) : (
            <AppIcon appId={appId} size={MAX_SIZE} />
          )}
        </motion.span>
      </motion.span>
      {isRunning && (
        <span className="absolute -bottom-[3px] size-[4px] rounded-full bg-black/75" />
      )}
    </motion.button>
  );
}
