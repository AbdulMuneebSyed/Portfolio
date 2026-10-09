"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent, PointerEvent } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { BatteryFull, MapPin, Search, Signal, Wifi } from "lucide-react";
import { PhoneControlCenter } from "@/components/mac/phone-control-center";
import { PhoneNotificationCenter } from "@/components/mac/phone-notification-center";
import { PhoneAppIcon } from "@/lib/app-icons";
import { getApp, getLaunchableApps } from "@/lib/app-registry";
import { useInstalledApps } from "@/lib/app-store/installed";
import { launchApp } from "@/lib/launch-app";
import { phoneTitle, rememberLaunch } from "@/lib/phone";
import { timeline } from "@/lib/portfolio-data";

const homeApps = [
  "about",
  "projects",
  "resume",
  "github-activity",
  "linkedin",
  "notes",
  "calculator",
  "feedback",
  "settings",
  "app-store",
] as const;
const dockApps = ["computer", "ie", "music", "contact"] as const;
const UTILITIES = ["terminal", "recycle"];

// Folders hold the built-in utilities plus whatever the visitor has
// installed from the App Store; an empty folder is hidden.
function useFolders(): Record<string, string[]> {
  useInstalledApps((s) => s.overrides);
  const installed = getLaunchableApps().filter((app) => app.installable);
  const folders: Record<string, string[]> = {
    Games: installed.filter((app) => app.category === "Games").map((app) => app.id),
    Utilities: [
      ...UTILITIES,
      ...installed.filter((app) => app.category !== "Games").map((app) => app.id),
    ],
  };
  return Object.fromEntries(Object.entries(folders).filter(([, ids]) => ids.length));
}

function MobileApp({ id, onOpen }: { id: string; onOpen?: () => void }) {
  const icon = useRef<HTMLSpanElement>(null);
  const app = getApp(id);
  if (!app) return null;
  const title = phoneTitle(id, app.title);
  return (
    <button
      className="ios-home-app"
      aria-label={`Open ${title}`}
      onClick={() => {
        rememberLaunch(id, icon.current);
        onOpen?.();
        launchApp(id);
      }}
    >
      <span ref={icon} className="ios-home-icon">
        <PhoneAppIcon appId={id} />
      </span>
      <span className="ios-home-label">{title}</span>
    </button>
  );
}

// A medium widget, like the ones iOS apps put on the Home Screen.
function ProfileWidget() {
  const ref = useRef<HTMLButtonElement>(null);
  const now = timeline[0];
  return (
    <button
      ref={ref}
      className="ios-widget ios-profile-widget"
      aria-label="Open About Me"
      onClick={() => {
        rememberLaunch("about", ref.current);
        launchApp("about");
      }}
    >
      <Image
        src="/avatar-256.jpg"
        alt=""
        width={128}
        height={128}
        className="ios-widget-photo"
        draggable={false}
      />
      <span className="ios-widget-text">
        <strong>Syed Abdul Muneeb</strong>
        <span>Software Engineer</span>
        <span className="ios-widget-now">
          <span className="ios-widget-dot" aria-hidden="true" />
          {now.title.replace(" · ", " at ")}
        </span>
        <span className="ios-widget-place">
          <MapPin size={11} aria-hidden="true" /> {now.location}
        </span>
      </span>
    </button>
  );
}

