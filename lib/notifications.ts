import { create } from "zustand";
import { useSystemControls } from "./system-controls";

// Notifications, macOS/iOS style. Each one shows briefly as a banner and
// stays in Notification Center and on the lock screen until it's opened or
// cleared — including on the next visit. Focus mode skips the banner (and
// its sound) but still delivers it, as iOS does.
export interface Notice {
  id: string;
  appId: string;
  title: string;
  body: string;
  at: number; // delivered, ms since epoch
}

const BANNER_DURATION_MS = 5000;
const MAX_BANNERS = 3;
const MAX_NOTICES = 20;
const STORAGE_KEY = "muneebos-notifications-v1";
let seq = 0;

interface NotificationState {
  banners: Notice[];
  notices: Notice[]; // unread, newest first
  // An app to open once the lock screen has gone, from a tapped notification.
  pendingOpen: string | null;
  notify: (notice: Omit<Notice, "id" | "at">) => void;
  dismiss: (id: string) => void; // hides the banner; the notice stays
  remove: (id: string) => void; // opened or cleared: gone everywhere
  clearAll: () => void;
  setPendingOpen: (appId: string | null) => void;
  loadNotifications: () => void;
}

// The chime when a banner drops in, at the Control Center Sound volume.
// Browsers only allow it after the visitor has interacted with the page;
// unlocking counts, so it's quietly skipped only before that.
let chime: HTMLAudioElement | null = null;
function playChime() {
  const volume = useSystemControls.getState().volume;
  if (volume <= 0 || typeof Audio === "undefined") return;
  try {
    chime ??= new Audio("/sounds/notification.m4a");
    chime.volume = volume;
    chime.currentTime = 0;
    void chime.play().catch(() => {});
  } catch {
    /* audio unavailable */
  }
}

const save = (notices: Notice[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notices));
  } catch {
    /* storage unavailable */
  }
};

export const useNotifications = create<NotificationState>((set, get) => ({
  banners: [],
  notices: [],
  pendingOpen: null,
  notify: (notice) => {
    const full: Notice = { ...notice, id: `${Date.now()}-${seq++}`, at: Date.now() };
    const notices = [full, ...get().notices].slice(0, MAX_NOTICES);
    set({ notices });
    save(notices);
    if (useSystemControls.getState().focusOn) return;
    set((state) => ({ banners: [full, ...state.banners].slice(0, MAX_BANNERS) }));
    playChime();
    setTimeout(() => get().dismiss(full.id), BANNER_DURATION_MS);
  },
  dismiss: (id) =>
    set((state) => ({ banners: state.banners.filter((b) => b.id !== id) })),
  remove: (id) => {
    const notices = get().notices.filter((n) => n.id !== id);
    set((state) => ({ notices, banners: state.banners.filter((b) => b.id !== id) }));
    save(notices);
  },
  clearAll: () => {
    set({ notices: [], banners: [] });
    save([]);
  },
  setPendingOpen: (pendingOpen) => set({ pendingOpen }),
  loadNotifications: () => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      if (Array.isArray(saved)) set({ notices: saved.slice(0, MAX_NOTICES) });
    } catch {
      /* corrupted — start empty */
    }
  },
}));

export const notify = (notice: Omit<Notice, "id" | "at">) =>
  useNotifications.getState().notify(notice);

// "now", "5m ago", "3h ago", "Yesterday", then the weekday or date.
export function timeAgo(at: number, now = Date.now()) {
  const minutes = Math.floor((now - at) / 60_000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m ago`;
  const then = new Date(at);
  const today = new Date(now);
  const days = Math.round(
    (new Date(today.toDateString()).getTime() - new Date(then.toDateString()).getTime()) /
      86_400_000,
  );
  if (days === 0) return `${Math.floor(minutes / 60)}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return then.toLocaleDateString("en-GB", { weekday: "long" });
  return then.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
