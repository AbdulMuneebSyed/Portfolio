"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Bluetooth,
  Lock,
  Moon,
  Music,
  Play,
  Sun,
  Volume1,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  type LucideIcon,
} from "lucide-react";
import { launchApp } from "@/lib/launch-app";
import { MIN_BRIGHTNESS, useSystemControls } from "@/lib/system-controls";
import type { BatteryStatus } from "@/lib/use-battery";

const NETWORK_NAME = "MuneebOS";

const panelClass =
  "rounded-[10px] border border-black/15 bg-[#ececec]/95 p-[5px] text-[13px] text-[#1d1d1f] shadow-[0_10px_30px_rgba(0,0,0,0.25),inset_0_0_0_0.5px_rgba(255,255,255,0.6)] backdrop-blur-3xl [text-shadow:none]";

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
  return <div className="mx-2.5 my-1 h-px bg-black/10" />;
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
        on ? "bg-[#0a82ff]" : "bg-black/15"
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
        <span className="text-black/55">
          {battery ? `${battery.level}%` : "—"}
        </span>
      </div>
      <div className="px-2.5 pb-1.5 text-[12px] text-black/55">
        {battery
          ? `Power Source: ${battery.charging ? "Power Adapter" : "Battery"}`
          : "Battery status isn't available in this browser."}
      </div>
      <Separator />
      <MenuRow
        onClick={() => {
          launchApp("settings");
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
          <div className="px-2.5 pb-1 pt-0.5 text-[11px] font-semibold text-black/50">
            Known Network
          </div>
          <div className="flex items-center gap-2.5 rounded-[4px] px-2.5 py-1">
            <span
              className={`flex size-[26px] items-center justify-center rounded-full ${
                online ? "bg-[#0a82ff] text-white" : "bg-black/10 text-black/50"
              }`}
            >
              <Wifi className="size-[14px]" strokeWidth={2.5} />
            </span>
            <span className="flex-1">
              <span className="block">{NETWORK_NAME}</span>
              <span className="block text-[11px] text-black/50">
                {online
                  ? `Connected${type ? ` · ${type.toUpperCase()}` : ""}`
                  : "No Internet Connection"}
              </span>
            </span>
            <Lock className="size-3 text-black/45" />
          </div>
        </>
      )}
      <Separator />
      <MenuRow
        onClick={() => {
          launchApp("settings");
          onClose();
        }}
      >
        Wi-Fi Settings…
      </MenuRow>
    </div>
  );
}

// ---------------------------------------------------------------- Control Center

function ToggleCircle({
  icon: Icon,
  on,
  onClick,
  label,
  status,
}: {
  icon: LucideIcon;
  on: boolean;
  onClick: () => void;
  label: string;
  status: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className="flex w-full items-center gap-2 rounded-lg px-1 py-1 text-left hover:bg-black/5"
    >
      <span
        className={`flex size-[28px] shrink-0 items-center justify-center rounded-full ${
          on ? "bg-[#0a82ff] text-white" : "bg-black/10 text-[#1d1d1f]"
        }`}
      >
        <Icon className="size-[15px]" strokeWidth={2.25} />
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold leading-tight">
          {label}
        </span>
        <span className="block truncate text-[11px] leading-tight text-black/50">
          {status}
        </span>
      </span>
    </button>
  );
}

function Slider({
  icon: Icon,
  label,
  value,
  min,
  onChange,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  min: number;
  onChange: (value: number) => void;
}) {
  const percent = ((value - min) / (1 - min)) * 100;
  return (
    <div className="rounded-xl bg-white/55 px-3 py-2 shadow-[0_0_0_0.5px_rgba(0,0,0,0.08)]">
      <div className="mb-1.5 text-[13px] font-semibold">{label}</div>
      <div className="relative flex h-[22px] items-center overflow-hidden rounded-full bg-black/10">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-white shadow-[0_0_0_0.5px_rgba(0,0,0,0.12),2px_0_4px_rgba(0,0,0,0.12)]"
          style={{ width: `max(22px, ${percent}%)` }}
        />
        <Icon className="pointer-events-none relative ml-[5px] size-[13px] text-black/60" />
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
    </div>
  );
}

