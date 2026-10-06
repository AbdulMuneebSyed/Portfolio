"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Airplay,
  Bluetooth,
  Camera,
  Contrast,
  Copy,
  FastForward,
  Lock,
  Moon,
  Music,
  PanelLeftDashed,
  Pause,
  Play,
  Radio,
  Rewind,
  Sun,
  SunDim,
  Volume,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  type LucideIcon,
} from "lucide-react";
import { launchApp } from "@/lib/launch-app";
import { MIN_BRIGHTNESS, useSystemControls } from "@/lib/system-controls";
import type { BatteryStatus } from "@/lib/use-battery";
import { useNowPlaying } from "@/lib/now-playing";
import { takeScreenshot } from "@/lib/screenshot";
import { songs } from "@/lib/songs";
import { useWindowManager } from "@/lib/window-manager";

const NETWORK_NAME = "MuneebOS";

const panelClass =
  "rounded-[10px] border border-black/15 bg-[#ececec]/95 p-[5px] text-[13px] text-[#1d1d1f] dark:border-white/10 dark:bg-[#2c2c2e]/95 dark:text-[#f5f5f7] shadow-[0_10px_30px_rgba(0,0,0,0.25),inset_0_0_0_0.5px_rgba(255,255,255,0.6)] backdrop-blur-3xl [text-shadow:none]";

function MenuRow({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center rounded-[4px] px-2.5 py-[3px] text-left hover:bg-[#0a82ff] hover:text-white"
    >
      {children}
    </button>
  );
}

function Separator() {
  return <div className="mx-2.5 my-1 h-px bg-black/10 dark:bg-white/10" />;
}

function Switch({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (on: boolean) => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-[18px] w-[30px] rounded-full transition-colors ${
        on ? "bg-[#0a82ff]" : "bg-black/15 dark:bg-white/20"
      }`}
    >
      <span
        className={`absolute top-[2px] size-[14px] rounded-full bg-white shadow transition-[left] ${
          on ? "left-[14px]" : "left-[2px]"
        }`}
      />
    </button>
  );
}

// ---------------------------------------------------------------- Battery

export function BatteryMenu({
  battery,
  onClose,
}: {
  battery: BatteryStatus | null;
  onClose: () => void;
}) {
  return (
    <div className={`${panelClass} w-[260px]`}>
      <div className="flex items-baseline justify-between px-2.5 pb-1 pt-1.5">
        <span className="font-bold">Battery</span>
        <span className="opacity-60">
          {battery ? `${battery.level}%` : "—"}
        </span>
      </div>
      <div className="px-2.5 pb-1.5 text-[12px] opacity-60">
        {battery
          ? `Power Source: ${battery.charging ? "Power Adapter" : "Battery"}`
          : "Battery status isn't available in this browser."}
      </div>
      <Separator />
      <MenuRow
        onClick={() => {
          launchApp("settings", { section: "battery" });
          onClose();
        }}
      >
        Battery Settings…
      </MenuRow>
    </div>
  );
}

// ---------------------------------------------------------------- Wi-Fi

function useNetworkInfo() {
  const [online, setOnline] = useState(true);
  const [type, setType] = useState<string | null>(null);

  useEffect(() => {
    const connection = (
      navigator as Navigator & { connection?: { effectiveType?: string } }
    ).connection;
    const update = () => {
      setOnline(navigator.onLine);
      setType(connection?.effectiveType ?? null);
    };
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return { online, type };
}

export function WifiMenu({ onClose }: { onClose: () => void }) {
  const { wifiOn, setWifiOn } = useSystemControls();
  const { online, type } = useNetworkInfo();

  return (
    <div className={`${panelClass} w-[280px]`}>
      <div className="flex items-center justify-between px-2.5 py-1.5">
        <span className="font-bold">Wi-Fi</span>
        <Switch on={wifiOn} onChange={setWifiOn} label="Wi-Fi" />
      </div>
      {wifiOn && (
        <>
          <Separator />
          <div className="px-2.5 pb-1 pt-0.5 text-[11px] font-semibold opacity-60">
            Known Network
          </div>
          <div className="flex items-center gap-2.5 rounded-[4px] px-2.5 py-1">
            <span
              className={`flex size-[26px] items-center justify-center rounded-full ${
                online ? "bg-[#0a82ff] text-white" : "bg-black/10 opacity-60"
              }`}
            >
              <Wifi className="size-[14px]" strokeWidth={2.5} />
            </span>
            <span className="flex-1">
              <span className="block">{NETWORK_NAME}</span>
              <span className="block text-[11px] opacity-60">
                {online
                  ? `Connected${type ? ` · ${type.toUpperCase()}` : ""}`
                  : "No Internet Connection"}
              </span>
            </span>
            <Lock className="size-3 opacity-60" />
          </div>
        </>
      )}
      <Separator />
      <MenuRow
        onClick={() => {
          launchApp("settings", { section: "wifi" });
          onClose();
        }}
      >
        Wi-Fi Settings…
      </MenuRow>
    </div>
  );
}

// ---------------------------------------------------------------- Control Center
// macOS Tahoe style: no panel, just floating Liquid Glass tiles.

const glass =
  "border border-white/35 bg-white/[0.2] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-[30px] backdrop-saturate-[1.4] [text-shadow:0_1px_2px_rgba(0,0,0,0.18)]";

function IconCircle({
  icon: Icon,
  on,
  activeColor = "#0a82ff",
  size = 44,
}: {
  icon: LucideIcon;
  on: boolean;
  activeColor?: string;
  size?: number;
}) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full transition-colors ${
        on ? "bg-white" : "bg-white/20"
      }`}
      style={{ width: size, height: size }}
    >
      <Icon
        className="size-[45%]"
        strokeWidth={2.25}
        color={on ? activeColor : "#ffffff"}
      />
    </span>
  );
}

