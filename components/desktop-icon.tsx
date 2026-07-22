"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import type { DesktopIcon } from "@/lib/types";
import { useWindowManager } from "@/lib/window-manager";
import { getApp } from "@/lib/app-registry";
import Image from "next/image";
import { DesktopIconContextMenu } from "./desktop-icon-context-menu";
import { motion, AnimatePresence } from "framer-motion";

interface DesktopIconProps {
  icon: DesktopIcon;
}

const GRID_SIZE = 100; // Grid cell size in pixels

export function DesktopIconComponent({ icon }: DesktopIconProps) {
  const { openWindow, updateIconPosition } = useWindowManager();
  const [lastClick, setLastClick] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  const snapToGrid = (value: number) => {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (event: MouseEvent) => {
      const nextX = Math.max(0, event.clientX - dragOffset.x);
      const nextY = Math.max(0, event.clientY - dragOffset.y);
      updateIconPosition(icon.id, { x: nextX, y: nextY });
    };

    const handleMouseUp = (event: MouseEvent) => {
      const nextX = snapToGrid(Math.max(0, event.clientX - dragOffset.x));
      const nextY = snapToGrid(Math.max(0, event.clientY - dragOffset.y));
      setIsDragging(false);
      setIsSnapping(true);
      updateIconPosition(icon.id, { x: nextX, y: nextY });
      window.setTimeout(() => setIsSnapping(false), 180);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp, { once: true });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    dragOffset.x,
    dragOffset.y,
    icon.id,
    isDragging,
    updateIconPosition,
  ]);

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
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
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
        className={`desktop-icon flex flex-col items-center justify-center w-[64px] h-[72px] sm:w-[72px] sm:h-[80px] md:w-[80px] md:h-[88px] select-none transition-colors ${
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
