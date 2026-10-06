import { create } from "zustand";

// Selected desktop files, shared by the icons and the rubber-band selection.
interface DesktopSelectionState {
  selected: string[];
  select: (ids: string[]) => void;
  clear: () => void;
}

export const useDesktopSelection = create<DesktopSelectionState>((set) => ({
  selected: [],
  select: (selected) => set({ selected }),
  clear: () => set({ selected: [] }),
}));