function PillToggle({
  icon,
  on,
  label,
  status,
  activeColor,
  onToggle,
  onOpen,
}: {
  icon: LucideIcon;
  on: boolean;
  label: string;
  status?: string;
  activeColor?: string;
  onToggle: () => void;
  onOpen?: () => void;
}) {
  // Like macOS: the icon toggles; the rest of the pill shows more options.
  return (
    <div className={`${glass} flex h-[66px] items-center gap-3 rounded-full px-[11px]`}>
      <button onClick={onToggle} aria-pressed={on} aria-label={label}>
        <IconCircle icon={icon} on={on} activeColor={activeColor} />
      </button>
      <button
        onClick={onOpen ?? onToggle}
        className="min-w-0 flex-1 text-left"
      >
        <span className="block text-[14px] font-semibold leading-tight">
          {label}
        </span>
        {status && (
          <span className="block truncate text-[12px] leading-tight text-white/80">
            {status}
          </span>
        )}
      </button>
    </div>
  );
}

function CircleToggle({
  icon: Icon,
  on,
  label,
  onClick,
}: {
  icon: LucideIcon;
  on: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      aria-label={label}
      title={label}
      className={`flex size-[66px] items-center justify-center justify-self-center rounded-full transition-colors ${
        on
          ? "bg-white text-black shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
          : glass
      }`}
    >
      <Icon className="size-[24px]" strokeWidth={2} />
    </button>
  );
}

function GlassSlider({
  label,
  value,
  min,
  onChange,
  startIcon: StartIcon,
  endIcon: EndIcon,
  accessory,
}: {
  label: string;
  value: number;
  min: number;
  onChange: (value: number) => void;
  startIcon: LucideIcon;
  endIcon: LucideIcon;
  accessory?: React.ReactNode;
}) {
  const percent = ((value - min) / (1 - min)) * 100;
  return (
    <div className={`${glass} col-span-4 rounded-[26px] px-5 pb-3.5 pt-3`}>
      <div className="mb-2 text-[14px] font-semibold">{label}</div>
      <div className="flex items-center gap-3">
        <StartIcon className="size-[15px] shrink-0" strokeWidth={2.25} />
        <div className="relative h-[22px] flex-1">
          <div className="absolute inset-x-0 top-1/2 h-[5px] -translate-y-1/2 rounded-full bg-white/30" />
          <div
            className="absolute left-0 top-1/2 h-[5px] -translate-y-1/2 rounded-full bg-white"
            style={{ width: `${percent}%` }}
          />
          <input
            type="range"
            min={min}
            max={1}
            step={0.01}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            aria-label={label}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </div>
        <EndIcon className="size-[20px] shrink-0" strokeWidth={2} />
        {accessory}
      </div>
    </div>
  );
}

