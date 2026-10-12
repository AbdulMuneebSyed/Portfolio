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
import { useWindowManager } from "@/lib/window-manager";
import { useViewport } from "@/lib/phone";
import { useShallow } from "zustand/react/shallow";

// Icon canvas sizes; Big Sur artwork fills ~80% of the canvas.
const BASE_SIZE = 56;
const MAX_SIZE = 80;
const MAGNIFY_DISTANCE = 130;

// The Mac Dock (the phone has its own, in mobile-home.tsx).
export function Dock() {
  const { width: viewportWidth } = useViewport();
  const reduceMotion = useSystemControls((s) => s.reduceMotion);
  const mouseX = useMotionValue(Infinity);
  // Only what the Dock shows, compared shallowly, so moving or focusing a
  // window doesn't re-render it.
  const runningAppIds = new Set(
    useWindowManager(useShallow((s) => s.windows.map((w) => w.appId ?? w.id))),
  );

  const ids: string[] = [...DOCK_APP_IDS];
  const extra = [...runningAppIds].filter((id) => !ids.includes(id));
  const dockIds = [...ids.slice(0, -1), ...extra, "recycle"];
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
          !reduceMotion && mouseX.set(e.clientX)
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
      </motion.nav>
    </div>
  );
}

interface DockItemProps {
  appId: string;
  // Resting size; magnified it grows to MAX_SIZE.
  base: number;
  mouseX: MotionValue<number>;
  isRunning: boolean;
}

function DockItem({ appId, base, mouseX, isRunning }: DockItemProps) {
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
  const app = getApp(appId) ?? (runningTitle ? { title: runningTitle } : undefined);

  // Distance from the pointer to this icon's resting centre, measured once
  // when the pointer enters the Dock (and forgotten when it leaves) instead
  // of on every mousemove while the icons are resizing.
  const restCenter = useRef<number | null>(null);
  const distance = useTransform(mouseX, (x) => {
    if (x === Infinity) {
      restCenter.current = null;
      return Infinity;
    }
    if (restCenter.current === null) {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return Infinity;
      restCenter.current = rect.left + rect.width / 2;
    }
    return x - restCenter.current;
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
          <AppIcon appId={appId} size={MAX_SIZE} />
        </motion.span>
      </motion.span>
      {isRunning && (
        <span className="absolute -bottom-[3px] size-[4px] rounded-full bg-black/75" />
      )}
    </motion.button>
  );
}
