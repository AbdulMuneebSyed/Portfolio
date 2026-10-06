import { create } from "zustand";
import { useSystemControls } from "./system-controls";

// macOS-style notification banners (top right). Focus mode silences them.
export interface Banner {
  id: number;
  appId: string;
  title: string;
  body: string;
}

const BANNER_DURATION_MS = 5000;
const MAX_BANNERS = 3;
let nextId = 1;

interface NotificationState {
  banners: Banner[];
  notify: (banner: Omit<Banner, "id">) => void;
  dismiss: (id: number) => void;
}

export const useNotifications = create<NotificationState>((set, get) => ({
  banners: [],
  notify: (banner) => {
    if (useSystemControls.getState().focusOn) return;
    const id = nextId++;
    set((state) => ({
      banners: [{ ...banner, id }, ...state.banners].slice(0, MAX_BANNERS),
    }));
    setTimeout(() => get().dismiss(id), BANNER_DURATION_MS);
  },
  dismiss: (id) =>
    set((state) => ({ banners: state.banners.filter((b) => b.id !== id) })),
}));

export const notify = (banner: Omit<Banner, "id">) =>
  useNotifications.getState().notify(banner);
