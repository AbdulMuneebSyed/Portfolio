"use client";

import type React from "react";
import { useState, type PointerEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Antenna,
  Bluetooth,
  Calculator,
  Camera,
  Flashlight,
  Moon,
  Music,
  Pause,
  Plane,
  ScreenShare,
  Play,
  SkipBack,
  SkipForward,
  Sun,
  SunMoon,
  Timer,
  Volume2,
  Wifi,
} from "lucide-react";
import { useSystemControls } from "@/lib/system-controls";
import { useNowPlaying } from "@/lib/now-playing";
import { songs } from "@/lib/songs";
import { launchApp } from "@/lib/launch-app";

// iPhone Control Center (iOS 26): a blurred, dimmed screen holding separate
// glass modules on a 4-column grid. The modules don't blur themselves: the
// backdrop already has, and an animated parent would break their blur.

function Round({
  label,
  on,
  tint,
  onClick,
  children,
}: {
  label: string;
  on?: boolean;
  tint?: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      className="pcc-round"
      aria-label={label}
      aria-pressed={on}
      style={on && tint ? { background: tint, color: "#fff" } : undefined}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// A tall slider filled from the bottom, dragged anywhere along its height.
function TallSlider({
  label,
  value,
  min = 0,
  onChange,
  icon,
}: {
  label: string;
  value: number;
  min?: number;
  onChange: (value: number) => void;
  icon: ReactNode;
}) {
  const fraction = (value - min) / (1 - min);
  const set = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (r.bottom - e.clientY) / r.height));
    onChange(min + f * (1 - min));
  };
  return (
    <div
      className="pcc-module pcc-slider"
      role="slider"
      aria-label={label}
      aria-valuemin={Math.round(min * 100)}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      tabIndex={0}
      onPointerDown={(e) => {
        // Capture keeps the drag going when the finger leaves the slider;
        // it can fail for an already-released pointer, which is harmless.
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {}
        set(e);
      }}
      onPointerMove={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) set(e);
      }}
      onKeyDown={(e) => {
        const step = e.key === "ArrowUp" ? 0.05 : e.key === "ArrowDown" ? -0.05 : 0;
        if (step) onChange(Math.min(1, Math.max(min, value + step)));
      }}
    >
      <span className="pcc-slider-fill" style={{ height: `${fraction * 100}%` }} />
      <span className="pcc-slider-icon">{icon}</span>
    </div>
  );
}

export function PhoneControlCenter({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const c = useSystemControls();
  const player = useNowPlaying();
  const song = songs[player.index];
  const [airplane, setAirplane] = useState(false);
  const [cellular, setCellular] = useState(true);
  const [torch, setTorch] = useState(false);
  const [swipe, setSwipe] = useState<number | null>(null);
  const run = (id: string) => {
    onClose();
    launchApp(id);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="pcc-backdrop"
            className="pcc-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
          <motion.div
            key="pcc"
            className="pcc"
            role="dialog"
            aria-label="Control Center"
            initial={{ y: -40, scale: 0.94 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -40, scale: 0.94, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 36 }}
            // Tap outside the modules, or swipe up, to close.
            onClick={(e: React.MouseEvent) => e.target === e.currentTarget && onClose()}
            onPointerDown={(e: React.PointerEvent) => setSwipe(e.clientY)}
            onPointerUp={(e: React.PointerEvent) => {
              if (swipe !== null && swipe - e.clientY > 60) onClose();
              setSwipe(null);
            }}
          >
            <div className="pcc-grid">
              <div className="pcc-module pcc-connect">
                <Round label="Airplane Mode" on={airplane} tint="#ff9500" onClick={() => setAirplane(!airplane)}>
                  <Plane size={24} />
                </Round>
                <Round label="Cellular Data" on={cellular && !airplane} tint="#34c759" onClick={() => setCellular(!cellular)}>
                  <Antenna size={24} />
                </Round>
                <Round label="Wi-Fi" on={c.wifiOn} tint="#0a84ff" onClick={() => c.setWifiOn(!c.wifiOn)}>
                  <Wifi size={24} />
                </Round>
                <Round label="Bluetooth" on={c.bluetoothOn} tint="#0a84ff" onClick={() => c.setBluetoothOn(!c.bluetoothOn)}>
                  <Bluetooth size={24} />
                </Round>
              </div>

              <div className="pcc-module pcc-music">
                <button className="pcc-music-head" onClick={() => run("music")}>
                  <span className="pcc-art">
                    <Music size={18} />
                  </span>
                  <span>
                    <strong>{song.title}</strong>
                    <small>{song.artist}</small>
                  </span>
                </button>
                <div className="pcc-music-controls">
                  <button aria-label="Previous song" onClick={player.previous}>
                    <SkipBack size={22} fill="currentColor" />
                  </button>
                  <button aria-label={player.isPlaying ? "Pause" : "Play"} onClick={player.toggle}>
                    {player.isPlaying ? (
                      <Pause size={30} fill="currentColor" />
                    ) : (
                      <Play size={30} fill="currentColor" />
                    )}
                  </button>
                  <button aria-label="Next song" onClick={player.next}>
                    <SkipForward size={22} fill="currentColor" />
                  </button>
                </div>
              </div>

              <button
                className="pcc-module pcc-focus"
                aria-pressed={c.focusOn}
                onClick={() => c.setFocusOn(!c.focusOn)}
              >
                <span className="pcc-focus-icon">
                  <Moon size={20} fill="currentColor" />
                </span>
                <span>
                  <strong>Focus</strong>
                  {c.focusOn && <small>Do Not Disturb</small>}
                </span>
              </button>

              <TallSlider
                label="Brightness"
                value={c.brightness}
                min={0.3}
                onChange={c.setBrightness}
                icon={<Sun size={22} />}
              />
              <TallSlider
                label="Volume"
                value={c.volume}
                onChange={c.setVolume}
                icon={<Volume2 size={22} />}
              />

              <Round label="Dark Mode" on={c.darkMode} tint="#fff" onClick={() => c.setDarkMode(!c.darkMode)}>
                <SunMoon size={24} color={c.darkMode ? "#000" : undefined} />
              </Round>
              <Round label="Screen Mirroring" on={c.mirroringOn} tint="#fff" onClick={() => c.setMirroringOn(!c.mirroringOn)}>
                <ScreenShare size={24} color={c.mirroringOn ? "#000" : undefined} />
              </Round>

              <Round label="Flashlight" on={torch} tint="#fff" onClick={() => setTorch(!torch)}>
                <Flashlight size={24} color={torch ? "#000" : undefined} />
              </Round>
              <Round label="Timer" onClick={() => run("pomodoro")}>
                <Timer size={24} />
              </Round>
              <Round label="Calculator" onClick={() => run("calculator")}>
                <Calculator size={24} />
              </Round>
              <Round label="Camera">
                <Camera size={24} />
              </Round>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
