"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Search, Check } from "lucide-react";
import { useWindowManager } from "@/lib/window-manager";
import { useSystemControls } from "@/lib/system-controls";
import { useBatteryStatus } from "@/lib/use-battery";
import { MAC_WALLPAPERS } from "@/lib/wallpapers";
import { launchApp } from "@/lib/launch-app";

// Same order, grouping, and icons as macOS System Settings. Icons are
// from the Alfred System Settings workflow (public/icons/settings).
const sectionGroups = [
  [
    { id: "wifi", name: "Wi-Fi", icon: "wifi" },
    { id: "bluetooth", name: "Bluetooth", icon: "bluetooth" },
    { id: "battery", name: "Battery", icon: "battery" },
  ],
  [
    { id: "about", name: "General", icon: "general" },
    { id: "accessibility", name: "Accessibility", icon: "accessibility" },
    { id: "appearance", name: "Appearance", icon: "appearance" },
    { id: "dock", name: "Desktop & Dock", icon: "dock" },
    { id: "display", name: "Displays", icon: "displays" },
    { id: "wallpaper", name: "Wallpaper", icon: "wallpaper" },
  ],
  [{ id: "sound", name: "Sound", icon: "sound" }],
  [{ id: "keyboard", name: "Keyboard", icon: "keyboard" }],
];
const sections = sectionGroups.flat();

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="settings-row">
      <span>{label}</span>
      {children}
    </div>
  );
}
function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (on: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-label={label}
      aria-checked={checked}
      className="mac-switch"
      data-checked={checked}
      onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  );
}

