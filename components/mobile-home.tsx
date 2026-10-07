"use client";

import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BatteryFull,
  Bluetooth,
  ChevronDown,
  Focus,
  Search,
  Signal,
  Sun,
  Wifi,
} from "lucide-react";
import { AppIcon } from "@/lib/app-icons";
import { getApp, getLaunchableApps } from "@/lib/app-registry";
import { useInstalledApps } from "@/lib/app-store/installed";
import { launchApp } from "@/lib/launch-app";
import { useSystemControls } from "@/lib/system-controls";
import { mobileAppTitle } from "@/lib/mobile-app-titles";

const homeApps = [
  "about",
  "projects",
  "resume",
  "github-activity",
  "notes",
  "calculator",
  "feedback",
  "settings",
  "app-store",
] as const;
const dockApps = ["computer", "ie", "music", "contact"] as const;
const UTILITIES = ["terminal", "task-manager", "recycle", "linkedin"];

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
  const app = getApp(id);
  if (!app) return null;
  const title = mobileAppTitle(id, app.title);
  return (
    <button
      className="ios-home-app"
      aria-label={`Open ${title}`}
      onClick={() => {
        onOpen?.();
        launchApp(id);
      }}
    >
      <span className="ios-home-icon">
        <AppIcon appId={id} size={76} />
      </span>
      <span className="ios-home-label">{title}</span>
    </button>
  );
}

export function MobileHome({
  appOpen,
  onHome,
  onSearch,
}: {
  appOpen: boolean;
  onHome: () => void;
  onSearch: () => void;
}) {
  const [now, setNow] = useState<Date | null>(null);
  const folders = useFolders();
  const [folder, setFolder] = useState<string | null>(null);
  const [controlOpen, setControlOpen] = useState(false);
  const controls = useSystemControls();

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 15_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="ios-shell font-mac">
      <div className="ios-status-bar" data-in-app={appOpen}>
        <span className="ios-status-time">
          {now?.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
        </span>
        <span className="ios-island" aria-hidden="true" />
        <button
          className="ios-status-controls"
          aria-label="Control Center"
          aria-expanded={controlOpen}
          onClick={() => setControlOpen((open) => !open)}
        >
          <Signal size={16} fill="currentColor" />
          <Wifi size={17} />
          <BatteryFull size={21} />
        </button>
      </div>

      {!appOpen && (
        <>
          <div className="ios-home-content">
            <button className="ios-profile-widget" onClick={() => launchApp("about")}>
              <span className="ios-widget-overline">PORTFOLIO</span>
              <strong>Syed Abdul Muneeb</strong>
              <span>Software Engineer</span>
              <span className="ios-widget-link">Get to know me <span aria-hidden="true">↗</span></span>
            </button>
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
                    {folders[name].slice(0, 4).map((id) => (
                      <AppIcon key={id} appId={id} size={30} />
                    ))}
                  </span>
                  <span className="ios-home-label">{name}</span>
                </button>
              ))}
            </div>
          </div>
          <button className="ios-search-pill" onClick={onSearch}>
            <Search size={15} /> Search
          </button>
          <nav className="ios-dock" aria-label="iPhone Dock">
            {dockApps.map((id) => <MobileApp key={id} id={id} />)}
          </nav>
        </>
      )}

      <button className="ios-home-indicator" aria-label="Go to Home Screen" onClick={onHome} />

      <AnimatePresence>
        {folder && folders[folder] && !appOpen && (
          <motion.div
            className="ios-folder-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFolder(null)}
          >
            <motion.div
              className="ios-folder-panel"
              role="dialog"
              aria-label={`${folder} folder`}
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }}
              onClick={(event: MouseEvent<HTMLDivElement>) => event.stopPropagation()}
            >
              <h2>{folder}</h2>
              <div className="ios-home-grid">
                {folders[folder].map((id) => (
                  <MobileApp key={id} id={id} onOpen={() => setFolder(null)} />
                ))}
              </div>
              <button className="ios-folder-close" onClick={() => setFolder(null)}>Done</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {controlOpen && (
          <motion.div
            className="ios-controls-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setControlOpen(false)}
          >
            <motion.div
              className="ios-controls-panel"
              role="dialog"
              aria-label="Control Center"
              initial={{ y: -28, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -28, opacity: 0 }}
              onClick={(event: MouseEvent<HTMLDivElement>) => event.stopPropagation()}
            >
              <button className="ios-controls-dismiss" onClick={() => setControlOpen(false)} aria-label="Close Control Center">
                <ChevronDown size={22} />
              </button>
              <div className="ios-controls-grid">
                <button data-on={controls.wifiOn} onClick={() => controls.setWifiOn(!controls.wifiOn)}><Wifi />Wi-Fi</button>
                <button data-on={controls.bluetoothOn} onClick={() => controls.setBluetoothOn(!controls.bluetoothOn)}><Bluetooth />Bluetooth</button>
                <button data-on={controls.focusOn} onClick={() => controls.setFocusOn(!controls.focusOn)}><Focus />Focus</button>
                <button data-on={controls.darkMode} onClick={() => controls.setDarkMode(!controls.darkMode)}><Sun />Dark Mode</button>
              </div>
              <label className="ios-control-slider"><Sun size={19} /> Brightness
                <input type="range" min="0.3" max="1" step="0.01" value={controls.brightness} onChange={(event) => controls.setBrightness(Number(event.target.value))} />
              </label>
              <button className="ios-controls-settings" onClick={() => { setControlOpen(false); launchApp("settings"); }}>Open Settings</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
