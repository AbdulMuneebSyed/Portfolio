"use client";

import type React from "react";

import { useRef, useState, useEffect } from "react";
import { useWindowManager } from "@/lib/window-manager";
import type { WindowState } from "@/lib/types";
import { X, Minus, Plus } from "lucide-react";
import { DOCK_RESERVED_HEIGHT, MENU_BAR_HEIGHT } from "@/lib/launch-app";
import { motion } from "framer-motion";

interface WindowProps {
  window: WindowState;
  children: React.ReactNode;
}

export function Window({ window, children }: WindowProps) {
  const {
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    setActiveWindow,
    updateWindowPosition,
    updateWindowSize,
  } = useWindowManager();
  const windowRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    direction: "bottom-right",
  });

  const [minimizeTarget, setMinimizeTarget] = useState<{
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    if (window.isMinimized) {
      const dockItem = document.getElementById(
        `dock-item-${window.appId ?? window.id}`
      );
      if (dockItem) {
        const rect = dockItem.getBoundingClientRect();
        setMinimizeTarget({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }
    }
  }, [window.isMinimized, window.id]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (window.isMaximized) return;
    setActiveWindow(window.id);
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - window.position.x,
      y: e.clientY - window.position.y,
    });
  };

  const handleResizeMouseDown = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: direction.includes("left") ? window.position.x : e.clientX,
      y: direction.includes("top") ? window.position.y : e.clientY,
      width: window.size.width,
      height: window.size.height,
      direction,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = Math.max(MENU_BAR_HEIGHT, e.clientY - dragOffset.y);
        updateWindowPosition(window.id, { x: newX, y: newY });
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;

        const direction = resizeStart.direction;
        let newX = window.position.x;
        let newY = window.position.y;
        let newWidth = window.size.width;
        let newHeight = window.size.height;

        // Handle horizontal resizing
        if (direction.includes("left")) {
          newWidth = Math.max(400, resizeStart.width - deltaX);
          newX = resizeStart.x + deltaX;
        } else if (direction.includes("right")) {
          newWidth = Math.max(400, resizeStart.width + deltaX);
        }

        // Handle vertical resizing
        if (direction.includes("top")) {
          newHeight = Math.max(300, resizeStart.height - deltaY);
          newY = resizeStart.y + deltaY;
        } else if (direction.includes("bottom")) {
          newHeight = Math.max(300, resizeStart.height + deltaY);
        }

        // Ensure window stays within screen bounds
        const maxWidth =
          (typeof globalThis !== "undefined" ? globalThis.innerWidth : 1200) -
          newX;
        const maxHeight =
          (typeof globalThis !== "undefined" ? globalThis.innerHeight : 800) -
          newY;

        newWidth = Math.min(newWidth, maxWidth);
        newHeight = Math.min(newHeight, maxHeight);

        updateWindowPosition(window.id, { x: newX, y: newY });
        updateWindowSize(window.id, { width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [
    isDragging,
    isResizing,
    dragOffset,
    resizeStart,
    window.id,
    updateWindowPosition,
    updateWindowSize,
  ]);

  const viewportWidth =
    typeof globalThis !== "undefined" ? globalThis.innerWidth : 1200;
  const viewportHeight =
    typeof globalThis !== "undefined" ? globalThis.innerHeight : 800;

  const style = window.isMaximized
    ? {
        top: MENU_BAR_HEIGHT,
        left: 0,
        width: "100vw",
        height: `calc(100vh - ${MENU_BAR_HEIGHT + DOCK_RESERVED_HEIGHT}px)`,
      }
    : {
        top: Math.max(
          MENU_BAR_HEIGHT,
          Math.min(window.position.y, viewportHeight - 100)
        ),
        left: Math.max(0, Math.min(window.position.x, viewportWidth - 200)),
        width: Math.min(window.size.width, viewportWidth - 20),
        height: Math.min(
          window.size.height,
          viewportHeight - MENU_BAR_HEIGHT - 20
        ),
      };

  const trafficLight =
    "flex size-3 items-center justify-center rounded-full border";

  return (
    <motion.div
      ref={windowRef}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={
        window.isMinimized
          ? {
              opacity: 0,
              scale: 0.1,
              transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
              transitionEnd: { display: "none" },
            }
          : {
              opacity: 1,
              scale: 1,
              display: "flex",
              transition: { duration: 0.22, ease: "easeOut" },
            }
      }
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
      className={`absolute flex flex-col overflow-hidden bg-white ${
        window.isMaximized ? "rounded-none" : "rounded-[10px]"
      } ${
        window.isActive
          ? "shadow-[0_22px_70px_rgba(0,0,0,0.45),0_0_0_0.5px_rgba(0,0,0,0.35)]"
          : "shadow-[0_10px_30px_rgba(0,0,0,0.25),0_0_0_0.5px_rgba(0,0,0,0.25)]"
      }`}
      style={{
        ...style,
        zIndex: window.zIndex,
        transformOrigin: minimizeTarget
          ? `${minimizeTarget.x - Number(style.left)}px ${
              minimizeTarget.y - Number(style.top)
            }px`
          : "center bottom",
      }}
    >
      {/* Title bar */}
      <div
        className={`relative flex h-[30px] shrink-0 select-none items-center border-b px-[13px] ${
          window.isActive
            ? "border-black/10 bg-[#ececec] dark:border-black/60 dark:bg-[#2c2c2e]"
            : "border-black/5 bg-[#f6f6f6] dark:border-black/60 dark:bg-[#323234]"
        }`}
        onMouseDown={(e) => {
          setActiveWindow(window.id);
          handleMouseDown(e);
        }}
        onDoubleClick={() => !window.disableMaximize && maximizeWindow(window.id)}
      >
        <div
          className="group flex items-center gap-2"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            className={`${trafficLight} ${
              window.isActive
                ? "border-[#e0443e] bg-[#ff5f57]"
                : "border-black/10 bg-[#dcdcdc] group-hover:border-[#e0443e] group-hover:bg-[#ff5f57]"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              closeWindow(window.id);
            }}
            aria-label="Close"
          >
            <X className="size-2 text-[#4d0000] opacity-0 group-hover:opacity-100" strokeWidth={3} />
          </button>
          <button
            className={`${trafficLight} ${
              window.isActive
                ? "border-[#dea123] bg-[#febc2e]"
                : "border-black/10 bg-[#dcdcdc] group-hover:border-[#dea123] group-hover:bg-[#febc2e]"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              minimizeWindow(window.id);
            }}
            aria-label="Minimize"
          >
            <Minus className="size-2 text-[#5a3d00] opacity-0 group-hover:opacity-100" strokeWidth={3} />
          </button>
          <button
            className={`${trafficLight} ${
              window.disableMaximize
                ? "border-black/10 bg-[#dcdcdc]"
                : window.isActive
                ? "border-[#1aab29] bg-[#28c840]"
                : "border-black/10 bg-[#dcdcdc] group-hover:border-[#1aab29] group-hover:bg-[#28c840]"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              if (!window.disableMaximize) maximizeWindow(window.id);
            }}
            disabled={window.disableMaximize}
            aria-label="Zoom"
          >
            {!window.disableMaximize && (
              <Plus className="size-2 text-[#00400a] opacity-0 group-hover:opacity-100" strokeWidth={3} />
            )}
          </button>
        </div>
        <span
          className={`pointer-events-none absolute inset-x-24 truncate text-center text-[13px] font-semibold ${
            window.isActive
              ? "text-[#4d4d4d] dark:text-[#e5e5e7]"
              : "text-[#b0b0b0] dark:text-[#8e8e93]"
          }`}
        >
          {window.title}
        </span>
      </div>

      {/* Content */}
      <div
        className="flex-1 overflow-auto bg-white"
        onMouseDown={() => setActiveWindow(window.id)}
      >
        {children}
      </div>

      {/* Resize handles */}
      {!window.isMaximized && (
        <>
          <div
            className="absolute bottom-0 right-0 h-4 w-4 cursor-nwse-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, "bottom-right")}
          />
          <div
            className="absolute right-0 top-0 h-4 w-4 cursor-nesw-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, "top-right")}
          />
          <div
            className="absolute left-0 top-0 h-4 w-4 cursor-nwse-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, "top-left")}
          />
          <div
            className="absolute bottom-0 left-0 h-4 w-4 cursor-nesw-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, "bottom-left")}
          />
          <div
            className="absolute bottom-0 left-4 right-4 h-1.5 cursor-ns-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, "bottom")}
          />
          <div
            className="absolute bottom-4 left-0 top-[30px] w-1.5 cursor-ew-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, "left")}
          />
          <div
            className="absolute bottom-4 right-0 top-[30px] w-1.5 cursor-ew-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, "right")}
          />
        </>
      )}
    </motion.div>
  );
}
