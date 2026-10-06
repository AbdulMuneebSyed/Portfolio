"use client";

import { useEffect, useRef, useState } from "react";
import type { TouchEvent } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { BatteryCharging, BatteryFull, Keyboard, Wifi } from "lucide-react";
import avatar from "../../public/avatar-256.jpg";
import { DEFAULT_WALLPAPER } from "@/lib/wallpapers";
import { useWindowManager } from "@/lib/window-manager";
import { useBatteryStatus } from "@/lib/use-battery";

interface LockScreenProps {
  onUnlock: () => void;
}

export function LockScreen({ onUnlock }: LockScreenProps) {
  const [now, setNow] = useState<Date | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const hasUnlockedRef = useRef(false);
  const touchStartY = useRef(0);
  const savedWallpaper = useWindowManager((state) => state.wallpaper);
  const battery = useBatteryStatus();

  useEffect(() => {
    useWindowManager.getState().loadState();
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const unlock = () => {
    if (hasUnlockedRef.current) return;
    hasUnlockedRef.current = true;
    setIsUnlocking(true);
    window.setTimeout(onUnlock, 450);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") unlock();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // macOS lock screen style: 12-hour time without am/pm, e.g. "6:56".
  const time = now
    ? `${now.getHours() % 12 || 12}:${String(now.getMinutes()).padStart(2, "0")}`
    : "";
  const date =
    now?.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }) ?? "";

  // Translucent white so the wallpaper tints the text, like macOS vibrancy.
  const vibrantText = "text-white/70 [text-shadow:0_1px_8px_rgba(0,0,0,0.08)]";

  return (
    <motion.div
      animate={{ opacity: isUnlocking ? 0 : 1, scale: isUnlocking ? 1.04 : 1 }}
      transition={{ duration: 0.45, ease: "easeInOut" }}
      className="font-mac relative flex h-dvh w-dvw cursor-default select-none flex-col items-center overflow-hidden text-white"
      style={{
        backgroundImage: savedWallpaper || DEFAULT_WALLPAPER,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      onClick={unlock}
      onTouchStart={(event: TouchEvent<HTMLDivElement>) => {
        touchStartY.current = event.touches[0]?.clientY ?? 0;
      }}
      onTouchEnd={(event: TouchEvent<HTMLDivElement>) => {
        if (touchStartY.current - (event.changedTouches[0]?.clientY ?? 0) > 40)
          unlock();
      }}
    >
      {/* Status icons, top-right */}
      <div className="ios-lock-status absolute right-4 top-0 z-10 flex h-[30px] items-center gap-4 text-[13px] font-medium text-white">
        <span className="ios-lock-keyboard flex items-center gap-1.5">
          ABC <Keyboard className="size-[15px]" strokeWidth={1.75} />
        </span>
        {battery?.charging ? (
          <BatteryCharging className="size-[19px]" strokeWidth={1.75} />
        ) : (
          <BatteryFull className="size-[19px]" strokeWidth={1.75} />
        )}
        <Wifi className="size-4" strokeWidth={2.25} />
      </div>

      <div className="ios-lock-clock relative z-10 mt-[8.5vh] flex flex-col items-center text-center">
        <div className={`text-[clamp(22px,3.3vh,34px)] font-semibold ${vibrantText}`}>
          {date}
        </div>
        <div
          className={`-mt-[0.5vh] text-[clamp(96px,15.5vh,156px)] font-bold leading-[1] tracking-[-0.025em] ${vibrantText}`}
        >
          {time}
        </div>
        {battery && (
          <div className={`mt-[1.5vh] flex items-center gap-2 text-[clamp(16px,2.4vh,24px)] font-semibold ${vibrantText}`}>
            {battery.charging ? (
              <BatteryCharging className="size-[1.2em]" strokeWidth={2} />
            ) : (
              <BatteryFull className="size-[1.2em]" strokeWidth={2} />
            )}
            {battery.level}%
          </div>
        )}
      </div>

      <div className="ios-lock-profile relative z-10 mt-auto mb-[5.5vh] flex flex-col items-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            unlock();
          }}
          aria-label="Unlock"
          className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Image
            src={avatar}
            alt="Syed Abdul Muneeb"
            width={52}
            height={52}
            priority
            className="size-[clamp(44px,5.4vh,56px)] rounded-full object-cover shadow-[0_2px_10px_rgba(0,0,0,0.25)]"
          />
        </button>
        <div className="mt-[1.4vh] text-[clamp(14px,1.8vh,18px)] font-semibold [text-shadow:0_1px_3px_rgba(0,0,0,0.3)]">
          Syed Abdul Muneeb
        </div>
        <div className="mt-[1vh] text-[clamp(12px,1.35vh,14px)] font-medium text-white/80 [text-shadow:0_1px_3px_rgba(0,0,0,0.3)]">
          Click or press Enter to unlock
        </div>
      </div>
      <button className="ios-lock-open" onClick={unlock}>
        Swipe up to open
        <span aria-hidden="true" />
      </button>
    </motion.div>
  );
}
