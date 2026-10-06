import { create } from "zustand";

// Mission Control: every open window spread out side by side (Ctrl+↑ / F3).
interface MissionControlState {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

export const useMissionControl = create<MissionControlState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set((state) => ({ open: !state.open })),
}));

export interface MissionArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Grid slots for Mission Control; the last row is centred.
export function missionLayout(count: number, area: MissionArea) {
  if (count === 0) return [];
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  const cellWidth = area.width / cols;
  const cellHeight = area.height / rows;
  return Array.from({ length: count }, (_, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    const inRow = row === rows - 1 ? count - row * cols : cols;
    const offset = ((cols - inRow) * cellWidth) / 2;
    return {
      cx: area.x + offset + cellWidth * (col + 0.5),
      cy: area.y + cellHeight * (row + 0.5),
      maxWidth: cellWidth - 48,
      maxHeight: cellHeight - 48,
    };
  });
}