function NowPlayingTile({ onOpenMusic }: { onOpenMusic: () => void }) {
  const { index, isPlaying, toggle, next, previous } = useNowPlaying();
  const song = songs[index];

  return (
    <div
      className={`${glass} col-span-2 row-span-2 flex flex-col justify-between rounded-[28px] p-3.5`}
    >
      <button onClick={onOpenMusic} className="text-left">
        <span className="mb-2 flex size-[40px] items-center justify-center rounded-[8px] bg-gradient-to-b from-[#ff6b81] to-[#f2263f] shadow">
          <Music className="size-5" color="#ffffff" />
        </span>
        <span className="block truncate text-[14px] font-semibold leading-tight">
          {song.title}
        </span>
        <span className="block truncate text-[12px] leading-tight text-white/80">
          {song.artist}
        </span>
      </button>
      <div className="flex items-center justify-center gap-5">
        <button onClick={previous} aria-label="Previous track">
          <Rewind className="size-[20px] fill-current" />
        </button>
        <button onClick={toggle} aria-label={isPlaying ? "Pause" : "Play"}>
          {isPlaying ? (
            <Pause className="size-[26px] fill-current" />
          ) : (
            <Play className="size-[26px] fill-current" />
          )}
        </button>
        <button onClick={next} aria-label="Next track">
          <FastForward className="size-[20px] fill-current" />
        </button>
      </div>
    </div>
  );
}

export function ControlCenter({
  onClose,
  onShowWifi,
}: {
  onClose: () => void;
  onShowWifi: () => void;
}) {
  const controls = useSystemControls();
  const [airplayOn, setAirplayOn] = useState(false);

  const toggleStageManager = () => {
    const turningOn = !controls.stageManagerOn;
    controls.setStageManagerOn(turningOn);
    if (turningOn) {
      // Keep only the focused window on stage; the rest go to the side.
      const { windows, activeWindowId, minimizeWindow } =
        useWindowManager.getState();
      windows
        .filter((w) => w.id !== activeWindowId && !w.isMinimized)
        .forEach((w) => minimizeWindow(w.id));
    }
  };

  return (
    <div
      className="w-[396px] max-w-[calc(100vw-24px)] max-h-[calc(100dvh-50px)] overflow-y-auto select-none"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="grid grid-cols-4 gap-3">
        <div className="col-span-2 row-span-2 grid gap-3">
          <PillToggle
            icon={controls.wifiOn ? Wifi : WifiOff}
            on={controls.wifiOn}
            label="Wi-Fi"
            status={controls.wifiOn ? NETWORK_NAME : "Off"}
            onToggle={() => controls.setWifiOn(!controls.wifiOn)}
            onOpen={onShowWifi}
          />
          <PillToggle
            icon={Bluetooth}
            on={controls.bluetoothOn}
            label="Bluetooth"
            status={controls.bluetoothOn ? "On" : "Off"}
            onToggle={() => controls.setBluetoothOn(!controls.bluetoothOn)}
          />
        </div>
        <NowPlayingTile
          onOpenMusic={() => {
            launchApp("music");
            onClose();
          }}
        />

        <div className="col-span-2">
          <PillToggle
            icon={Radio}
            on={controls.airdropOn}
            label="AirDrop"
            status={controls.airdropOn ? "Contacts Only" : "Off"}
            onToggle={() => controls.setAirdropOn(!controls.airdropOn)}
          />
        </div>
        <CircleToggle
          icon={PanelLeftDashed}
          on={controls.stageManagerOn}
          label="Stage Manager"
          onClick={toggleStageManager}
        />
        <CircleToggle
          icon={Copy}
          on={controls.mirroringOn}
          label="Screen Mirroring"
          onClick={() => controls.setMirroringOn(!controls.mirroringOn)}
        />

        <CircleToggle
          icon={Contrast}
          on={controls.darkMode}
          label="Dark Mode"
          onClick={() => controls.setDarkMode(!controls.darkMode)}
        />
        <CircleToggle
          icon={Camera}
          on={false}
          label="Screenshot"
          onClick={() => {
            onClose();
            // Let Control Center disappear before capturing.
            window.setTimeout(() => void takeScreenshot(), 150);
          }}
        />
        <div className="col-span-2">
          <PillToggle
            icon={Moon}
            on={controls.focusOn}
            label="Focus"
            status={controls.focusOn ? "Do Not Disturb" : undefined}
            activeColor="#5e5ce6"
            onToggle={() => controls.setFocusOn(!controls.focusOn)}
          />
        </div>

        <GlassSlider
          label="Display"
          value={controls.brightness}
          min={MIN_BRIGHTNESS}
          onChange={controls.setBrightness}
          startIcon={SunDim}
          endIcon={Sun}
        />
        <GlassSlider
          label="Sound"
          value={controls.volume}
          min={0}
          onChange={controls.setVolume}
          startIcon={controls.volume === 0 ? VolumeX : Volume}
          endIcon={Volume2}
          accessory={
            <button
              onClick={() => setAirplayOn(!airplayOn)}
              aria-pressed={airplayOn}
              aria-label="AirPlay"
              className={`ml-1 flex size-[34px] items-center justify-center rounded-full ${
                airplayOn ? "bg-white text-[#0a82ff]" : "bg-white/20"
              }`}
            >
              <Airplay className="size-[16px]" strokeWidth={2.25} />
            </button>
          }
        />
      </div>

      <div className="mt-3 flex justify-center">
        <button
          onClick={() => {
            launchApp("settings");
            onClose();
          }}
          className={`${glass} rounded-full px-3.5 py-1 text-[13px] font-medium`}
        >
          Edit Controls
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Notification Center

const NOTIFICATIONS = [
  {
    id: "welcome",
    app: "MuneebOS",
    title: "Welcome to MuneebOS",
    body: "Press ⌘K to search for anything, or use the Dock below.",
    action: "about",
  },
  {
    id: "hiring",
    app: "Contact",
    title: "Open to SDE roles",
    body: "Have an opportunity? Send me a message — I read every note.",
    action: "contact",
  },
  {
    id: "projects",
    app: "Projects",
    title: "AiResumate is live",
    body: "AI resume scoring and rewriting. See it and more in Projects.",
    action: "projects",
  },
];

function CalendarWidget({ now }: { now: Date }) {
  const { monthName, blanks, days } = useMemo(() => {
    const year = now.getFullYear();
    const month = now.getMonth();
    // Weeks start on Monday, as in en-GB macOS calendars.
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return {
      monthName: now.toLocaleDateString("en-GB", { month: "long" }).toUpperCase(),
      blanks: firstWeekday,
      days: Array.from({ length: daysInMonth }, (_, i) => i + 1),
    };
  }, [now]);

  return (
    <div className="rounded-[18px] bg-white/70 p-3.5 dark:bg-[#2c2c2e]/70 dark:text-white shadow-[0_0_0_0.5px_rgba(0,0,0,0.08)] backdrop-blur-3xl">
      <div className="mb-2 text-[11px] font-bold text-[#f2263f]">{monthName}</div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-[11px]">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={i} className="font-semibold opacity-45">
            {d}
          </span>
        ))}
        {Array.from({ length: blanks }, (_, i) => (
          <span key={`blank-${i}`} />
        ))}
        {days.map((day) => (
          <span
            key={day}
            className={`mx-auto flex size-[20px] items-center justify-center rounded-full ${
              day === now.getDate()
                ? "bg-[#f2263f] font-bold text-white"
                : ""
            }`}
          >
            {day}
          </span>
        ))}
      </div>
    </div>
  );
}

