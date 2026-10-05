"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import avatar from "../../public/avatar-256.jpg";
import { DEFAULT_WALLPAPER } from "@/lib/wallpapers";
import { useWindowManager } from "@/lib/window-manager";

interface LockScreenProps {
  onUnlock: () => void;
}

export function LockScreen({ onUnlock }: LockScreenProps) {
  const [now, setNow] = useState<Date | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const hasUnlockedRef = useRef(false);
  const savedWallpaper = useWindowManager((state) => state.wallpaper);

  useEffect(() => {
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

  const time =
    now?.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) ?? "";
  const date =
    now?.toLocaleDateString([], {
      weekday: "long",
      month: "long",
      day: "numeric",
    }) ?? "";

  return (
    <motion.div
      animate={{ opacity: isUnlocking ? 0 : 1, scale: isUnlocking ? 1.04 : 1 }}
      transition={{ duration: 0.45, ease: "easeInOut" }}
      className="relative flex h-dvh w-dvw cursor-default select-none flex-col items-center overflow-hidden text-white"
      style={{
        backgroundImage: savedWallpaper || DEFAULT_WALLPAPER,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      onClick={unlock}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />

      <div className="relative z-10 mt-[9vh] text-center drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
        <div className="text-xl font-semibold text-white/90">{date}</div>
        <div className="text-[96px] font-bold leading-none tracking-tight">
          {time}
        </div>
      </div>

      <div className="relative z-10 mt-auto mb-[12vh] flex flex-col items-center gap-3">
        <Image
          src={avatar}
          alt="Syed Abdul Muneeb"
          width={88}
          height={88}
          priority
          className="size-[88px] rounded-full object-cover shadow-[0_8px_30px_rgba(0,0,0,0.4)] ring-2 ring-white/40"
        />
        <div className="text-lg font-semibold drop-shadow">Syed Abdul Muneeb</div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            unlock();
          }}
          className="flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-5 py-1.5 text-sm font-medium backdrop-blur-xl hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          Enter portfolio
          <ArrowRight className="size-4" />
        </button>
        <div className="text-xs text-white/75">
          Click anywhere or press Enter to unlock
        </div>
      </div>
    </motion.div>
  );
}