export function SettingsWindow({ section }: { section?: string }) {
  const [active, setActive] = useState(section ?? "appearance");
  const [search, setSearch] = useState("");
  const [system, setSystem] = useState({
    resolution: "",
    language: "",
    timezone: "",
  });
  const controls = useSystemControls();
  const battery = useBatteryStatus();
  const {
    wallpaper,
    setWallpaper,
    resetIconPositions,
    aeroEffects,
    setAeroEffects,
  } = useWindowManager();
  useEffect(() => {
    if (section) setActive(section);
  }, [section]);
  useEffect(() => {
    setSystem({
      resolution: `${screen.width} × ${screen.height}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  }, []);
  const title = sections.find((s) => s.id === active)?.name ?? "Appearance";
  const query = search.toLowerCase();
  return (
    <div className="mac-split settings-app">
      <aside className="mac-sidebar settings-sidebar">
        <label className="mac-search">
          <Search size={14} />
          <input
            aria-label="Search settings"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <button className="settings-profile" onClick={() => launchApp("about")}>
          <img src="/avatar-256.jpg" alt="" />
          <span>
            <strong>Syed Abdul Muneeb</strong>
            <span>Personal portfolio</span>
          </span>
        </button>
        <nav aria-label="Settings categories">
          {sectionGroups.map((group, index) => {
            const matches = group.filter((s) =>
              s.name.toLowerCase().includes(query),
            );
            if (matches.length === 0) return null;
            return (
              <div key={index} className="settings-nav-group">
                {matches.map((s) => (
                  <button
                    key={s.id}
                    aria-label={s.name}
                    title={s.name}
                    className="sidebar-item"
                    data-selected={active === s.id}
                    onClick={() => setActive(s.id)}
                  >
                    <img
                      src={`/icons/settings/${s.icon}.png`}
                      alt=""
                      width={24}
                      height={24}
                      className="-mx-0.5 shrink-0"
                    />
                    <span>{s.name}</span>
                  </button>
                ))}
              </div>
            );
          })}
          {search &&
            !sections.some((s) => s.name.toLowerCase().includes(query)) && (
              <p className="mac-muted p-3 text-xs">No settings found.</p>
            )}
        </nav>
      </aside>
      <main className="settings-main">
        <h1>{title}</h1>
        {active === "wifi" && (
          <>
            <div className="settings-group">
              <Row label="Wi-Fi">
                <Toggle
                  label="Wi-Fi"
                  checked={controls.wifiOn}
                  onChange={controls.setWifiOn}
                />
              </Row>
              {controls.wifiOn && (
                <Row label="MuneebOS">
                  <span className="mac-muted">Connected</span>
                </Row>
              )}
            </div>
            <p className="settings-caption">
              Turning Wi-Fi off takes Safari offline in this portfolio. Your
              real connection is not affected.
            </p>
          </>
        )}
        {active === "bluetooth" && (
          <>
            <div className="settings-group">
              <Row label="Bluetooth">
                <Toggle
                  label="Bluetooth"
                  checked={controls.bluetoothOn}
                  onChange={controls.setBluetoothOn}
                />
              </Row>
            </div>
            <p className="settings-caption">
              {controls.bluetoothOn
                ? "Discoverable as “Muneeb’s Mac”."
                : "Bluetooth is off."}
            </p>
          </>
        )}
        {active === "battery" && (
          <>
            <div className="settings-group">
              <Row label="Battery level">
                <span className="mac-muted">
                  {battery ? `${battery.level}%` : "Not available"}
                </span>
              </Row>
              <Row label="Power source">
                <span className="mac-muted">
                  {battery
                    ? battery.charging
                      ? "Power Adapter"
                      : "Battery"
                    : "Unknown"}
                </span>
              </Row>
            </div>
            <p className="settings-caption">
              Read from your device where the browser allows it.
            </p>
          </>
        )}
        {active === "dock" && (
          <>
            <h2>Desktop</h2>
            <div className="settings-group">
              <Row label="Desktop files">
                <button className="mac-button" onClick={resetIconPositions}>
                  Clean Up
                </button>
              </Row>
            </div>
            <h2 className="mt-6">Windows</h2>
            <div className="settings-group">
              <Row label="Minimize windows using">
                <span className="mac-muted">Scale effect</span>
              </Row>
              <Row label="Drag windows to screen edges to tile">
                <span className="mac-muted">On</span>
              </Row>
              <Row label="Mission Control">
                <kbd>⌃↑ / F3</kbd>
              </Row>
            </div>
          </>
        )}
        {active === "appearance" && (
          <>
            <div className="settings-group">
              <div className="appearance-options">
                {[false, true].map((dark) => (
                  <button
                    key={String(dark)}
                    aria-pressed={controls.darkMode === dark}
                    onClick={() => controls.setDarkMode(dark)}
                  >
                    <span
                      className={`appearance-preview ${dark ? "night" : "day"}`}
                    >
                      <span className="preview-window">
                        <i />
                        <i />
                        <i />
                        <span />
                      </span>
                    </span>
                    <span>
                      {dark ? "Dark" : "Light"}
                      {controls.darkMode === dark && <Check size={14} />}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <p className="settings-caption">
              Choose the appearance of windows, menus, and apps.
            </p>
            <div className="settings-group">
              <Row label="Accent color">
                <span className="flex items-center gap-2">
                  <span className="size-4 rounded-full bg-[#007aff]" />
                  Blue
                </span>
              </Row>
              <Row label="Sidebar and Dock transparency">
                <Toggle
                  label="Sidebar and Dock transparency"
                  checked={aeroEffects}
                  onChange={setAeroEffects}
                />
              </Row>
            </div>
          </>
        )}
        {active === "wallpaper" && (
          <>
            <div
              className="wallpaper-preview"
              style={{ backgroundImage: wallpaper }}
            >
              <div />
              <span>Desktop</span>
            </div>
            <h2>Desktop Pictures</h2>
            <div className="wallpaper-grid">
              {MAC_WALLPAPERS.map((wp) => (
                <button
                  key={wp.id}
                  aria-pressed={wallpaper === wp.css}
                  onClick={() => setWallpaper(wp.css)}
                >
                  <span style={{ backgroundImage: wp.css }}>
                    {wallpaper === wp.css && <Check size={18} />}
                  </span>
                  <span>{wp.name}</span>
                </button>
              ))}
            </div>
          </>
        )}
        {active === "display" && (
          <>
            <div className="display-illustration">
              <div style={{ backgroundImage: wallpaper }} />
            </div>
            <h2 className="text-center">Built-in Display</h2>
            <div className="settings-group mt-5">
              <Row label="Brightness">
                <input
                  aria-label="Brightness"
                  type="range"
                  min="0.3"
                  max="1"
                  step="0.01"
                  value={controls.brightness}
                  onChange={(e) =>
                    controls.setBrightness(Number(e.target.value))
                  }
                />
              </Row>
              <Row label="Resolution">
                <span className="mac-muted">{system.resolution}</span>
              </Row>
            </div>
          </>
        )}
        {active === "sound" && (
          <>
            <div className="settings-group">
              <Row label="Output volume">
                <input
                  aria-label="Output volume"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={controls.volume}
                  onChange={(e) => controls.setVolume(Number(e.target.value))}
                />
              </Row>
              <Row label="Play interface sound effects">
                <Toggle
                  label="Play interface sound effects"
                  checked={controls.systemSounds}
                  onChange={controls.setSystemSounds}
                />
              </Row>
            </div>
            <p className="settings-caption">
              Sound preferences apply to this portfolio.
            </p>
          </>
        )}
        {active === "accessibility" && (
          <>
            <div className="settings-group">
              <Row label="Reduce motion">
                <Toggle
                  label="Reduce motion"
                  checked={controls.reduceMotion}
                  onChange={controls.setReduceMotion}
                />
              </Row>
              <Row label="Reduce transparency">
                <Toggle
                  label="Reduce transparency"
                  checked={!aeroEffects}
                  onChange={(on) => setAeroEffects(!on)}
                />
              </Row>
            </div>
            <p className="settings-caption">
              Reduce movement and use solid surfaces for a calmer desktop. Your
              device’s reduced motion preference is also respected.
            </p>
          </>
        )}
        {active === "keyboard" && (
          <>
            <h2>Keyboard Shortcuts</h2>
            <div className="settings-group">
              {[
                ["Spotlight", "⌘K / ⌘Space"],
                ["System Settings", "⌘,"],
                ["Minimize window", "⌘M"],
                ["Close window", "⌘W"],
                ["Cycle windows", "⌘`"],
                ["Mission Control", "⌃↑ / F3"],
                ["Open selected file", "⌘O / Return"],
                ["Finder: enclosing folder", "⌘↑"],
                ["Finder: icon / list view", "⌘1 / ⌘2"],
                ["Dismiss menu or search", "Esc"],
              ].map(([label, key]) => (
                <Row key={label} label={label}>
                  <kbd>{key}</kbd>
                </Row>
              ))}
            </div>
            <p className="settings-caption">
              Use Ctrl in place of ⌘ on Windows and Linux. Some shortcuts are
              reserved by your browser or operating system; use the menus or ⌘K
              if a shortcut is intercepted.
            </p>
          </>
        )}
        {active === "about" && (
          <>
            <div className="about-system">
              <img src="/icons/mac/finder.png" alt="" />
              <h2>Muneeb OS</h2>
              <p>A personal portfolio, inspired by macOS.</p>
            </div>
            <div className="settings-group">
              <Row label="Built with">
                <span className="mac-muted">Next.js & React</span>
              </Row>
              <Row label="Display">
                <span className="mac-muted">{system.resolution}</span>
              </Row>
              <Row label="Language">
                <span className="mac-muted">{system.language}</span>
              </Row>
              <Row label="Time zone">
                <span className="mac-muted">{system.timezone}</span>
              </Row>
            </div>
            <p className="settings-caption">
              Preferences are saved in this browser. Device information stays on
              your device.
            </p>
          </>
        )}
      </main>
    </div>
  );
}
