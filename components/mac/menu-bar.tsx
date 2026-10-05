"use client";

import { useEffect, useRef, useState } from "react";
import { BatteryFull, Search, Wifi } from "lucide-react";
import { getApp } from "@/lib/app-registry";
import { launchApp, MENU_BAR_HEIGHT } from "@/lib/launch-app";
import { useWindowManager } from "@/lib/window-manager";
import { AppleLogo } from "./apple-logo";

type MenuItem =
  | { separator: true }
  | {
      label: string;
      onSelect: () => void;
      disabled?: boolean;
      checked?: boolean;
      shortcut?: string;
    };

interface Menu {
  id: string;
  title: React.ReactNode;
  bold?: boolean;
  items: MenuItem[];
}

interface MenuBarProps {
  onOpenSpotlight: () => void;
  onStartTour: () => void;
  onLock: () => void;
  onRestart: () => void;
}

export function MenuBar({
  onOpenSpotlight,
  onStartTour,
  onLock,
  onRestart,
}: MenuBarProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const windows = useWindowManager((state) => state.windows);
  const activeWindowId = useWindowManager((state) => state.activeWindowId);
  const {
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    shutdown,
  } = useWindowManager.getState();

  const activeWindow = windows.find(
    (w) => w.id === activeWindowId && !w.isMinimized
  );
  const activeAppName = activeWindow
    ? getApp(activeWindow.appId ?? activeWindow.id)?.title ?? activeWindow.title
    : "Finder";

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 15_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!openMenuId) return;
    const handlePointer = (e: MouseEvent) => {
      if (!barRef.current?.contains(e.target as Node)) setOpenMenuId(null);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [openMenuId]);

  const menus: Menu[] = [
    {
      id: "system",
      title: <AppleLogo className="size-[15px]" />,
      items: [
        { label: "About Muneeb", onSelect: () => launchApp("about") },
        { separator: true },
        { label: "System Settings…", onSelect: () => launchApp("settings") },
        { separator: true },
        { label: "Lock Screen", onSelect: onLock },
        { label: "Restart…", onSelect: onRestart },
        { label: "Shut Down…", onSelect: shutdown },
      ],
    },
    {
      id: "app",
      title: activeAppName,
      bold: true,
      items: [
        {
          label: `Hide ${activeAppName}`,
          disabled: !activeWindow,
          onSelect: () => activeWindow && minimizeWindow(activeWindow.id),
        },
        {
          label: `Quit ${activeAppName}`,
          disabled: !activeWindow,
          onSelect: () => activeWindow && closeWindow(activeWindow.id),
        },
      ],
    },
    {
      id: "file",
      title: "File",
      items: [
        { label: "New Finder Window", onSelect: () => launchApp("computer") },
        { separator: true },
        {
          label: "Close Window",
          disabled: !activeWindow,
          onSelect: () => activeWindow && closeWindow(activeWindow.id),
        },
      ],
    },
    {
      id: "edit",
      title: "Edit",
      items: [
        { label: "Undo", disabled: true, onSelect: () => {} },
        { label: "Redo", disabled: true, onSelect: () => {} },
        { separator: true },
        {
          label: "Copy Email Address",
          onSelect: () => {
            void navigator.clipboard?.writeText("samuneeb786@gmail.com");
          },
        },
      ],
    },
    {
      id: "view",
      title: "View",
      items: [
        {
          label: "Enter Full Screen",
          onSelect: () => {
            void document.documentElement.requestFullscreen?.();
          },
        },
      ],
    },
    {
      id: "go",
      title: "Go",
      items: [
        { label: "About Me", onSelect: () => launchApp("about") },
        { label: "Projects", onSelect: () => launchApp("projects") },
        { label: "Resume", onSelect: () => launchApp("resume") },
        { label: "Contact", onSelect: () => launchApp("contact") },
        { separator: true },
        { label: "GitHub", onSelect: () => launchApp("github-activity") },
        { label: "LinkedIn", onSelect: () => launchApp("linkedin") },
        { separator: true },
        { label: "Spotlight…", shortcut: "⌘K", onSelect: onOpenSpotlight },
      ],
    },
    {
      id: "window",
      title: "Window",
      items: [
        {
          label: "Minimize",
          disabled: !activeWindow,
          onSelect: () => activeWindow && minimizeWindow(activeWindow.id),
        },
        {
          label: "Zoom",
          disabled: !activeWindow || activeWindow.disableMaximize,
          onSelect: () => activeWindow && maximizeWindow(activeWindow.id),
        },
        {
          label: "Close Window",
          disabled: !activeWindow,
          onSelect: () => activeWindow && closeWindow(activeWindow.id),
        },
        ...(windows.length > 0 ? [{ separator: true } as const] : []),
        ...windows.map((w) => ({
          label: w.title,
          checked: w.id === activeWindow?.id,
          onSelect: () => restoreWindow(w.id),
        })),
      ],
    },
    {
      id: "help",
      title: "Help",
      items: [
        { label: "Take the Tour", onSelect: onStartTour },
        { label: "Contact Muneeb", onSelect: () => launchApp("contact") },
        {
          label: "View Source on GitHub",
          onSelect: () =>
            window.open(
              "https://github.com/AbdulMuneebSyed",
              "_blank",
              "noopener,noreferrer"
            ),
        },
      ],
    },
  ];

  const clock = now ? formatMenuBarClock(now) : "";

  return (
    <div
      ref={barRef}
      className="font-mac fixed inset-x-0 top-0 z-[9500] flex select-none items-center justify-between bg-black/20 px-2.5 text-[13.5px] text-white backdrop-blur-3xl backdrop-saturate-150 [text-shadow:0_0_1px_rgba(0,0,0,0.25)]"
      style={{ height: MENU_BAR_HEIGHT }}
    >
      <div className="flex h-full items-center">
        {menus.map((menu) => (
          <div key={menu.id} className="relative h-full">
            <button
              data-menu-id={menu.id}
              className={`my-[3px] flex h-[calc(100%-6px)] items-center rounded-[5px] ${
                menu.id === "system" ? "px-3" : "px-[9px]"
              } ${menu.bold ? "font-bold" : "font-medium"} ${
                openMenuId === menu.id ? "bg-white/25" : ""
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                setOpenMenuId((current) => (current === menu.id ? null : menu.id));
              }}
              onMouseEnter={() => openMenuId && setOpenMenuId(menu.id)}
              aria-haspopup="menu"
              aria-expanded={openMenuId === menu.id}
            >
              {menu.title}
            </button>
            {openMenuId === menu.id && (
              <MenuDropdown
                items={menu.items}
                onClose={() => setOpenMenuId(null)}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex h-full items-center gap-[18px] pr-1 font-medium">
        <BatteryFull className="size-[19px]" strokeWidth={1.75} aria-label="Battery" />
        <Wifi className="size-4" strokeWidth={2.25} aria-label="Wi-Fi" />
        <button
          className="flex items-center"
          onClick={onOpenSpotlight}
          aria-label="Spotlight"
        >
          <Search className="size-[15px]" strokeWidth={2.25} />
        </button>
        <ControlCenterIcon />
        <span className="whitespace-nowrap tabular-nums">{clock}</span>
      </div>
    </div>
  );
}

function MenuDropdown({
  items,
  onClose,
}: {
  items: MenuItem[];
  onClose: () => void;
}) {
  return (
    <div
      role="menu"
      className="absolute left-0 top-[calc(100%+1px)] min-w-[230px] rounded-[7px] border border-black/15 bg-[#ececec]/80 p-[5px] text-[13.5px] font-normal text-[#1d1d1f] shadow-[0_10px_30px_rgba(0,0,0,0.25),inset_0_0_0_0.5px_rgba(255,255,255,0.6)] backdrop-blur-3xl [text-shadow:none]"
    >
      {items.map((item, index) =>
        "separator" in item ? (
          <div key={index} className="mx-2 my-1 h-px bg-black/10" />
        ) : (
          <button
            key={index}
            role="menuitem"
            disabled={item.disabled}
            onClick={() => {
              item.onSelect();
              onClose();
            }}
            className="flex w-full items-center gap-1.5 rounded-[4px] px-2 py-[2px] text-left enabled:hover:bg-[#0a82ff] enabled:hover:text-white disabled:text-black/30"
          >
            <span className="w-3 text-xs">{item.checked ? "✓" : ""}</span>
            <span className="flex-1 truncate">{item.label}</span>
            {item.shortcut && (
              <span className="text-xs opacity-60">{item.shortcut}</span>
            )}
          </button>
        )
      )}
    </div>
  );
}

// Matches the macOS menu bar clock, e.g. "Wed 8 Mar 3:19 pm".
function formatMenuBarClock(date: Date) {
  const weekday = date.toLocaleDateString("en-GB", { weekday: "short" });
  const day = date.getDate();
  const month = date.toLocaleDateString("en-GB", { month: "short" });
  const hours = date.getHours() % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const period = date.getHours() < 12 ? "am" : "pm";
  return `${weekday} ${day} ${month}  ${hours}:${minutes} ${period}`;
}

// Control Center glyph: two stacked toggles.
function ControlCenterIcon() {
  return (
    <svg viewBox="0 0 20 16" className="h-[15px] w-[18px]" aria-label="Control Center">
      <rect x="1" y="1" width="18" height="6" rx="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="15" cy="4" r="1.8" fill="currentColor" />
      <rect x="1" y="9" width="18" height="6" rx="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="5" cy="12" r="1.8" fill="currentColor" />
    </svg>
  );
}
