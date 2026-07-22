import { create } from "zustand";
import type { WindowState, DesktopIcon } from "./types";
import { getApp, getDesktopIconsFromRegistry } from "./app-registry";

interface WindowManagerState {
  windows: WindowState[];
  nextZIndex: number;
  nextProcessId: number;
  activeWindowId: string | null;
  desktopIcons: DesktopIcon[];
  isShutdown: boolean;
  wallpaper: string;
  taskbarTransparency: number;
  aeroEffects: boolean;

  openWindow: (window: Omit<WindowState, "zIndex" | "isActive">) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  setActiveWindow: (id: string) => void;
  updateWindowPosition: (
    id: string,
    position: { x: number; y: number },
  ) => void;
  updateWindowSize: (
    id: string,
    size: { width: number; height: number },
  ) => void;
  updateIconPosition: (id: string, position: { x: number; y: number }) => void;
  shutdown: () => void;
  restart: () => void;
  setWallpaper: (wallpaper: string) => void;
  setTaskbarTransparency: (transparency: number) => void;
  setAeroEffects: (enabled: boolean) => void;
  loadState: () => void;
  saveState: () => void;
}

const DESKTOP_LAYOUT_VERSION = 3;
const DEFAULT_ICONS: DesktopIcon[] = getDesktopIconsFromRegistry();

function estimateMemoryMb(component: string, id: string) {
  const seed = `${component}:${id}`
    .split("")
    .reduce((total, char) => total + char.charCodeAt(0), 0);
  return 42 + (seed % 96);
}

function serializeWindows(windows: WindowState[]) {
  return windows.map((window) => ({
    id: window.id,
    processId: window.processId,
    appId: window.appId,
    title: window.title,
    icon: window.icon,
    component: window.component,
    status: window.status,
    startedAt: window.startedAt,
    lastActiveAt: window.lastActiveAt,
    memoryMb: window.memoryMb,
    isMinimized: window.isMinimized,
    isMaximized: window.isMaximized,
    position: window.position,
    size: window.size,
    disableMaximize: window.disableMaximize,
    metadata: window.metadata,
  }));
}

function mergeSavedDesktopIcons(savedIcons: DesktopIcon[]) {
  const savedById = new Map(savedIcons.map((icon) => [icon.id, icon]));
  const defaultIds = new Set(DEFAULT_ICONS.map((icon) => icon.id));

  const mergedDefaults = DEFAULT_ICONS.map((defaultIcon) => {
    const savedIcon = savedById.get(defaultIcon.id);
    return savedIcon?.position
      ? { ...defaultIcon, position: savedIcon.position }
      : defaultIcon;
  });

  const customIcons = savedIcons.filter((icon) => !defaultIds.has(icon.id));
  return [...mergedDefaults, ...customIcons];
}

