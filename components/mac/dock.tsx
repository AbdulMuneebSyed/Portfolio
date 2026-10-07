"use client";
import type React from "react";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
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
import { useInstalledApps } from "@/lib/app-store/installed";
import { MUNEEBOS_VERSION } from "@/lib/app-store/version";

// Icon canvas sizes; Big Sur artwork fills ~80% of the canvas.
const BASE_SIZE = 56;
const MAX_SIZE = 80;
const MAGNIFY_DISTANCE = 130;

export function Dock({ onSearch }: { onSearch: () => void }) {
  const [compact, setCompact] = useState(false);
  const reduceMotion = useSystemControls((s) => s.reduceMotion);
  useEffect(() => {
    const update = () => setCompact(innerWidth < 700);
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
  const dockIds = compact ? ids : [...ids.slice(0, -1), ...extra, "recycle"];
  return (
    <div className="mac-dock font-mac pointer-events-none fixed inset-x-0 bottom-1.5 z-[9000] flex justify-center">
      <motion.nav
        aria-label="Dock"
        onMouseMove={(e: React.MouseEvent) =>
          !compact && !reduceMotion && mouseX.set(e.clientX)
        }
        onMouseLeave={() => mouseX.set(Infinity)}
        className="pointer-events-auto flex h-[64px] items-end gap-px rounded-[18px] border border-white/25 bg-white/20 px-1.5 pb-1 shadow-[0_0_0_0.5px_rgba(0,0,0,0.25),0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-3xl backdrop-saturate-150"
      >
        {dockIds.map((id, index) =>
          id === "separator" ? (
            <div
              key={`separator-${index}`}
              className="mx-1.5 h-[46px] w-px self-center bg-black/20"
            />
          ) : (
            <DockItem
              key={id}
              appId={id}
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
  mouseX: MotionValue<number>;
  isRunning: boolean;
}

function DockItem({ appId, mouseX, isRunning }: DockItemProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const runningWindow = useWindowManager((s) =>
    s.windows.find((w) => (w.appId ?? w.id) === appId),
  );
  const app = getApp(appId) ?? runningWindow;
  // The App Store shows a badge until the MuneebOS update is installed.
  const loadInstalled = useInstalledApps((s) => s.load);
  useEffect(loadInstalled, [loadInstalled]);
  const badge = useInstalledApps(
    (s) =>
      appId === "app-store" && s.loaded && s.updatedTo !== MUNEEBOS_VERSION,
  );

  const distance = useTransform(mouseX, (x) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return Infinity;
    return x - (rect.left + rect.width / 2);
  });
  const targetSize = useTransform(
    distance,
    [-MAGNIFY_DISTANCE, 0, MAGNIFY_DISTANCE],
    [BASE_SIZE, MAX_SIZE, BASE_SIZE],
  );
  const size = useSpring(targetSize, {
    mass: 0.1,
    stiffness: 170,
    damping: 14,
  });
  const [renderSize, setRenderSize] = useState(BASE_SIZE);
  useMotionValueEvent(size, "change", (value) =>
    setRenderSize(Math.round(value)),
  );

  // Bounce while the app launches, like the macOS Dock.
  // Only a window started moments ago bounces; restored ones don't.
  const [bouncing, setBouncing] = useState(false);
  const startedAt = runningWindow?.startedAt;
  useEffect(() => {
    if (startedAt && Date.now() - Date.parse(startedAt) < 1000)
      setBouncing(true);
  }, [startedAt]);

  if (!app) return null;

  const handleClick = () => {
    const { windows, restoreWindow } = useWindowManager.getState();
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
      id={`dock-item-${appId}`}
      data-dock-id={appId}
      aria-label={app.title}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
        className="flex"
        animate={bouncing ? { y: [0, -22, 0, -11, 0] } : { y: 0 }}
        transition={
          bouncing
            ? { duration: 0.9, times: [0, 0.25, 0.5, 0.72, 1], ease: "easeOut" }
            : { duration: 0 }
        }
        onAnimationComplete={() => setBouncing(false)}
      >
        <AppIcon appId={appId} size={renderSize} />
      </motion.span>
      {badge && (
        <span
          className="absolute right-0 top-0 flex size-[18px] items-center justify-center rounded-full bg-[#ff3b30] text-[11px] font-bold text-white shadow"
          aria-label="1 update available"
        >
          1
        </span>
      )}
      {isRunning && (
        <span className="absolute -bottom-[3px] size-[4px] rounded-full bg-black/75" />
      )}
    </motion.button>
  );
}
