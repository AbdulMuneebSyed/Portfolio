"use client";

import type React from "react";

import { useRef, useState, useEffect } from "react";
import { useWindowManager } from "@/lib/window-manager";
import type { WindowState } from "@/lib/types";
import { X, Minus, Square } from "lucide-react";
import Image from "next/image";
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
    aeroEffects,
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
      const taskbarItem = document.getElementById(`taskbar-item-${window.id}`);
      if (taskbarItem) {
        const rect = taskbarItem.getBoundingClientRect();
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
        const newY = Math.max(0, e.clientY - dragOffset.y);
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

  // if (window.isMinimized) return null;

  const style = window.isMaximized
    ? { top: 0, left: 0, width: "100vw", height: "calc(100vh - 48px)" }
    : {
        top: Math.max(
          0,
          Math.min(
            window.position.y,
            (typeof globalThis !== "undefined" ? globalThis.innerHeight : 800) -
              100
          )
        ),
        left: Math.max(
          0,
          Math.min(
            window.position.x,
            (typeof globalThis !== "undefined" ? globalThis.innerWidth : 1200) -
              200
          )
        ),
        width: Math.min(
          window.size.width,
          (typeof globalThis !== "undefined" ? globalThis.innerWidth : 1200) -
            20
        ),
        height: Math.min(
          window.size.height,
          (typeof globalThis !== "undefined" ? globalThis.innerHeight : 800) -
            60
        ),
      };

  return (
    <motion.div
      ref={windowRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={
        window.isMinimized && minimizeTarget
          ? {
              opacity: 0,
              scale: 0,
              transition: {
                duration: 0.4,
                ease: [0.4, 0, 0.2, 1],
                opacity: { duration: 0.3, delay: 0.1 },
              },
              transitionEnd: { display: "none" },
            }
          : {
              opacity: 1,
              scale: 1,
              display: "flex",
              transition: { duration: 0.3, ease: "easeOut" },
            }
      }
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className={`absolute rounded-md overflow-hidden flex flex-col ${
        aeroEffects ? "aero-glass" : "bg-white border border-gray-300"
      }`}
      style={{
        ...style,
        zIndex: window.zIndex,
        transformOrigin: minimizeTarget
          ? `${minimizeTarget.x - window.position.x}px ${
              minimizeTarget.y - window.position.y
            }px`
          : "center",
        backdropFilter: aeroEffects ? "blur(22px) saturate(1.55)" : "none",
      }}
    >
      {/* Title Bar */}
      <div
        className={`${
          window.isActive ? "aero-titlebar-active" : "aero-titlebar-inactive"
        } h-8 px-2 flex items-center relative justify-between cursor-move select-none`}
        onMouseDown={(e) => {
          setActiveWindow(window.id);
          handleMouseDown(e);
        }}
      >
        <div className="flex min-w-0 items-center gap-2 pr-32">
          <Image
            src={
              typeof window.icon === "string" ? window.icon : window.icon.src
            }
            alt={window.title}
            width={16}
            height={16}
            className="size-4 shrink-0 drop-shadow-sm"
          />
          <span className="truncate text-xs font-semibold text-[#081827] drop-shadow-[0_1px_0_rgba(255,255,255,0.85)]">
            {window.title}
          </span>
        </div>
        <div className="absolute right-2 top-0 flex items-center overflow-hidden rounded-b-md border border-t-0 border-white/35 bg-slate-500/50 text-white shadow-md">
          <button
            className="aero-button flex h-5 w-8 items-center justify-center border-y-0 border-l-0 border-r-white/20 text-white hover:bg-white/30"
            onClick={() => minimizeWindow(window.id)}
            aria-label="Minimize"
          >
            <Minus className="size-3.5 text-[#fff]" />
          </button>
          {!window.disableMaximize && (
            <button
              className="aero-button flex h-5 w-8 items-center justify-center border-y-0 border-l-0 border-r-white/20 text-white hover:bg-white/30"
              onClick={() => maximizeWindow(window.id)}
              aria-label="Maximize"
            >
              <Square className="size-3 text-[#f6f2f2]" />
            </button>
          )}
          <button
            className="aero-button flex h-5 w-12 items-center justify-center border-y-0 border-r-0 bg-gradient-to-b from-[#ee9488] via-[#c84232] to-[#8d170d] text-white hover:from-[#ffb2a8] hover:via-[#e64a3b] hover:to-[#a91b10] hover:text-white"
            onClick={() => closeWindow(window.id)}
            aria-label="Close"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div
        className="m-1 mt-0 flex-1 overflow-auto rounded-sm border border-[#7d9fbd] bg-white shadow-[0_1px_0_rgba(255,255,255,0.72)]"
        onMouseDown={() => setActiveWindow(window.id)}
      >
        {children}
      </div>

      {/* Resize Handles */}
      {!window.isMaximized && (
        <>
          {/* Corner resize handles */}
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize bg-transparent hover:bg-blue-500/20"
            onMouseDown={(e) => handleResizeMouseDown(e, "bottom-right")}
          />
          <div
            className="absolute top-0 right-0 w-4 h-4 cursor-nesw-resize bg-transparent hover:bg-blue-500/20"
            onMouseDown={(e) => handleResizeMouseDown(e, "top-right")}
          />
          <div
            className="absolute top-0 left-0 w-4 h-4 cursor-nwse-resize bg-transparent hover:bg-blue-500/20"
            onMouseDown={(e) => handleResizeMouseDown(e, "top-left")}
          />
          <div
            className="absolute bottom-0 left-0 w-4 h-4 cursor-nesw-resize bg-transparent hover:bg-blue-500/20"
            onMouseDown={(e) => handleResizeMouseDown(e, "bottom-left")}
          />

          {/* Edge resize handles */}
          <div
            className="absolute top-0 left-4 right-4 h-2 cursor-ns-resize bg-transparent hover:bg-blue-500/20"
            onMouseDown={(e) => handleResizeMouseDown(e, "top")}
          />
          <div
            className="absolute bottom-0 left-4 right-4 h-2 cursor-ns-resize bg-transparent hover:bg-blue-500/20"
            onMouseDown={(e) => handleResizeMouseDown(e, "bottom")}
          />
          <div
            className="absolute left-0 top-4 bottom-4 w-2 cursor-ew-resize bg-transparent hover:bg-blue-500/20"
            onMouseDown={(e) => handleResizeMouseDown(e, "left")}
          />
          <div
            className="absolute right-0 top-4 bottom-4 w-2 cursor-ew-resize bg-transparent hover:bg-blue-500/20"
            onMouseDown={(e) => handleResizeMouseDown(e, "right")}
          />
        </>
      )}
    </motion.div>
  );
}
