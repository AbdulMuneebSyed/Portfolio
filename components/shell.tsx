"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { LockScreen } from "@/components/mac/lock-screen";
import { DEFAULT_WALLPAPER } from "@/lib/wallpapers";

// The desktop (window manager, Dock, menus) isn't needed to show the lock
// screen, so it loads separately, fetched as soon as the lock screen is up.
const loadDesktop = () => import("@/components/desktop").then((m) => m.Desktop);
// Until it arrives, the wallpaper fills in, so unlocking never flashes white.
const Desktop = dynamic(loadDesktop, {
  ssr: false,
  loading: () => (
    <div
      className="h-dvh w-dvw bg-cover bg-center"
      style={{ backgroundImage: DEFAULT_WALLPAPER }}
    />
  ),
});

export function Shell() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    void loadDesktop();
  }, []);
  return isLoggedIn ? (
    <Desktop onLock={() => setIsLoggedIn(false)} />
  ) : (
    <LockScreen onUnlock={() => setIsLoggedIn(true)} />
  );
}
