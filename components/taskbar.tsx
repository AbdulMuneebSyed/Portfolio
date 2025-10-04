"use client";

import { useState } from "react";
import { useWindowManager } from "@/lib/window-manager";
import {
  Clock,
  Volume2,
  Wifi,
  Battery,
  X,
  Maximize2,
  Minimize2,
  Square,
} from "lucide-react";
import { StartMenu } from "./start-menu";
import Image from "next/image";
import starticon from "../public/windowsstart.png";

interface TaskbarContextMenuProps {
  windowId: string;
  x: number;
  y: number;
  onClose: () => void;
}

function TaskbarContextMenu({
  windowId,
  x,
  y,
  onClose,
}: TaskbarContextMenuProps) {
  const {
    windows,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    closeWindow,
  } = useWindowManager();
  const window = windows.find((w) => w.id === windowId);

  if (!window) return null;

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div
      className="fixed z-[10000] min-w-[140px] bg-white border border-gray-300 shadow-lg rounded-sm"
      style={{
        left: x,
        top: y - 120, // Position above taskbar
        background: "linear-gradient(to bottom, #ffffff 0%, #f5f5f5 100%)",
        border: "1px solid #999999",
        boxShadow: "2px 2px 8px rgba(0, 0, 0, 0.3)",
      }}
    >
      {!window.isMinimized && (
        <div
          className="px-3 py-1.5 text-sm cursor-pointer hover:bg-gradient-to-r hover:from-[#4080ff] hover:to-[#5090ff] hover:text-white flex items-center gap-2"
          onClick={() => handleAction(() => minimizeWindow(windowId))}
        >
          <Minimize2 className="w-3 h-3" />
          Minimize
        </div>
      )}
      {window.isMinimized && (
        <div
          className="px-3 py-1.5 text-sm cursor-pointer hover:bg-gradient-to-r hover:from-[#4080ff] hover:to-[#5090ff] hover:text-white flex items-center gap-2"
          onClick={() => handleAction(() => restoreWindow(windowId))}
        >
          <Square className="w-3 h-3" />
          Restore
        </div>
      )}
      <div
        className="px-3 py-1.5 text-sm cursor-pointer hover:bg-gradient-to-r hover:from-[#4080ff] hover:to-[#5090ff] hover:text-white flex items-center gap-2"
        onClick={() => handleAction(() => maximizeWindow(windowId))}
      >
        <Maximize2 className="w-3 h-3" />
        {window.isMaximized ? "Restore" : "Maximize"}
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-2 my-1" />
      <div
        className="px-3 py-1.5 text-sm cursor-pointer hover:bg-gradient-to-r hover:from-[#ff4040] hover:to-[#ff5050] hover:text-white flex items-center gap-2"
        onClick={() => handleAction(() => closeWindow(windowId))}
      >
        <X className="w-3 h-3" />
        Close window
      </div>
    </div>
  );
}
export function Taskbar() {
  const {
    windows,
    restoreWindow,
    setActiveWindow,
    minimizeWindow,
    closeWindow,
    taskbarTransparency,
  } = useWindowManager();
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [hoveredWindowId, setHoveredWindowId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    windowId: string;
    x: number;
    y: number;
  } | null>(null);
  const [time, setTime] = useState(new Date());

  // Update time every second
  useState(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  });

  const handleTaskbarItemClick = (windowId: string) => {
    const window = windows.find((w) => w.id === windowId);
    if (window?.isMinimized) {
      restoreWindow(windowId);
    } else if (window?.isActive) {
      // If window is active, minimize it
      minimizeWindow(windowId);
    } else {
      setActiveWindow(windowId);
    }
  };

  const handleTaskbarItemRightClick = (
    e: React.MouseEvent,
    windowId: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ windowId, x: e.clientX, y: e.clientY });
  };

  // Close context menu when clicking outside
  const handleGlobalClick = () => {
    setContextMenu(null);
  };

  return (
    <>
      {/* Context Menu */}
      {contextMenu && (
        <TaskbarContextMenu
          windowId={contextMenu.windowId}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Start Menu */}
      {isStartMenuOpen && (
        <StartMenu onClose={() => setIsStartMenuOpen(false)} />
      )}

      {/* Taskbar */}
      <div
        className="fixed bottom-0 left-0 right-0 h-10 flex items-center px-2 gap-2 z-[9999]"
        style={{
          background: `rgba(0, 0, 0, ${(100 - taskbarTransparency) / 100})`,
          backdropFilter: taskbarTransparency > 20 ? "blur(10px)" : "none",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
        onClick={handleGlobalClick}
      >
        {/* Start Button */}
        <button
          className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg border-2 border-white/30`}
          onClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
          aria-label="Start Menu"
          style={{
            backgroundImage: `url(${starticon.src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        ></button>

        {/* Separator */}
        <div className="w-px h-8 bg-white/20" />

        {/* Running Applications */}
        <div className="flex-1 flex items-center gap-1">
          {windows.map((window) => (
            <div
              key={window.id}
              className="relative group"
              onMouseEnter={() => setHoveredWindowId(window.id)}
              onMouseLeave={() => setHoveredWindowId(null)}
            >
              <button
                className={`h-10 px-4 rounded flex items-center gap-2 transition-all relative ${
                  window.isActive
                    ? "bg-white/20 shadow-inner"
                    : window.isMinimized
                    ? "bg-white/5 opacity-70"
                    : "hover:bg-white/10"
                }`}
                onClick={() => handleTaskbarItemClick(window.id)}
                onContextMenu={(e) => handleTaskbarItemRightClick(e, window.id)}
              >
                {typeof window.icon === "string" ? (
                  window.icon.startsWith("/") ? (
                    <Image
                      src={window.icon}
                      alt={window.title}
                      width={16}
                      height={16}
                      className="w-4 h-4"
                    />
                  ) : (
                    <span className="text-lg">{window.icon}</span>
                  )
                ) : (
                  <Image
                    src={window.icon.src}
                    alt={window.title}
                    width={16}
                    height={16}
                    className="w-4 h-4"
                  />
                )}
                <span className="text-sm text-white font-medium max-w-[120px] truncate">
                  {window.title}
                </span>

                {/* Close button on hover - inside the button */}
                <button
                  className="ml-2 w-4 h-4 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeWindow(window.id);
                  }}
                  aria-label="Close window"
                >
                  <X className="w-2.5 h-2.5 text-white" />
                </button>
              </button>

              {/* Enhanced Aero Peek Preview */}
              {hoveredWindowId === window.id && !window.isMinimized && (
                <div className="absolute bottom-full left-0 mb-2 p-3 bg-black/90 rounded shadow-xl border border-white/20 min-w-[250px] max-w-[300px]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-white text-sm font-medium truncate flex-1">
                      {window.title}
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button
                        className="w-6 h-6 bg-white/20 hover:bg-white/30 rounded flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          minimizeWindow(window.id);
                          setHoveredWindowId(null);
                        }}
                        aria-label="Minimize"
                      >
                        <Minimize2 className="w-3 h-3 text-white" />
                      </button>
                      <button
                        className="w-6 h-6 bg-red-500 hover:bg-red-600 rounded flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          closeWindow(window.id);
                          setHoveredWindowId(null);
                        }}
                        aria-label="Close"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  </div>
                  <div className="w-full h-32 bg-white/10 rounded flex items-center justify-center text-white/70 text-xs border border-white/20">
                    <div className="text-center">
                      <div className="mb-1">🪟 Window Preview</div>
                      <div className="text-white/50">Click to focus window</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* System Tray */}
        <div className="flex items-center gap-3 px-3 border-l border-white/20">
          <button
            className="hover:bg-white/10 p-1 rounded transition-colors"
            aria-label="Volume"
          >
            <Volume2 className="w-4 h-4 text-white" />
          </button>
          <button
            className="hover:bg-white/10 p-1 rounded transition-colors"
            aria-label="Network"
          >
            <Wifi className="w-4 h-4 text-white" />
          </button>
          <button
            className="hover:bg-white/10 p-1 rounded transition-colors"
            aria-label="Battery"
          >
            <Battery className="w-4 h-4 text-white" />
          </button>
          <div className="flex flex-col items-end text-white text-xs leading-tight">
            <div className="font-medium">
              {time.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            <div className="text-white/80">
              {time.toLocaleDateString([], {
                month: "numeric",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
