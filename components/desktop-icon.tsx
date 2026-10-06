"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import type { DesktopIcon } from "@/lib/types";
import { useWindowManager } from "@/lib/window-manager";
import { AppIcon } from "@/lib/app-icons";
import { launchApp } from "@/lib/launch-app";
import { nearestFreeCell } from "@/lib/desktop-grid";
import { useDesktopSelection } from "@/lib/desktop-selection";
import { DesktopIconContextMenu } from "./desktop-icon-context-menu";
import { AnimatePresence } from "framer-motion";

interface DesktopIconProps {
  icon: DesktopIcon;
}

// Pixels the mouse must travel before a press becomes a drag, so a plain
// click (or the first half of a double-click) never moves the icon.
const DRAG_THRESHOLD = 4;

// Desktop files are anchored to the top-right corner like Finder:
// `position.x` is the distance from the container's right edge.
export function DesktopIconComponent({ icon }: DesktopIconProps) {
  const { updateIconPosition } = useWindowManager();
  const [lastClick, setLastClick] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  const isSelected = useDesktopSelection((s) => s.selected.includes(icon.id));
  const selectOnly = () => useDesktopSelection.getState().select([icon.id]);
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
    offsetRight: number;
    offsetY: number;
  } | null>(null);

  useEffect(() => {
    const getContainer = () =>
      iconRef.current?.offsetParent as HTMLElement | null | undefined;

    const toContainerPosition = (event: MouseEvent) => {
      const press = pressRef.current;
      const rect = getContainer()?.getBoundingClientRect();
      if (!press || !rect) return null;
      return {
        x: Math.max(0, rect.right - event.clientX - press.offsetRight),
        y: Math.max(0, event.clientY - rect.top - press.offsetY),
      };
    };

    const handleMouseMove = (event: MouseEvent) => {
      const press = pressRef.current;
      if (!press) return;

      if (!draggingRef.current) {
        const moved = Math.hypot(
          event.clientX - press.startX,
          event.clientY - press.startY,
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

    const handleDocumentMouseDown = (event: MouseEvent) => {
      const onOtherIcon = (event.target as Element).closest?.("[data-icon-id]");
      if (onOtherIcon && (event.shiftKey || event.metaKey)) return;
      if (!iconRef.current?.contains(event.target as Node)) {
        const { selected, select } = useDesktopSelection.getState();
        if (selected.includes(icon.id))
          select(selected.filter((id) => id !== icon.id));
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleDocumentMouseDown);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleDocumentMouseDown);
    };
  }, [icon.id, updateIconPosition]);

  const handleOpen = () => launchApp(icon.id);

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    selectOnly();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    if (e.shiftKey || e.metaKey) {
      // Shift- or ⌘-click adds or removes this file from the selection.
      const { selected, select } = useDesktopSelection.getState();
      select(
        selected.includes(icon.id)
          ? selected.filter((id) => id !== icon.id)
          : [...selected, icon.id],
      );
      return;
    }
    selectOnly();

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
        offsetRight: rect.right - e.clientX,
        offsetY: e.clientY - rect.top,
      };
    }
  };

  return (
    <>
      <div
        ref={iconRef}
        data-icon-id={icon.id}
        role="button"
        tabIndex={0}
        aria-label={`Open ${icon.title}`}
        onFocus={() => !isSelected && selectOnly()}
        onKeyDown={(e) => {
          if (
            e.key === "Enter" ||
            ((e.metaKey || e.ctrlKey) &&
              (e.key === "o" || e.key === "ArrowDown"))
          ) {
            e.preventDefault();
            handleOpen();
          }
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleOpen();
        }}
        className={`desktop-icon absolute flex h-[104px] w-[96px] select-none flex-col items-center justify-start gap-[3px] ${
          isDragging ? "opacity-70" : ""
        } ${isSnapping ? "snapping" : ""}`}
        style={{
          right: icon.position.x,
          top: icon.position.y,
          cursor: isDragging ? "grabbing" : "default",
        }}
        onMouseDown={handleMouseDown}
        onContextMenu={handleRightClick}
        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
          e.stopPropagation();
          setContextMenu(null); // Close context menu on click
        }}
      >
        <span
          className={`rounded-[5px] p-[3px] ${isSelected ? "bg-black/25" : ""}`}
        >
          <AppIcon appId={icon.id} size={64} />
        </span>
        <span
          className={`pointer-events-none line-clamp-2 max-w-full rounded-[4px] px-1 text-center text-[12px] font-semibold leading-[15px] text-white ${
            isSelected
              ? "bg-[#0a63e1]"
              : "[text-shadow:0_1px_2px_rgba(0,0,0,0.6)]"
          }`}
        >
          {icon.title}
        </span>
      </div>

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
