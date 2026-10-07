"use client";

import { ContextMenu } from "./context-menu";
import {
  MAX_SPACES,
  spaceOf,
  useWindowManager,
} from "@/lib/window-manager";
import { useDesktopSelection } from "@/lib/desktop-selection";
import type { DesktopIcon } from "@/lib/types";

interface DesktopIconContextMenuProps {
  icon: DesktopIcon;
  x: number;
  y: number;
  onClose: () => void;
  onOpen: () => void;
}

// Open, Rename, Move to Trash, and Move to another desktop. Acts on every
// selected file when the clicked one is part of a selection.
export function DesktopIconContextMenu({
  icon,
  x,
  y,
  onClose,
  onOpen,
}: DesktopIconContextMenuProps) {
  const wm = useWindowManager.getState();
  const selected = useDesktopSelection.getState().selected;
  const ids = selected.includes(icon.id) ? selected : [icon.id];
  const targets = wm.desktopIcons.filter((i) => ids.includes(i.id));
  const folders = targets.filter((i) => i.kind === "folder");
  const here = spaceOf(icon, wm.spaces);
  const many = targets.length > 1;

  const moveItems = wm.spaces
    .map((id, index) => ({ id, index }))
    .filter(({ id }) => id !== here)
    .map(({ id, index }) => ({
      label: `Move to Desktop ${index + 1}`,
      onClick: () => wm.moveIconsToSpace(ids, id),
    }));

  return (
    <ContextMenu
      x={x}
      y={y}
      onClose={onClose}
      items={[
        { label: many ? `Open ${targets.length} Items` : "Open", onClick: onOpen },
        { separator: true },
        {
          label: "Rename",
          disabled: many || icon.kind !== "folder",
          onClick: () => wm.setRenamingIcon(icon.id),
        },
        {
          label: "Move to Trash",
          disabled: !folders.length,
          onClick: () => {
            wm.trashIcons(folders.map((f) => f.id));
            useDesktopSelection.getState().clear();
          },
        },
        { separator: true },
        ...moveItems,
        {
          label: "Move to New Desktop",
          disabled: wm.spaces.length >= MAX_SPACES,
          onClick: () => {
            const id = wm.addSpace();
            if (id) wm.moveIconsToSpace(ids, id);
          },
        },
      ]}
    />
  );
}
