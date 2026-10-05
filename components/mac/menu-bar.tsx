"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Volume2, Wifi } from "lucide-react";
import { getApp } from "@/lib/app-registry";
import { launchApp, MENU_BAR_HEIGHT } from "@/lib/launch-app";
import { useWindowManager } from "@/lib/window-manager";
import { MuneebLogo } from "./muneeb-logo";

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
      title: <MuneebLogo className="size-[15px]" />,
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

  const clock = now
    ? `${now.toLocaleDateString([], {
        weekday: "short",
        day: "numeric",
        month: "short",
      })}  ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    : "";

  return (
    <div
      ref={barRef}
      className="fixed inset-x-0 top-0 z-[9500] flex select-none items-center justify-between bg-black/25 px-2 text-[13px] text-white shadow-[0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl backdrop-saturate-150"
      style={{ height: MENU_BAR_HEIGHT }}
    >
      <div className="flex h-full items-center">
        {menus.map((menu) => (
          <div key={menu.id} className="relative h-full">
            <button
              data-menu-id={menu.id}
              className={`flex h-full items-center rounded px-2.5 ${
                menu.bold ? "font-semibold" : "font-medium"
              } ${openMenuId === menu.id ? "bg-white/25" : ""}`}
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

      <div className="flex h-full items-center gap-1 pr-1">
        <span className="flex h-full items-center px-1.5" aria-label="Volume">
          <Volume2 className="size-4" />
        </span>
        <span className="flex h-full items-center px-1.5" aria-label="Wi-Fi">
          <Wifi className="size-4" />
        </span>
        <button
          className="flex h-full items-center rounded px-1.5 hover:bg-white/20"
          onClick={onOpenSpotlight}
          aria-label="Spotlight"
        >
          <Search className="size-4" />
        </button>
        <span className="whitespace-pre px-2 font-medium tabular-nums">
          {clock}
        </span>
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
      className="absolute left-0 top-[calc(100%+2px)] min-w-[220px] rounded-lg border border-black/10 bg-[#f2f2f2]/85 p-1 text-[13px] text-[#1d1d1f] shadow-[0_12px_40px_rgba(0,0,0,0.3)] backdrop-blur-2xl"
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
            className="flex w-full items-center gap-2 rounded-[5px] px-2 py-[3px] text-left enabled:hover:bg-[#0a63e1] enabled:hover:text-white disabled:text-black/30"
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