export function ControlCenter({ onClose }: { onClose: () => void }) {
  const {
    wifiOn,
    bluetoothOn,
    focusOn,
    brightness,
    volume,
    setWifiOn,
    setBluetoothOn,
    setFocusOn,
    setBrightness,
    setVolume,
  } = useSystemControls();

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div
      className={`${panelClass} w-[320px] space-y-2 rounded-[16px] p-2.5`}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-0.5 rounded-xl bg-white/55 p-1.5 shadow-[0_0_0_0.5px_rgba(0,0,0,0.08)]">
          <ToggleCircle
            icon={wifiOn ? Wifi : WifiOff}
            on={wifiOn}
            onClick={() => setWifiOn(!wifiOn)}
            label="Wi-Fi"
            status={wifiOn ? NETWORK_NAME : "Off"}
          />
          <ToggleCircle
            icon={Bluetooth}
            on={bluetoothOn}
            onClick={() => setBluetoothOn(!bluetoothOn)}
            label="Bluetooth"
            status={bluetoothOn ? "On" : "Off"}
          />
        </div>
        <div className="flex items-center rounded-xl bg-white/55 p-1.5 shadow-[0_0_0_0.5px_rgba(0,0,0,0.08)]">
          <ToggleCircle
            icon={Moon}
            on={focusOn}
            onClick={() => setFocusOn(!focusOn)}
            label="Focus"
            status={focusOn ? "Do Not Disturb" : "Off"}
          />
        </div>
      </div>

      <Slider
        icon={Sun}
        label="Display"
        value={brightness}
        min={MIN_BRIGHTNESS}
        onChange={setBrightness}
      />
      <Slider
        icon={VolumeIcon}
        label="Sound"
        value={volume}
        min={0}
        onChange={setVolume}
      />

      <button
        onClick={() => {
          launchApp("music");
          onClose();
        }}
        className="flex w-full items-center gap-3 rounded-xl bg-white/55 p-2 text-left shadow-[0_0_0_0.5px_rgba(0,0,0,0.08)] hover:bg-white/70"
      >
        <span className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-b from-[#ff6b81] to-[#f2263f] text-white">
          <Music className="size-5" />
        </span>
        <span className="flex-1">
          <span className="block text-[13px] font-semibold">Music</span>
          <span className="block text-[11px] text-black/50">Not Playing</span>
        </span>
        <Play className="mr-1 size-4 fill-current" />
      </button>
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
    <div className="rounded-[18px] bg-white/70 p-3.5 shadow-[0_0_0_0.5px_rgba(0,0,0,0.08)] backdrop-blur-3xl">
      <div className="mb-2 text-[11px] font-bold text-[#f2263f]">{monthName}</div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-[11px]">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={i} className="font-semibold text-black/40">
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
                : "text-[#1d1d1f]"
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
      className="w-[348px] space-y-2.5 text-[#1d1d1f] [text-shadow:none]"
      onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
    >
      {focusOn ? (
        <div className="rounded-[18px] bg-white/70 px-3.5 py-3 text-[13px] shadow-[0_0_0_0.5px_rgba(0,0,0,0.08)] backdrop-blur-3xl">
          <div className="flex items-center gap-2 font-semibold">
            <Moon className="size-4" /> Do Not Disturb
          </div>
          <div className="mt-0.5 text-[12px] text-black/55">
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
            className="block w-full rounded-[18px] bg-white/70 px-3.5 py-3 text-left shadow-[0_0_0_0.5px_rgba(0,0,0,0.08)] backdrop-blur-3xl hover:bg-white/85"
          >
            <div className="flex items-center justify-between text-[11px] font-medium uppercase text-black/45">
              <span>{n.app}</span>
              <span className="normal-case">now</span>
            </div>
            <div className="mt-1 text-[13px] font-semibold">{n.title}</div>
            <div className="text-[13px] leading-snug text-black/70">{n.body}</div>
          </button>
        ))
      )}
      <CalendarWidget now={now} />
    </motion.div>
  );
}
