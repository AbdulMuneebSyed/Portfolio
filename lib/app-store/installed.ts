import { create } from "zustand";
import { readJSON, writeJSON } from "../storage";

// Which installable apps the visitor has added or removed in the App Store,
// remembered between visits. Apps without an override use their registry
// default (`preinstalled`). `installing` (not saved) holds when each
// running install started; the ring animates itself in CSS from that.

const STORAGE_KEY = "muneebos-app-store-v1";

interface InstalledState {
  overrides: Record<string, boolean>;
  installing: Record<string, number>;
  loaded: boolean;
  load: () => void;
  setInstalled: (id: string, installed: boolean) => void;
  setInstalling: (id: string, startedAt: number | null) => void;
}

export const useInstalledApps = create<InstalledState>((set, get) => {
  const save = () => writeJSON(STORAGE_KEY, { overrides: get().overrides });
  return {
    overrides: {},
    installing: {},
    loaded: false,
    load: () => {
      if (get().loaded || typeof window === "undefined") return;
      const saved =
        readJSON<{ overrides?: Record<string, boolean> } | null>(STORAGE_KEY, {}) ?? {};
      const overrides =
        saved.overrides && typeof saved.overrides === "object"
          ? saved.overrides
          : {};
      set({ loaded: true, overrides });
    },
    setInstalled: (id, installed) => {
      get().load();
      const overrides = { ...get().overrides, [id]: installed };
      set({ overrides });
      save();
    },
    setInstalling: (id, startedAt) => {
      const installing = { ...get().installing };
      if (startedAt === null) delete installing[id];
      else installing[id] = startedAt;
      set({ installing });
    },
  };
});

export function installOverride(id: string): boolean | undefined {
  const state = useInstalledApps.getState();
  if (!state.loaded) state.load();
  return useInstalledApps.getState().overrides[id];
}
