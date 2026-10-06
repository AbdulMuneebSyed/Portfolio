"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Palette,
  Image as ImageIcon,
  Monitor,
  Volume2,
  Keyboard,
  Info,
  Search,
  Check,
  Accessibility,
} from "lucide-react";
import { useWindowManager } from "@/lib/window-manager";
import { useSystemControls } from "@/lib/system-controls";
import { MAC_WALLPAPERS } from "@/lib/wallpapers";

const sections = [
  { id: "appearance", name: "Appearance", icon: Palette, color: "#5856d6" },
  { id: "wallpaper", name: "Wallpaper", icon: ImageIcon, color: "#30b0c7" },
  { id: "display", name: "Displays", icon: Monitor, color: "#007aff" },
  { id: "sound", name: "Sound", icon: Volume2, color: "#ff3b30" },
  {
    id: "accessibility",
    name: "Accessibility",
    icon: Accessibility,
    color: "#007aff",
  },
  { id: "keyboard", name: "Keyboard", icon: Keyboard, color: "#8e8e93" },
  { id: "about", name: "About", icon: Info, color: "#8e8e93" },
];

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
  return (
    <div className="mac-split settings-app">
      <aside className="mac-sidebar settings-sidebar">
        <div className="settings-profile">
          <img src="/avatar-256.jpg" alt="" />
          <div>
            <strong>Syed Abdul Muneeb</strong>
            <span>Personal portfolio</span>
          </div>
        </div>
        <label className="mac-search">
          <Search size={14} />
          <input
            aria-label="Search settings"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <nav aria-label="Settings categories">
          {sections
            .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
            .map((s) => (
              <button
                key={s.id}
                aria-label={s.name}
                title={s.name}
                className="sidebar-item"
                data-selected={active === s.id}
                onClick={() => setActive(s.id)}
              >
                <span
                  className="settings-glyph"
                  style={{ background: s.color }}
                >
                  <s.icon size={15} />
                </span>
                <span>{s.name}</span>
              </button>
            ))}
          {search &&
            !sections.some((s) =>
              s.name.toLowerCase().includes(search.toLowerCase()),
            ) && <p className="mac-muted p-3 text-xs">No settings found.</p>}
        </nav>
      </aside>
      <main className="settings-main">
        <h1>{title}</h1>
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
            <div className="settings-group mt-6">
              <Row label="Desktop icons">
                <button className="mac-button" onClick={resetIconPositions}>
                  Clean Up
                </button>
              </Row>
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