export const useWindowManager = create<WindowManagerState>((set, get) => ({
  windows: [],
  nextZIndex: 100,
  nextProcessId: 1000,
  activeWindowId: null,
  desktopIcons: DEFAULT_ICONS,
  isShutdown: false,
  wallpaper: "url('/xp.jpg')",
  taskbarTransparency: 85,
  aeroEffects: true,
  loadState: () => {
    if (typeof window === "undefined") return;

    const savedState = localStorage.getItem("win7-desktop-state-v4");
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        const savedIcons = Array.isArray(parsed.desktopIcons)
          && parsed.desktopLayoutVersion === DESKTOP_LAYOUT_VERSION
          ? parsed.desktopIcons
          : DEFAULT_ICONS;
        const savedWindows = Array.isArray(parsed.windows)
          ? (parsed.windows as WindowState[])
          : [];
        const nextProcessId = savedWindows.reduce(
          (nextId, window) => Math.max(nextId, (window.processId ?? 999) + 1),
          parsed.nextProcessId ?? 1000,
        );
        set({
          desktopIcons: mergeSavedDesktopIcons(savedIcons),
          windows: savedWindows.map((window, index) => ({
            ...window,
            isActive: false,
            zIndex: 100 + index,
            status: window.isMinimized ? "minimized" : "running",
          })),
          nextZIndex: 100 + savedWindows.length,
          nextProcessId,
          activeWindowId: null,
          isShutdown: parsed.isShutdown || false,
          wallpaper: parsed.wallpaper || get().wallpaper,
          taskbarTransparency: parsed.taskbarTransparency ?? 85,
          aeroEffects: parsed.aeroEffects ?? true,
        });
      } catch (e) {
        console.error("[v0] Failed to load state:", e);
      }
    }
  },

  saveState: () => {
    if (typeof window === "undefined") return;

    const state = get();
    const stateToSave = {
      desktopIcons: state.desktopIcons,
      desktopLayoutVersion: DESKTOP_LAYOUT_VERSION,
      windows: serializeWindows(state.windows),
      nextProcessId: state.nextProcessId,
      isShutdown: state.isShutdown,
      wallpaper: state.wallpaper,
      taskbarTransparency: state.taskbarTransparency,
      aeroEffects: state.aeroEffects,
    };

    localStorage.setItem("win7-desktop-state-v4", JSON.stringify(stateToSave));
  },

  updateIconPosition: (id, position) => {
    set((state) => ({
      desktopIcons: state.desktopIcons.map((icon) =>
        icon.id === id ? { ...icon, position } : icon,
      ),
    }));
    get().saveState();
  },

  shutdown: () => {
    set({ isShutdown: true });
    get().saveState();
  },

  restart: () => {
    set({ isShutdown: false });
    get().saveState();
  },

  setWallpaper: (wallpaper) => {
    set({ wallpaper });
    get().saveState();
  },

  setTaskbarTransparency: (transparency) => {
    set({ taskbarTransparency: transparency });
    get().saveState();
  },

  setAeroEffects: (enabled) => {
    set({ aeroEffects: enabled });
    get().saveState();
  },

  openWindow: (window) => {
    set((state) => {
      // Check if window already exists
      const existingWindow = state.windows.find((w) => w.id === window.id);
      if (existingWindow) {
        // Restore and activate existing window
        return {
          windows: state.windows.map((w) =>
            w.id === window.id
              ? {
                  ...w,
                  isMinimized: false,
                  isActive: true,
                  status: "running",
                  lastActiveAt: new Date().toISOString(),
                  zIndex: state.nextZIndex,
                }
              : { ...w, isActive: false },
          ),
          nextZIndex: state.nextZIndex + 1,
          activeWindowId: window.id,
        };
      }

      const app = getApp(window.id);
      const now = new Date().toISOString();
      // Create new window
      return {
        windows: [
          ...state.windows.map((w) => ({ ...w, isActive: false })),
          {
            ...window,
            appId: app?.id ?? window.id,
            processId: state.nextProcessId,
            status: "running",
            startedAt: now,
            lastActiveAt: now,
            memoryMb: estimateMemoryMb(window.component, window.id),
            zIndex: state.nextZIndex,
            isActive: true,
          },
        ],
        nextZIndex: state.nextZIndex + 1,
        nextProcessId: state.nextProcessId + 1,
        activeWindowId: window.id,
      };
    });
    get().saveState();
  },

  closeWindow: (id) => {
    set((state) => ({
      windows: state.windows.filter((w) => w.id !== id),
      activeWindowId: state.activeWindowId === id ? null : state.activeWindowId,
    }));
    get().saveState();
  },

  minimizeWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id
          ? { ...w, isMinimized: true, isActive: false, status: "minimized" }
          : w,
      ),
      activeWindowId: state.activeWindowId === id ? null : state.activeWindowId,
    }));
    get().saveState();
  },

  maximizeWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, isMaximized: !w.isMaximized } : w,
      ),
    }));
    get().saveState();
  },

  restoreWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id
          ? {
              ...w,
              isMinimized: false,
              isActive: true,
              status: "running",
              lastActiveAt: new Date().toISOString(),
              zIndex: state.nextZIndex,
            }
          : { ...w, isActive: false },
      ),
      nextZIndex: state.nextZIndex + 1,
      activeWindowId: id,
    }));
    get().saveState();
  },

  setActiveWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id
          ? {
              ...w,
              isActive: true,
              status: w.isMinimized ? "minimized" : "running",
              lastActiveAt: new Date().toISOString(),
              zIndex: state.nextZIndex,
            }
          : { ...w, isActive: false },
      ),
      nextZIndex: state.nextZIndex + 1,
      activeWindowId: id,
    }));
    get().saveState();
  },

  updateWindowPosition: (id, position) => {
    set((state) => ({
      windows: state.windows.map((w) => (w.id === id ? { ...w, position } : w)),
    }));
    get().saveState();
  },

  updateWindowSize: (id, size) => {
    set((state) => ({
      windows: state.windows.map((w) => (w.id === id ? { ...w, size } : w)),
    }));
    get().saveState();
  },
}));
