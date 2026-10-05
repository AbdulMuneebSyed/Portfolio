import { create } from "zustand";

// Menu bar / Control Center settings, remembered between visits.
interface SystemControlsState {
  wifiOn: boolean;
  bluetoothOn: boolean;
  focusOn: boolean;
  brightness: number; // 0.3 – 1, applied to the desktop as a CSS filter
  volume: number; // 0 – 1, scales the UI click sound
  setWifiOn: (on: boolean) => void;
  setBluetoothOn: (on: boolean) => void;
  setFocusOn: (on: boolean) => void;
  setBrightness: (value: number) => void;
  setVolume: (value: number) => void;
  loadControls: () => void;
}

const STORAGE_KEY = "muneebos-controls-v1";

type Persisted = Pick<
  SystemControlsState,
  "wifiOn" | "bluetoothOn" | "focusOn" | "brightness" | "volume"
>;

const DEFAULTS: Persisted = {
  wifiOn: true,
  bluetoothOn: true,
  focusOn: false,
  brightness: 1,
  volume: 0.6,
};

export const MIN_BRIGHTNESS = 0.3;

export const useSystemControls = create<SystemControlsState>((set, get) => {
  const save = () => {
    if (typeof window === "undefined") return;
    const { wifiOn, bluetoothOn, focusOn, brightness, volume } = get();
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ wifiOn, bluetoothOn, focusOn, brightness, volume })
      );
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
