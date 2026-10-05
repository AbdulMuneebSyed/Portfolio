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

const BASE_SIZE = 50;
const MAX_SIZE = 78;
const MAGNIFY_DISTANCE = 140;

export function Dock() {
  const mouseX = useMotionValue(Infinity);
  const windows = useWindowManager((state) => state.windows);

  const runningAppIds = new Set(windows.map((w) => w.appId ?? w.id));

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-2 z-[9000] flex justify-center">
      <motion.nav
        aria-label="Dock"
        onMouseMove={(e: React.MouseEvent) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="pointer-events-auto flex h-[66px] items-end gap-2 rounded-[22px] border border-white/30 bg-white/25 px-2.5 pb-2 shadow-[0_10px_40px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-2xl backdrop-saturate-150"
      >
        {DOCK_APP_IDS.map((id, index) =>
          id === "separator" ? (
            <div
              key={`separator-${index}`}
              className="mx-1 h-10 w-px self-center bg-white/40"
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
        <span className="pointer-events-none absolute -top-9 whitespace-nowrap rounded-md border border-black/10 bg-[#f2f2f2]/90 px-2.5 py-1 text-xs font-medium text-[#1d1d1f] shadow-md backdrop-blur">
          {app.title}
        </span>
      )}
      <AppIcon appId={appId} size={renderSize} />
      {isRunning && (
        <span className="absolute -bottom-1.5 size-1 rounded-full bg-black/70 shadow-[0_0_2px_rgba(255,255,255,0.8)]" />
      )}
    </motion.button>
  );
}