export function MobileHome({
  appOpen,
  darkApp,
  onHome,
  onSearch,
  onSwitcher,
}: {
  appOpen: boolean;
  // The open app has a dark top, so the status bar text turns white.
  darkApp: boolean;
  onHome: () => void;
  onSearch: () => void;
  // Swipe up and hold: the App Switcher.
  onSwitcher: () => void;
}) {
  const [now, setNow] = useState<Date | null>(null);
  const folders = useFolders();
  const [folder, setFolder] = useState<string | null>(null);
  const [controlOpen, setControlOpen] = useState(false);
  const [noticesOpen, setNoticesOpen] = useState(false);
  const swipe = useRef<number | null>(null);
  const pull = useRef<number | null>(null);
  const pulled = useRef(false);
  const home = useRef<HTMLDivElement>(null);
  useEffect(() => {
    home.current?.toggleAttribute("inert", appOpen);
  }, [appOpen]);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 15_000);
    return () => window.clearInterval(id);
  }, []);

  // Swipe up from the bottom edge to go Home, like Face ID iPhones; swipe
  // up and pause for the App Switcher.
  const hold = useRef<number | null>(null);
  const switched = useRef(false);
  // The app follows the finger while it's dragged up, shrinking towards a
  // card, then lets go into its icon (or the App Switcher). Set with CSS
  // `translate`/`scale`, which add to the transform framer-motion animates.
  const followFinger = (rise: number) => {
    const app = document.querySelector<HTMLElement>(
      '.mac-window[data-active="true"]',
    );
    if (!app) return;
    const progress = Math.min(1, Math.max(0, rise) / (innerHeight * 0.6));
    app.style.transition = "none";
    app.style.translate = `0 ${-Math.max(0, rise) * 0.7}px`;
    app.style.scale = String(1 - progress * 0.4);
    app.style.borderRadius = `${16 + progress * 30}px`;
  };
  const releaseFinger = () => {
    for (const app of document.querySelectorAll<HTMLElement>(".mac-window")) {
      if (!app.style.translate) continue;
      app.style.transition =
        "translate 0.35s cubic-bezier(0.2, 0.9, 0.3, 1), scale 0.35s cubic-bezier(0.2, 0.9, 0.3, 1), border-radius 0.35s";
      app.style.translate = "";
      app.style.scale = "";
      app.style.borderRadius = "";
      window.setTimeout(() => (app.style.transition = ""), 400);
    }
  };
  const endSwipe = () => {
    swipe.current = null;
    if (hold.current) window.clearTimeout(hold.current);
    hold.current = null;
    releaseFinger();
  };
  const homeGesture = {
    onPointerDown: (e: PointerEvent<HTMLButtonElement>) => {
      swipe.current = e.clientY;
      switched.current = false;
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onPointerMove: (e: PointerEvent<HTMLButtonElement>) => {
      const start = swipe.current;
      if (start !== null && appOpen) followFinger(start - e.clientY);
      if (start === null || hold.current || start - e.clientY < 60) return;
      hold.current = window.setTimeout(() => {
        if (swipe.current === null) return;
        switched.current = true;
        onSwitcher();
      }, 320);
    },
    onPointerUp: (e: PointerEvent<HTMLButtonElement>) => {
      const start = swipe.current;
      endSwipe();
      if (!switched.current && start !== null && start - e.clientY > 24) onHome();
    },
    onPointerCancel: endSwipe,
  };

  return (
    <div className="ios-shell font-mac" data-app-open={appOpen}>
      <div
        className="ios-status-bar"
        data-in-app={appOpen}
        data-tone={appOpen && !darkApp && !controlOpen && !noticesOpen ? "dark" : "light"}
        data-control-center={controlOpen || noticesOpen}
      >
        <button
          className="ios-status-time"
          aria-label="Notification Center"
          aria-expanded={noticesOpen}
          // Tap, or pull down from the top-left, to open it.
          onClick={() => {
            if (!pulled.current) setNoticesOpen((open) => !open);
            pulled.current = false;
          }}
          onPointerDown={(e) => {
            pull.current = e.clientY;
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerUp={(e) => {
            pulled.current = pull.current !== null && e.clientY - pull.current > 20;
            if (pulled.current) setNoticesOpen(true);
            pull.current = null;
          }}
        >
          {now?.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).replace(/\s?[AP]M$/i, "")}
        </button>
        <span className="ios-island" aria-hidden="true" />
        <button
          className="ios-status-controls"
          aria-label="Control Center"
          aria-expanded={controlOpen}
          // Tap, or pull down from the top-right corner, to open it.
          onClick={() => {
            if (!pulled.current) setControlOpen((open) => !open);
            pulled.current = false;
          }}
          onPointerDown={(e) => {
            pull.current = e.clientY;
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerUp={(e) => {
            pulled.current = pull.current !== null && e.clientY - pull.current > 20;
            if (pulled.current) setControlOpen(true);
            pull.current = null;
          }}
        >
          <Signal size={17} strokeWidth={2.6} />
          <Wifi size={17} strokeWidth={2.6} />
          <BatteryFull size={25} strokeWidth={1.8} />
        </button>
      </div>

      <div ref={home} className="ios-home" aria-hidden={appOpen}>
        <div className="ios-home-content">
          <ProfileWidget />
          <div className="ios-home-grid" aria-label="Apps">
            {homeApps.map((id) => <MobileApp key={id} id={id} />)}
            {Object.keys(folders).map((name) => (
              <button
                key={name}
                className="ios-home-app"
                aria-label={`Open ${name} folder`}
                onClick={() => setFolder(name)}
              >
                <span className="ios-folder-icon">
                  {folders[name].slice(0, 9).map((id) => (
                    <PhoneAppIcon key={id} appId={id} size={13} />
                  ))}
                </span>
                <span className="ios-home-label">{name}</span>
              </button>
            ))}
          </div>
        </div>
        <button className="ios-search-pill" onClick={onSearch}>
          <Search size={13} strokeWidth={2.6} /> Search
        </button>
        <nav className="ios-dock" aria-label="Dock">
          {dockApps.map((id) => <MobileApp key={id} id={id} />)}
        </nav>
      </div>

      <button
        className="ios-home-indicator"
        aria-label="Go to Home Screen"
        onClick={() => {
          if (!switched.current) onHome();
          switched.current = false;
        }}
        {...homeGesture}
      >
        <span />
      </button>

      <AnimatePresence>
        {folder && folders[folder] && !appOpen && (
          <motion.div
            className="ios-folder-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFolder(null)}
          >
            <motion.h2
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
            >
              {folder}
            </motion.h2>
            <motion.div
              className="ios-folder-panel"
              role="dialog"
              aria-label={`${folder} folder`}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
              onClick={(event: MouseEvent<HTMLDivElement>) => event.stopPropagation()}
            >
              {folders[folder].map((id) => (
                <MobileApp key={id} id={id} onOpen={() => setFolder(null)} />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <PhoneControlCenter open={controlOpen} onClose={() => setControlOpen(false)} />
      <PhoneNotificationCenter open={noticesOpen} onClose={() => setNoticesOpen(false)} />
    </div>
  );
}
