"use client";

import { ContextMenu } from "./context-menu";

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
  return (
    <ContextMenu
      x={x}
      y={y}
      onClose={onClose}
      items={[{ label: "Open", onClick: onOpen }]}
    />
  );
}
