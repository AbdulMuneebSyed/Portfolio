"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { LockScreen } from "@/components/mac/lock-screen";
import { DEFAULT_WALLPAPER } from "@/lib/wallpapers";
import { isPhone } from "@/lib/phone";
import { readString } from "@/lib/storage";

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

// A first visit on a Mac-sized screen opens About Me (the /profile site in
// an iframe) right after unlocking. Fetch that page and its portrait while
// the lock screen is up, so the window fills in at once instead of loading.
function prefetchAboutMe() {
  if (isPhone() || readString("hasVisitedPortfolio") !== null) return;
  for (const href of ["/profile", "/avatar-840.webp"]) {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = href;
    document.head.appendChild(link);
  }
}

export function Shell() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    void loadDesktop();
    prefetchAboutMe();
  }, []);
  return isLoggedIn ? (
    <Desktop onLock={() => setIsLoggedIn(false)} />
  ) : (
    <LockScreen onUnlock={() => setIsLoggedIn(true)} />
  );
}
