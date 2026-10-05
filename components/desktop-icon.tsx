"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import type { DesktopIcon } from "@/lib/types";
import { useWindowManager } from "@/lib/window-manager";
import { getApp } from "@/lib/app-registry";
import { nearestFreeCell } from "@/lib/desktop-grid";
import Image from "next/image";
import { DesktopIconContextMenu } from "./desktop-icon-context-menu";
import { motion, AnimatePresence } from "framer-motion";

interface DesktopIconProps {
  icon: DesktopIcon;
}

// Pixels the mouse must travel before a press becomes a drag, so a plain
// click (or the first half of a double-click) never moves the icon.
const DRAG_THRESHOLD = 4;

export function DesktopIconComponent({ icon }: DesktopIconProps) {
  const { openWindow, updateIconPosition } = useWindowManager();
  const [lastClick, setLastClick] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  // Read by the document listeners; state alone would be stale between
  // a fast mousemove and mouseup.
  const draggingRef = useRef(false);
  const pressRef = useRef<{
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  useEffect(() => {
    const getContainer = () =>
      iconRef.current?.offsetParent as HTMLElement | null | undefined;

    // Icon positions are relative to the icon container, not the viewport.
    const toContainerPosition = (event: MouseEvent) => {
      const press = pressRef.current;
      const rect = getContainer()?.getBoundingClientRect();
      if (!press || !rect) return null;
      return {
        x: Math.max(0, event.clientX - rect.left - press.offsetX),
        y: Math.max(0, event.clientY - rect.top - press.offsetY),
      };
    };

    const handleMouseMove = (event: MouseEvent) => {
      const press = pressRef.current;
      if (!press) return;

      if (!draggingRef.current) {
        const moved = Math.hypot(
          event.clientX - press.startX,
          event.clientY - press.startY
        );
        if (moved < DRAG_THRESHOLD) return;
        draggingRef.current = true;
        setIsDragging(true);
      }

      const position = toContainerPosition(event);
      if (position) updateIconPosition(icon.id, position);
    };

    const handleMouseUp = (event: MouseEvent) => {
      const wasDragging = draggingRef.current;
      const position = wasDragging ? toContainerPosition(event) : null;
      const container = getContainer();
      pressRef.current = null;
      draggingRef.current = false;
      if (!wasDragging || !position || !container) return;

      const occupied = useWindowManager
        .getState()
        .desktopIcons.filter((other) => other.id !== icon.id)
        .map((other) => other.position);
      const snapped = nearestFreeCell(position, occupied, {
        width: container.clientWidth,
        height: container.clientHeight,
      });

      setIsDragging(false);
      setIsSnapping(true);
      updateIconPosition(icon.id, snapped);
      window.setTimeout(() => setIsSnapping(false), 180);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [icon.id, updateIconPosition]);

  const handleOpen = () => {
    const app = getApp(icon.id);

    if (app?.externalUrl) {
      window.open(app.externalUrl, "_blank", "noopener,noreferrer");
      return;
    }

    // Special handling for Games icon to open Computer Explorer with Games folder
    const isGamesIcon = icon.id === "games";

    const metadata = isGamesIcon
      ? {
          initialPath: [
            "Computer",
            "Local Disk (C:)",
            "Program Files",
            "Games",
          ],
        }
      : undefined;

    openWindow({
      id: icon.id,
      title: icon.title,
      icon: typeof icon.icon === "string" ? icon.icon : icon.icon.src,
      component: icon.component,
      isMinimized: false,
      isMaximized: false,
      position: { x: 100 + Math.random() * 200, y: 50 + Math.random() * 100 },
      size: app?.defaultSize ?? { width: 800, height: 600 },
      metadata: app?.metadata ?? metadata,
    });
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click

    const now = Date.now();
    const timeDiff = now - lastClick;

    if (timeDiff < 500 && timeDiff > 0) {
      // Double click detected
      e.preventDefault();
      e.stopPropagation();
      handleOpen();
      setLastClick(0); // Reset to prevent triple-click issues
      return;
    }

    setLastClick(now);
    const rect = iconRef.current?.getBoundingClientRect();
    if (rect) {
      pressRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
      };
    }
  };

  return (
    <>
      <motion.div
        ref={iconRef}
        whileHover={{
          scale: 1.05,
          backgroundColor: "rgba(255, 255, 255, 0.15)",
        }}
        whileTap={{ scale: 0.95, backgroundColor: "rgba(255, 255, 255, 0.25)" }}
        data-icon-id={icon.id}
        className={`desktop-icon flex flex-col items-center justify-start pt-1 w-[64px] h-[72px] sm:w-[72px] sm:h-[80px] md:w-[80px] md:h-[88px] select-none transition-colors ${
          isDragging ? "opacity-70" : ""
        } ${isSnapping ? "snapping" : ""}`}
        style={{
          position: "absolute",
          left: icon.position.x,
          top: icon.position.y,
          cursor: isDragging ? "grabbing" : "pointer",
        }}
        onMouseDown={handleMouseDown}
        onContextMenu={handleRightClick}
        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
          e.stopPropagation();
          setContextMenu(null); // Close context menu on click
        }}
      >
        <Image
          src={typeof icon.icon === "string" ? icon.icon : icon.icon.src}
          alt={icon.title}
          width={40}
          height={40}
          className="sm:w-[44px] sm:h-[44px] md:w-[48px] md:h-[48px]"
        />
        <div className="text-[10px] sm:text-xs text-white text-center font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] pointer-events-none mt-1 max-w-full break-words leading-tight">
          {icon.title}
        </div>
      </motion.div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <DesktopIconContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={() => setContextMenu(null)}
            onOpen={() => {
              handleOpen();
              setContextMenu(null);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
