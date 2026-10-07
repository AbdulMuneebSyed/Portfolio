import { create } from "zustand";

// A window being dragged in Mission Control towards the desktop strip.
// `target` is the desktop under the pointer, "new" for the + button.
export interface MissionDrag {
  windowId: string;
  appId: string;
  title: string;
  x: number;
  y: number;
  target: string | "new" | null;
}

// Mission Control: every open window spread out side by side (Ctrl+↑ / F3).
interface MissionControlState {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  drag: MissionDrag | null;
  setDrag: (drag: MissionDrag | null) => void;
}

export const useMissionControl = create<MissionControlState>((set) => ({
  open: false,
  setOpen: (open) => set({ open, drag: null }),
  toggle: () => set((state) => ({ open: !state.open, drag: null })),
  drag: null,
  setDrag: (drag) => set({ drag }),
}));

// The desktop thumbnail (or the + button) under a screen point, read from
// the strip's data attributes.
export function spaceTargetAt(x: number, y: number): string | "new" | null {
  if (typeof document === "undefined") return null;
  const el = document
    .elementsFromPoint(x, y)
    .find((e) => (e as HTMLElement).dataset?.spaceTarget) as
    | HTMLElement
    | undefined;
  return el?.dataset.spaceTarget ?? null;
}

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
