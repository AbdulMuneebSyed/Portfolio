"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface ContextMenuItem {
  label?: string;
  disabled?: boolean;
  separator?: boolean;
  submenu?: ContextMenuItem[];
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

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
      transition={{ duration: 0.1 }}
      className="context-menu fixed z-[10000] min-w-[200px] bg-[#f0f0f0] border border-[#999] rounded shadow-lg py-1"
      style={{ left: x, top: y }}
    >
      {items.map((item, index) => {
        if (item.separator) {
          return <div key={index} className="h-px bg-[#d7d7d7] my-1 mx-2" />;
        }

        return (
          <button
            key={index}
            className={`w-full px-4 py-1.5 text-left text-sm flex items-center justify-between ${
              item.disabled
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-800 hover:bg-[#3399ff] hover:text-white cursor-pointer"
            }`}
            onClick={() => {
              if (!item.disabled && item.onClick) {
                item.onClick();
                onClose();
              }
            }}
            disabled={item.disabled}
          >
            <span>{item.label}</span>
            {item.submenu && <span className="ml-4">▶</span>}
          </button>
        );
      })}
    </motion.div>
  );
}
