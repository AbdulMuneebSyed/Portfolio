"use client";

import type React from "react";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface ContextMenuItem {
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
  separator?: boolean;
  icon?: string;
}

interface DesktopIconContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onOpen: () => void;
}

export function DesktopIconContextMenu({
  x,
  y,
  onClose,
  onOpen,
}: DesktopIconContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [onClose]);

  const menuItems: ContextMenuItem[] = [
    {
      label: "Open",
      onClick: onOpen,
      disabled: false,
      icon: "📂",
    },
    { separator: true },
    {
      label: "Cut",
      disabled: true,
    },
    {
      label: "Copy",
      disabled: true,
    },
    { separator: true },
    {
      label: "Create Shortcut",
      disabled: true,
    },
    {
      label: "Delete",
      disabled: true,
    },
    {
      label: "Rename",
      disabled: true,
    },
    { separator: true },
    {
      label: "Properties",
      disabled: true,
    },
  ];

  // Adjust position to ensure menu stays within viewport
  const menuWidth = 180;
  const menuHeight = menuItems.length * 24; // Approximate height
  const adjustedX = x + menuWidth > window.innerWidth ? x - menuWidth : x;
  const adjustedY = y + menuHeight > window.innerHeight ? y - menuHeight : y;

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
      transition={{ duration: 0.1 }}
      className="fixed z-[9999] min-w-[180px] bg-white border border-gray-300 shadow-lg rounded-sm"
      style={{
        left: adjustedX,
        top: adjustedY,
        background: "linear-gradient(to bottom, #ffffff 0%, #f5f5f5 100%)",
        border: "1px solid #999999",
        boxShadow: "2px 2px 8px rgba(0, 0, 0, 0.3)",
      }}
    >
      {menuItems.map((item, index) => {
        if (item.separator) {
          return (
            <div
              key={index}
              className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-2 my-1"
            />
          );
        }

        return (
          <div
            key={index}
            className={`
              px-3 py-1.5 text-sm flex items-center gap-2 cursor-pointer
              ${
                item.disabled
                  ? "text-gray-400 cursor-default"
                  : "text-black hover:bg-gradient-to-r hover:from-[#4080ff] hover:to-[#5090ff] hover:text-white"
              }
            `}
            onClick={(e) => {
              e.stopPropagation();
              if (!item.disabled && item.onClick) {
                item.onClick();
                onClose();
              }
            }}
            style={{
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              fontSize: "11px",
            }}
          >
            {item.icon && (
              <span className="w-4 h-4 flex items-center justify-center text-xs">
                {item.icon}
              </span>
            )}
            <span className={item.icon ? "" : "ml-6"}>{item.label}</span>
            {item.disabled && <span className="ml-auto text-gray-300"></span>}
          </div>
        );
      })}
    </motion.div>
  );
}
