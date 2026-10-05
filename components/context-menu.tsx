"use client";
import type React from "react";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface ContextMenuItem {
  label?: string;
  disabled?: boolean;
  separator?: boolean;
  onClick?: () => void;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [onClose]);

  // Keep the menu inside the viewport.
  const menuWidth = 220;
  const menuHeight = items.length * 24 + 8;
  const left =
    typeof window !== "undefined" && x + menuWidth > window.innerWidth
      ? x - menuWidth
      : x;
  const top =
    typeof window !== "undefined" && y + menuHeight > window.innerHeight
      ? Math.max(0, y - menuHeight)
      : y;

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.1 } }}
      transition={{ duration: 0.08 }}
      className="font-mac fixed z-[10000] min-w-[220px] rounded-[7px] border border-black/15 bg-[#ececec]/80 p-[5px] text-[13.5px] text-[#1d1d1f] shadow-[0_10px_30px_rgba(0,0,0,0.25),inset_0_0_0_0.5px_rgba(255,255,255,0.6)] backdrop-blur-3xl"
      style={{ left, top }}
      onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
    >
      {items.map((item, index) => {
        if (item.separator) {
          return <div key={index} className="mx-2 my-1 h-px bg-black/10" />;
        }

        return (
          <button
            key={index}
            className="flex w-full items-center justify-between rounded-[4px] px-2.5 py-[2px] text-left enabled:hover:bg-[#0a82ff] enabled:hover:text-white disabled:text-black/30"
            onClick={(e) => {
              e.stopPropagation();
              if (!item.disabled && item.onClick) {
                item.onClick();
                onClose();
              }
            }}
            disabled={item.disabled}
          >
            <span>{item.label}</span>
          </button>
        );
      })}
    </motion.div>
  );
}
