import { create } from "zustand";

// Menu bar / Control Center settings, remembered between visits.
interface SystemControlsState {
  wifiOn: boolean;
  bluetoothOn: boolean;
  focusOn: boolean;
  airdropOn: boolean;
  darkMode: boolean;
  stageManagerOn: boolean;
  mirroringOn: boolean;
  brightness: number; // 0.3 – 1, dims the desktop with an overlay
  volume: number; // 0 – 1, click sound and Now Playing volume
  setWifiOn: (on: boolean) => void;
  setBluetoothOn: (on: boolean) => void;
  setFocusOn: (on: boolean) => void;
  setAirdropOn: (on: boolean) => void;
  setDarkMode: (on: boolean) => void;
  setStageManagerOn: (on: boolean) => void;
  setMirroringOn: (on: boolean) => void;
  setBrightness: (value: number) => void;
  setVolume: (value: number) => void;
  loadControls: () => void;
}

const STORAGE_KEY = "muneebos-controls-v1";

type Persisted = Pick<
  SystemControlsState,
  | "wifiOn"
  | "bluetoothOn"
  | "focusOn"
  | "airdropOn"
  | "darkMode"
  | "stageManagerOn"
  | "mirroringOn"
  | "brightness"
  | "volume"
>;

const DEFAULTS: Persisted = {
  wifiOn: true,
  bluetoothOn: true,
  focusOn: false,
  airdropOn: false,
  darkMode: false,
  stageManagerOn: false,
  mirroringOn: false,
  brightness: 1,
  volume: 0.6,
};

export const MIN_BRIGHTNESS = 0.3;

export const useSystemControls = create<SystemControlsState>((set, get) => {
  const save = () => {
    if (typeof window === "undefined") return;
    const state = get();
    const persisted: Persisted = {
      wifiOn: state.wifiOn,
      bluetoothOn: state.bluetoothOn,
      focusOn: state.focusOn,
      airdropOn: state.airdropOn,
      darkMode: state.darkMode,
      stageManagerOn: state.stageManagerOn,
      mirroringOn: state.mirroringOn,
      brightness: state.brightness,
      volume: state.volume,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    } catch {
      /* storage unavailable */
    }
  };

  const update = (patch: Partial<Persisted>) => {
    set(patch);
    save();
  };

  return {
    ...DEFAULTS,
    setWifiOn: (wifiOn) => update({ wifiOn }),
    setBluetoothOn: (bluetoothOn) => update({ bluetoothOn }),
    setFocusOn: (focusOn) => update({ focusOn }),
    setAirdropOn: (airdropOn) => update({ airdropOn }),
    setDarkMode: (darkMode) => update({ darkMode }),
    setStageManagerOn: (stageManagerOn) => update({ stageManagerOn }),
    setMirroringOn: (mirroringOn) => update({ mirroringOn }),
    setBrightness: (brightness) =>
      update({ brightness: Math.min(1, Math.max(MIN_BRIGHTNESS, brightness)) }),
    setVolume: (volume) => update({ volume: Math.min(1, Math.max(0, volume)) }),
    loadControls: () => {
      if (typeof window === "undefined") return;
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
        if (saved) set({ ...DEFAULTS, ...saved });
      } catch {
        /* corrupted settings — keep defaults */
      }
    },
  };
});
