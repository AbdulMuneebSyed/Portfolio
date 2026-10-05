"use client";
import type React from "react";

import { useRef, useState } from "react";
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
import { useWindowManager } from "@/lib/window-manager";

// Icon canvas sizes; Big Sur artwork fills ~80% of the canvas.
const BASE_SIZE = 56;
const MAX_SIZE = 80;
const MAGNIFY_DISTANCE = 130;

export function Dock() {
  const mouseX = useMotionValue(Infinity);
  const windows = useWindowManager((state) => state.windows);

  const runningAppIds = new Set(windows.map((w) => w.appId ?? w.id));

  return (
    <div className="font-mac pointer-events-none fixed inset-x-0 bottom-1.5 z-[9000] flex justify-center">
      <motion.nav
        aria-label="Dock"
        onMouseMove={(e: React.MouseEvent) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="pointer-events-auto flex h-[64px] items-end gap-px rounded-[18px] border border-white/25 bg-white/20 px-1.5 pb-1 shadow-[0_0_0_0.5px_rgba(0,0,0,0.25),0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-3xl backdrop-saturate-150"
      >
        {DOCK_APP_IDS.map((id, index) =>
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
          )
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
  const app = getApp(appId);

  const distance = useTransform(mouseX, (x) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return Infinity;
    return x - (rect.left + rect.width / 2);
  });
  const targetSize = useTransform(
    distance,
    [-MAGNIFY_DISTANCE, 0, MAGNIFY_DISTANCE],
    [BASE_SIZE, MAX_SIZE, BASE_SIZE]
  );
  const size = useSpring(targetSize, { mass: 0.1, stiffness: 170, damping: 14 });
  const [renderSize, setRenderSize] = useState(BASE_SIZE);
  useMotionValueEvent(size, "change", (value) =>
    setRenderSize(Math.round(value))
  );

  if (!app) return null;

  const handleClick = () => {
    const { windows, restoreWindow } = useWindowManager.getState();
    const existing = windows.find((w) => (w.appId ?? w.id) === appId);
    if (existing?.isMinimized) {
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
      className="relative flex shrink-0 items-end justify-center focus:outline-none"
    >
      {isHovered && (
        <span className="pointer-events-none absolute -top-8 whitespace-nowrap rounded-[6px] border border-black/10 bg-[#ececec]/90 px-2.5 py-[3px] text-[13px] text-[#1d1d1f] shadow-md backdrop-blur">
          {app.title}
        </span>
      )}
      <AppIcon appId={appId} size={renderSize} />
      {isRunning && (
        <span className="absolute -bottom-[3px] size-[4px] rounded-full bg-black/75" />
      )}
    </motion.button>
  );
}
