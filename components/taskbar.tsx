"use client";

import { useState, useEffect, useRef } from "react";
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
import { AnimatePresence, motion } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{ duration: 0.1 }}
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
    </motion.div>
  );
}
import { WifiMenu } from "./system-tray/wifi-menu";

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
  const [isWifiMenuOpen, setIsWifiMenuOpen] = useState(false);
  const [hoveredWindowId, setHoveredWindowId] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    windowId: string;
    x: number;
    y: number;
  } | null>(null);
  const [time, setTime] = useState<Date | null>(null);

  // Update time every second
  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseEnter = (windowId: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredWindowId(windowId);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredWindowId(null);
    }, 300);
  };

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
    if (isWifiMenuOpen) setIsWifiMenuOpen(false);
  };

  return (
    <>
      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <TaskbarContextMenu
            windowId={contextMenu.windowId}
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={() => setContextMenu(null)}
          />
        )}
      </AnimatePresence>

      {/* Wifi Menu */}
      <AnimatePresence>
        {isWifiMenuOpen && (
          <motion.div
            onClick={(e: React.MouseEvent<HTMLDivElement>) =>
              e.stopPropagation()
            }
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <WifiMenu onClose={() => setIsWifiMenuOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Start Menu */}
      <AnimatePresence>
        {isStartMenuOpen && (
          <StartMenu onClose={() => setIsStartMenuOpen(false)} />
        )}
      </AnimatePresence>

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
              onMouseEnter={() => handleMouseEnter(window.id)}
              onMouseLeave={handleMouseLeave}
            >
              <button
                id={`taskbar-item-${window.id}`}
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
                ) : window.icon &&
                  typeof window.icon === "object" &&
                  "src" in window.icon ? (
                  <Image
                    src={window.icon.src}
                    alt={window.title}
                    width={16}
                    height={16}
                    className="w-4 h-4"
                  />
                ) : (
                  <window.icon className="w-4 h-4" />
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
              <AnimatePresence>
                {hoveredWindowId === window.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-full left-0 mb-2 p-3 bg-black/90 rounded shadow-xl border border-white/20 min-w-[250px] max-w-[300px] z-[10000]"
                    onMouseEnter={() => handleMouseEnter(window.id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-white text-sm font-medium truncate flex-1 flex items-center gap-2">
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
                            <span>{window.icon}</span>
                          )
                        ) : window.icon &&
                          typeof window.icon === "object" &&
                          "src" in window.icon ? (
                          <Image
                            src={window.icon.src}
                            alt={window.title}
                            width={16}
                            height={16}
                            className="w-4 h-4"
                          />
                        ) : null}
                        {window.title}
                      </div>
                      <div className="flex gap-1 ml-2">
                        {!window.isMinimized && (
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
                        )}
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
                    <div
                      className="w-full h-32 bg-white rounded-sm flex flex-col border border-[#555] cursor-pointer relative overflow-hidden shadow-sm group/preview"
                      onClick={() => {
                        if (window.isMinimized) restoreWindow(window.id);
                        else setActiveWindow(window.id);
                        setHoveredWindowId(null);
                      }}
                    >
                      {/* Mini Window Header */}
                      <div className="h-6 bg-gradient-to-r from-[#8cb0cf] to-[#6f93b5] flex items-center px-2 gap-1.5 border-b border-[#557799]">
                        <div className="w-3 h-3">
                          {typeof window.icon === "string" ? (
                            window.icon.startsWith("/") ? (
                              <Image
                                src={window.icon}
                                alt=""
                                width={12}
                                height={12}
                                className="w-full h-full"
                              />
                            ) : (
                              <span className="text-[10px]">{window.icon}</span>
                            )
                          ) : window.icon &&
                            typeof window.icon === "object" &&
                            "src" in window.icon ? (
                            <Image
                              src={window.icon.src}
                              alt=""
                              width={12}
                              height={12}
                              className="w-full h-full"
                            />
                          ) : (
                            <window.icon className="w-full h-full text-white" />
                          )}
                        </div>
                        <div className="text-[10px] text-white font-shadow truncate flex-1 select-none">
                          {window.title}
                        </div>
                      </div>

                      {/* Mini Window Content */}
                      <div className="flex-1 bg-[#f0f0f0] flex items-center justify-center relative p-4 group-hover/preview:bg-white transition-colors">
                        <div className="opacity-90 transform scale-100 transition-transform group-hover/preview:scale-110">
                          {typeof window.icon === "string" ? (
                            window.icon.startsWith("/") ? (
                              <Image
                                src={window.icon}
                                alt={window.title}
                                width={48}
                                height={48}
                                className="w-12 h-12 object-contain"
                              />
                            ) : (
                              <span className="text-4xl">{window.icon}</span>
                            )
                          ) : window.icon &&
                            typeof window.icon === "object" &&
                            "src" in window.icon ? (
                            <Image
                              src={window.icon.src}
                              alt={window.title}
                              width={48}
                              height={48}
                              className="w-12 h-12 object-contain"
                            />
                          ) : (
                            <window.icon className="w-12 h-12 text-gray-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
            id="wifi-toggle-btn"
            className={`hover:bg-white/10 p-1 rounded transition-colors ${
              isWifiMenuOpen ? "bg-white/20" : ""
            }`}
            aria-label="Network"
            onClick={(e) => {
              e.stopPropagation();
              setIsWifiMenuOpen(!isWifiMenuOpen);
            }}
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
              {time?.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            <div className="text-white/80">
              {time?.toLocaleDateString([], {
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