export function NotificationCenter({ onClose }: { onClose: () => void }) {
  const focusOn = useSystemControls((state) => state.focusOn);
  const [now] = useState(() => new Date());

  return (
    <motion.div
      initial={{ x: 380, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 380, opacity: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 36 }}
      className="w-[348px] max-w-[calc(100vw-20px)] max-h-[calc(100dvh-50px)] overflow-y-auto space-y-2.5 text-[#1d1d1f] dark:text-white [text-shadow:none]"
      onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
    >
      {focusOn ? (
        <div className="rounded-[18px] bg-white/70 px-3.5 py-3 dark:bg-[#2c2c2e]/70 dark:text-white text-[13px] shadow-[0_0_0_0.5px_rgba(0,0,0,0.08)] backdrop-blur-3xl">
          <div className="flex items-center gap-2 font-semibold">
            <Moon className="size-4" /> Do Not Disturb
          </div>
          <div className="mt-0.5 text-[12px] opacity-60">
            Notifications are silenced while Focus is on.
          </div>
        </div>
      ) : (
        NOTIFICATIONS.map((n) => (
          <button
            key={n.id}
            onClick={() => {
              launchApp(n.action);
              onClose();
            }}
            className="block w-full rounded-[18px] bg-white/70 px-3.5 py-3 dark:bg-[#2c2c2e]/70 dark:text-white text-left shadow-[0_0_0_0.5px_rgba(0,0,0,0.08)] backdrop-blur-3xl hover:bg-white/85 dark:hover:bg-[#3a3a3c]/80"
          >
            <div className="flex items-center justify-between text-[11px] font-medium uppercase opacity-60">
              <span>{n.app}</span>
              <span className="normal-case">now</span>
            </div>
            <div className="mt-1 text-[13px] font-semibold">{n.title}</div>
            <div className="text-[13px] leading-snug opacity-80">{n.body}</div>
          </button>
        ))
      )}
      <CalendarWidget now={now} />
    </motion.div>
  );
}
