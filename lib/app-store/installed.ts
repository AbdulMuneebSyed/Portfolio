import { create } from "zustand";

// Which installable apps the visitor has added or removed in the App Store,
// remembered between visits. Apps without an override use their registry
// default (`preinstalled`). Install progress is not saved. `updatedTo` is
// the MuneebOS version the visitor last installed from Updates.

const STORAGE_KEY = "muneebos-app-store-v1";

interface InstalledState {
  overrides: Record<string, boolean>;
  updatedTo: string | null;
  progress: Record<string, number>;
  loaded: boolean;
  load: () => void;
  setInstalled: (id: string, installed: boolean) => void;
  setProgress: (id: string, value: number | null) => void;
  setUpdatedTo: (version: string) => void;
}

export const useInstalledApps = create<InstalledState>((set, get) => {
  const save = () => {
    const { overrides, updatedTo } = get();
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ overrides, updatedTo }),
      );
    } catch {
      /* storage unavailable */
    }
  };
  return {
    overrides: {},
    updatedTo: null,
    progress: {},
    loaded: false,
    load: () => {
      if (get().loaded || typeof window === "undefined") return;
      let saved: { overrides?: Record<string, boolean>; updatedTo?: unknown } =
        {};
      try {
        saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
      } catch {
        /* corrupt or unavailable */
      }
      const overrides =
        saved.overrides && typeof saved.overrides === "object"
          ? saved.overrides
          : {};
      const updatedTo =
        typeof saved.updatedTo === "string" ? saved.updatedTo : null;
      set({ loaded: true, overrides, updatedTo });
    },
    setInstalled: (id, installed) => {
      get().load();
      const overrides = { ...get().overrides, [id]: installed };
      set({ overrides });
      save();
    },
    setProgress: (id, value) => {
      const progress = { ...get().progress };
      if (value === null) delete progress[id];
      else progress[id] = value;
      set({ progress });
    },
    setUpdatedTo: (updatedTo) => {
      get().load();
      set({ updatedTo });
      save();
    },
  };
});

export function installOverride(id: string): boolean | undefined {
  const state = useInstalledApps.getState();
  if (!state.loaded) state.load();
  return useInstalledApps.getState().overrides[id];
}
