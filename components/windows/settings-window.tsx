"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Search, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { MAX_SPACES, useWindowManager } from "@/lib/window-manager";
import { useSystemControls } from "@/lib/system-controls";
import { useBatteryStatus } from "@/lib/use-battery";
import { MAC_WALLPAPERS } from "@/lib/wallpapers";
import { launchApp } from "@/lib/launch-app";
import { usePhone } from "@/lib/phone";

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
  // Back and forward walk the panes visited, as in System Settings.
  const [visited, setVisited] = useState([section ?? "appearance"]);
  const [cursor, setCursor] = useState(0);
  const active = visited[cursor];
  const setActive = (id: string) => {
    if (id === active) return;
    setVisited([...visited.slice(0, cursor + 1), id]);
    setCursor(cursor + 1);
  };
  const [search, setSearch] = useState("");
  // iPhone Settings is a list that opens one page at a time. Opening Settings
  // on a particular page (e.g. Change Wallpaper) skips the list.
  const phone = usePhone();
  const [phoneList, setPhoneList] = useState(!section);
  const navRef = useRef<HTMLElement>(null);
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
    if (section) {
      setActive(section);
      setPhoneList(false);
    }
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
    <div
      className="mac-split settings-app"
      data-phone-view={phoneList ? "list" : "page"}
    >
      <aside className="mac-sidebar settings-sidebar">
        <h1 className="phone-list-title mobile-only">Settings</h1>
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
        <nav ref={navRef} aria-label="Settings categories">
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
                    className={`sidebar-item ${s.id === "dock" ? "settings-desktop-category" : ""}`}
                    data-selected={active === s.id}
                    onClick={() => {
                      setActive(s.id);
                      setPhoneList(false);
                    }}
                  >
                    <img
                      src={`/icons/settings/${s.icon}.png`}
                      alt=""
                      width={24}
                      height={24}
                      className="-mx-0.5 shrink-0"
                    />
                    <span className="settings-row-label">
                      {s.id === "display" ? (
                        <><span className="desktop-only">Displays</span><span className="mobile-only">Display & Brightness</span></>
                      ) : s.id === "sound" ? (
                        <><span className="desktop-only">Sound</span><span className="mobile-only">Sounds</span></>
                      ) : s.name}
                    </span>
                    <ChevronRight className="settings-chevron mobile-only" size={18} />
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
      <main className="finder-main">
        <div className="mac-toolbar">
          <div className="toolbar-group">
            <button
              className="mac-icon-button"
              aria-label="Back"
              disabled={!phone && cursor === 0}
              onClick={() => (phone ? setPhoneList(true) : setCursor(cursor - 1))}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className="mac-icon-button"
              aria-label="Forward"
              disabled={cursor === visited.length - 1}
              onClick={() => setCursor(cursor + 1)}
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <h2>
            {active === "display" ? (
              <><span className="desktop-only">Displays</span><span className="mobile-only">Display & Brightness</span></>
            ) : active === "sound" ? (
              <><span className="desktop-only">Sound</span><span className="mobile-only">Sounds</span></>
            ) : title}
          </h2>
        </div>
        <div className="settings-main">
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
                  ? <><span className="desktop-only">Discoverable as “Muneeb’s Mac”.</span><span className="mobile-only">Bluetooth is on for this portfolio.</span></>
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
              <h2 className="mt-6">Desktops</h2>
              <DesktopsGroup />
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
                <span className="desktop-only">Choose the appearance of windows, menus, and apps.</span>
                <span className="mobile-only">Choose the appearance of this portfolio.</span>
              </p>
              <div className="settings-group">
                <Row label="Accent color">
                  <span className="flex items-center gap-2">
                    <span className="size-4 rounded-full bg-[#007aff]" />
                    Blue
                  </span>
                </Row>
                <Row label="Interface transparency">
                  <Toggle
                    label="Interface transparency"
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
                <span><span className="desktop-only">Desktop</span><span className="mobile-only">Home Screen</span></span>
              </div>
              <h2><span className="desktop-only">Desktop Pictures</span><span className="mobile-only">Wallpapers</span></h2>
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
                Reduce movement and use solid surfaces for a calmer experience.
                Your device’s reduced motion preference is also respected.
              </p>
            </>
          )}
          {active === "keyboard" && (
            <>
              <h2>Keyboard Shortcuts</h2>
              <div className="settings-group desktop-only">
                {[
                  ["Spotlight", "⌘K / ⌘Space"],
                  ["System Settings", "⌘,"],
                  ["Minimize window", "⌥M"],
                  ["Close window", "⌥W"],
                  ["Hide app / hide others", "⌥H / ⌥⇧H"],
                  ["Switch apps", "⌥Tab"],
                  ["Cycle windows", "⌘`"],
                  ["Mission Control", "⌃↑ / F3"],
                  ["Previous / next desktop", "⌃← / ⌃→"],
                  ["Go to desktop 1–6", "⌃1 … ⌃6"],
                  ["Move folder to Trash", "⌘⌫"],
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
              <h2 className="mt-6 desktop-only">Trackpad</h2>
              <div className="settings-group desktop-only">
                {[
                  ["Mission Control", "Two-finger swipe up on the desktop"],
                  ["Leave Mission Control", "Two-finger swipe down"],
                  ["Switch desktops", "Two-finger swipe left or right on the desktop"],
                  ["Carry a file to the next desktop", "Drag it to the screen edge and hold"],
                ].map(([label, how]) => (
                  <Row key={label} label={label}>
                    <span className="mac-muted text-right">{how}</span>
                  </Row>
                ))}
              </div>
              <div className="settings-group mobile-only">
                <Row label="Search"><kbd>⌘K</kbd></Row>
                <Row label="Settings"><kbd>⌘,</kbd></Row>
              </div>
              <p className="settings-caption desktop-only">
                Use Ctrl in place of ⌘ on Windows and Linux. Some shortcuts are
                reserved by your browser or operating system; use the menus or
                ⌘K if a shortcut is intercepted.
              </p>
              <p className="settings-caption mobile-only">
                These shortcuts work with a connected keyboard when your browser allows them.
              </p>
            </>
          )}
          {active === "about" && (
            <>
              <div className="about-system">
                <img src="/icons/mac/finder.png" alt="" />
                <h2>Muneeb OS</h2>
                <p><span className="desktop-only">A personal portfolio, inspired by macOS.</span><span className="mobile-only">A personal portfolio, inspired by iPhone.</span></p>
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
                Preferences are saved in this browser. Device information stays
                on your device.
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// Desktop & Dock › Desktops: how many there are, plus a way to add one.
function DesktopsGroup() {
  const spaces = useWindowManager((s) => s.spaces);
  const active = useWindowManager((s) => s.activeSpaceId);
  return (
    <div className="settings-group">
      <Row label="Desktops">
        <span className="mac-muted">
          {spaces.length} · on Desktop {spaces.indexOf(active) + 1}
        </span>
      </Row>
      <Row label="Add a desktop">
        <button
          className="mac-button"
          disabled={spaces.length >= MAX_SPACES}
          onClick={() => useWindowManager.getState().addSpace()}
        >
          Add Desktop
        </button>
      </Row>
      <Row label="Switch between desktops">
        <kbd>⌃← / ⌃→</kbd>
      </Row>
    </div>
  );
}
